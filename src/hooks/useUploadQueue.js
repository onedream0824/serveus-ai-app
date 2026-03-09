import React, { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Upload from '../services/BackgroundUpload';
import { handleImageResult } from '../utils/imagePicker';
import { makePhotoId } from '../utils/format';
import { loadUploadQueue, saveUploadQueue } from '../storage/uploadQueueStorage';
import { startBackgroundUpload } from '../services/backgroundUploadService';

function parseUploadResponse(responseBody) {
  try {
    const parsed = (responseBody && JSON.parse(responseBody)) || {};
    return {
      fileId: typeof parsed.file_id === 'string' ? parsed.file_id : undefined,
      fileUrl: typeof parsed.file_url === 'string' ? parsed.file_url : undefined,
    };
  } catch {
    return null;
  }
}

function applyPendingUploads(currentQueue, pendingUploads) {
  const updated = currentQueue.map((photo) => {
    const pending = pendingUploads.find((p) => p.uploadId === photo.uploadId);
    if (!pending) return photo;
    if (pending.status === 'completed') {
      const result = parseUploadResponse(pending.response);
      if (result) return { ...photo, status: 'Success', fileId: result.fileId, fileUrl: result.fileUrl };
      return { ...photo, status: 'Failed', error: 'Invalid server response' };
    }
    if (pending.status === 'failed') return { ...photo, status: 'Failed', error: pending.error || 'Upload failed' };
    return photo;
  });
  const toasts = [];
  pendingUploads.forEach((pending) => {
    const photo = updated.find((p) => p.uploadId === pending.uploadId);
    if (!photo) return;
    if (pending.status === 'completed') toasts.push({ type: 'success', text2: photo.fileName || 'Photo' });
    else if (pending.status === 'failed') toasts.push({ type: 'error', text2: pending.error || 'Unknown error' });
  });
  return { updated, toasts };
}

function showUploadToasts(toasts) {
  if (toasts.length === 0) return;
  setTimeout(() => {
    toasts.forEach((t) =>
      Toast.show({
        type: t.type,
        text1: t.type === 'success' ? 'Upload completed' : 'Upload failed',
        text2: t.text2,
      }),
    );
  }, 0);
}

export function useUploadQueue(options = {}) {
  const { onPhotoCaptured } = options;
  const [uploadQueue, setUploadQueue] = React.useState([]);
  const processingIdRef = useRef(null);

  const addToQueue = useCallback((uri, fileName, type) => {
    setUploadQueue((prev) => [
      ...prev,
      { id: makePhotoId(), uri, fileName, type, status: 'Queued', timestamp: Date.now() },
    ]);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadUploadQueue();
      if (!mounted) return;
      if (stored.length > 0) setUploadQueue(stored);
      if (stored.length > 0) {
        try {
          const pendingUploads = await Upload.checkPendingUploads();
          if (pendingUploads.length > 0) {
            const { updated, toasts } = applyPendingUploads(stored, pendingUploads);
            setUploadQueue(updated);
            showUploadToasts(toasts);
          }
        } catch (err) {
          if (__DEV__) console.warn('Could not check pending uploads:', err);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    saveUploadQueue(uploadQueue);
  }, [uploadQueue]);

  const checkAndProcessPendingUploads = useCallback(async () => {
    try {
      const pendingUploads = await Upload.checkPendingUploads();
      if (pendingUploads.length === 0) return;
      setUploadQueue((prev) => {
        const { updated, toasts } = applyPendingUploads(prev, pendingUploads);
        showUploadToasts(toasts);
        return updated;
      });
    } catch (err) {
      if (__DEV__) console.warn('Could not check pending uploads:', err);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active') {
          Upload.reconnectSession()
            .then(() => {
              setTimeout(() => {
                checkAndProcessPendingUploads();
              }, 500);
            })
            .catch(() => {
              checkAndProcessPendingUploads();
            });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [checkAndProcessPendingUploads]);
  
  useEffect(() => {
    Upload.reconnectSession()
      .then(() => setTimeout(checkAndProcessPendingUploads, 1000))
      .catch(() => checkAndProcessPendingUploads());
  }, [checkAndProcessPendingUploads]);

  const setPhotoStatus = useCallback(
    (id, status, extra) => {
      setUploadQueue((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                ...(extra?.error !== undefined && { error: extra.error }),
                ...(extra?.fileId !== undefined && { fileId: extra.fileId }),
                ...(extra?.fileUrl !== undefined && { fileUrl: extra.fileUrl }),
                ...(extra?.uploadId !== undefined && { uploadId: extra.uploadId }),
                ...(extra && 'progress' in extra && { progress: extra.progress }),
              }
            : p,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const firstQueued = uploadQueue.find((p) => p.status === 'Queued');
    if (!firstQueued) {
      processingIdRef.current = null;
      return;
    }
    if (processingIdRef.current === firstQueued.id) return;
    processingIdRef.current = firstQueued.id;

    const photo = firstQueued;
    const label = photo.fileName ?? 'Photo';
    setUploadQueue((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, status: 'Uploading' } : p)),
    );

    setTimeout(() => {
      Toast.show({ type: 'info', text1: 'Upload started', text2: label });
    }, 0);

    startBackgroundUpload(photo.id, {
      uri: photo.uri,
      fileName: photo.fileName,
      type: photo.type,
    })
      .then((uploadId) => {
        setPhotoStatus(photo.id, 'Uploading', { uploadId });

        let completedSub;
        let errorSub;
        let progressSub;

        const removeAllListeners = () => {
          completedSub?.remove();
          errorSub?.remove();
          progressSub?.remove();
        };

        const handleProgress = (data) => {
          const pct = typeof data.progress === 'number' ? Math.round(data.progress) : undefined;
          if (pct !== undefined) {
            setPhotoStatus(photo.id, 'Uploading', { progress: pct });
          }
        };

        const handleCompleted = (data) => {
          const result = parseUploadResponse(data.responseBody ?? '');
          if (result) {
            if (__DEV__) console.log('[Upload] Server response:', { fileName: label, ...result });
            setPhotoStatus(photo.id, 'Success', { fileId: result.fileId, fileUrl: result.fileUrl, progress: undefined });
            Toast.show({ type: 'success', text1: 'Upload successful', text2: label });
          } else {
            setPhotoStatus(photo.id, 'Failed', { error: 'Invalid server response', progress: undefined });
            Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Invalid server response' });
          }
          removeAllListeners();
          processingIdRef.current = null;
        };

        const handleError = (event) => {
          const message =
            (event && event.error) || 'Upload failed';
          if (__DEV__) console.warn('[Upload] Upload failed:', { fileName: label, error: message });
          setPhotoStatus(photo.id, 'Failed', { error: message, progress: undefined });
          Toast.show({
            type: 'error',
            text1: 'Upload failed',
            text2: message,
          });
          removeAllListeners();
          processingIdRef.current = null;
        };

        progressSub = Upload.addListener('progress', uploadId, handleProgress);
        completedSub = Upload.addListener('completed', uploadId, handleCompleted);
        errorSub = Upload.addListener('error', uploadId, handleError);
      })
      .catch((startErr) => {
        const message = startErr?.message ?? 'Upload failed to start';
        setPhotoStatus(photo.id, 'Failed', { error: message, progress: undefined });
        Toast.show({
          type: 'error',
          text1: 'Upload failed to start',
          text2: message,
        });
        processingIdRef.current = null;
      });
  }, [uploadQueue, setPhotoStatus]);

  const onOpenCamera = useCallback(() => {
    launchCamera({ mediaType: 'photo', saveToPhotos: false }, (res) => {
      const data = handleImageResult(res);
      if (data) {
        addToQueue(data.uri, data.fileName, data.type);
        onPhotoCaptured?.(data.uri);
      }
    });
  }, [addToQueue, onPhotoCaptured]);

  const openCameraForVoicePhoto = useCallback((onCaptured) => {
    launchCamera({ mediaType: 'photo', saveToPhotos: false }, (res) => {
      const data = handleImageResult(res);
      if (data && onCaptured) {
        onCaptured(data.uri);
        return;
      }
      if (res?.errorCode && onCaptured) {
        launchImageLibrary({ mediaType: 'photo' }, (libRes) => {
          const libData = handleImageResult(libRes);
          if (libData) onCaptured(libData.uri);
        });
      }
    });
  }, []);

  const openGalleryForLastPhotos = useCallback((count, onSelected) => {
    const limit = Math.min(Math.max(1, Number(count) || 1), 10);
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: limit },
      (res) => {
        if (res.didCancel || res.errorCode) {
          onSelected?.([]);
          return;
        }
        const uris = (res.assets || [])
          .filter((a) => a?.uri)
          .map((a) => a.uri);
        onSelected?.(uris);
      }
    );
  }, []);

  return {
    onOpenCamera,
    openCameraForVoicePhoto,
    openGalleryForLastPhotos,
  };
}

import React, { useCallback, useEffect, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Upload from 'react-native-background-upload';
import type { UploadPhoto, UploadPhotoStatus } from '../types/upload';
import { handleImageResult } from '../utils/imagePicker';
import { makePhotoId } from '../utils/format';
import { loadUploadQueue, saveUploadQueue } from '../storage/uploadQueueStorage';
import { startBackgroundUpload } from '../services/backgroundUploadService';

export function useUploadQueue() {
  const [uploadQueue, setUploadQueue] = React.useState<UploadPhoto[]>([]);
  const processingIdRef = useRef<string | null>(null);

  const addToQueue = useCallback((uri: string, fileName?: string, type?: string) => {
    const photo: UploadPhoto = {
      id: makePhotoId(),
      uri,
      fileName,
      type,
      status: 'Queued',
      timestamp: Date.now(),
    };
    setUploadQueue((prev) => [...prev, photo]);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadUploadQueue();
      if (mounted && stored.length > 0) {
        setUploadQueue(stored);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveUploadQueue(uploadQueue);
  }, [uploadQueue]);

  const setPhotoStatus = useCallback(
    (
      id: string,
      status: UploadPhotoStatus,
      extra?: { error?: string; fileId?: string; fileUrl?: string; uploadId?: string },
    ) => {
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
    setUploadQueue((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, status: 'Uploading' as const } : p)),
    );

    const label = photo.fileName ?? 'Photo';
    Toast.show({ type: 'info', text1: 'Upload started', text2: label });

    startBackgroundUpload(photo.id, {
      uri: photo.uri,
      fileName: photo.fileName,
      type: photo.type,
    })
      .then((uploadId) => {
        setPhotoStatus(photo.id, 'Uploading', { uploadId });

        let completedSub: { remove: () => void } | undefined;
        let errorSub: { remove: () => void } | undefined;

        const handleCompleted = (data: any) => {
          try {
            const body = data.responseBody ?? '';
            const parsed = body ? JSON.parse(body) : {};
            const fileId =
              typeof parsed.file_id === 'string' ? (parsed.file_id as string) : undefined;
            const fileUrl =
              typeof parsed.file_url === 'string' ? (parsed.file_url as string) : undefined;

            setPhotoStatus(photo.id, 'Success', { fileId, fileUrl });
            Toast.show({ type: 'success', text1: 'Upload successful', text2: label });
          } catch {
            setPhotoStatus(photo.id, 'Failed', { error: 'Invalid server response' });
            Toast.show({
              type: 'error',
              text1: 'Upload failed',
              text2: 'Invalid server response',
            });
          } finally {
            completedSub?.remove();
            errorSub?.remove();
            processingIdRef.current = null;
          }
        };

        const handleError = (event: any) => {
          const message =
            (event && (event.error as string | undefined)) || 'Upload failed';
          setPhotoStatus(photo.id, 'Failed', { error: message });
          Toast.show({
            type: 'error',
            text1: 'Upload failed',
            text2: message,
          });
          completedSub?.remove();
          errorSub?.remove();
          processingIdRef.current = null;
        };

        completedSub = Upload.addListener('completed', uploadId, handleCompleted) as any;
        errorSub = Upload.addListener('error', uploadId, handleError) as any;
      })
      .catch((startErr) => {
        const message = startErr?.message ?? 'Upload failed to start';
        setPhotoStatus(photo.id, 'Failed', { error: message });
        Toast.show({
          type: 'error',
          text1: 'Upload failed to start',
          text2: message,
        });
        processingIdRef.current = null;
      });
  }, [uploadQueue, setPhotoStatus]);

  const retryUpload = useCallback((photoId: string) => {
    setUploadQueue((prev) =>
      prev.map((p) =>
        p.id === photoId && p.status === 'Failed'
          ? { ...p, status: 'Queued' as const, error: undefined }
          : p,
      ),
    );
  }, []);

  const onOpenCamera = useCallback(() => {
    launchCamera({ mediaType: 'photo', saveToPhotos: false }, (res) => {
      const data = handleImageResult(res);
      if (data) addToQueue(data.uri, data.fileName, data.type);
    });
  }, [addToQueue]);

  const onChooseFromGallery = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      const data = handleImageResult(res);
      if (data) addToQueue(data.uri, data.fileName, data.type);
    });
  }, [addToQueue]);

  return {
    uploadQueue,
    addToQueue,
    onOpenCamera,
    onChooseFromGallery,
    retryUpload,
  };
}

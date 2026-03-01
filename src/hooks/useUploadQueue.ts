import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Upload from '../services/BackgroundUpload';
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

      if (mounted && stored.length > 0) {
        try {
          const pendingUploads: Array<Record<string, string>> =
            await Upload.checkPendingUploads();
          if (pendingUploads.length > 0) {
            setUploadQueue((prev) => {
              const updated = prev.map((photo) => {
                const pending = pendingUploads.find(
                  (p) => p.uploadId === photo.uploadId,
                );
                if (!pending) return photo;

                if (pending.status === 'completed') {
                  try {
                    const response = pending.response || '';
                    const parsed = response ? JSON.parse(response) : {};
                    const fileId =
                      typeof parsed.file_id === 'string'
                        ? (parsed.file_id as string)
                        : undefined;
                    const fileUrl =
                      typeof parsed.file_url === 'string'
                        ? (parsed.file_url as string)
                        : undefined;

                    return {
                      ...photo,
                      status: 'Success' as const,
                      fileId,
                      fileUrl,
                    };
                  } catch {
                    return {
                      ...photo,
                      status: 'Failed' as const,
                      error: 'Invalid server response',
                    };
                  }
                } else if (pending.status === 'failed') {
                  return {
                    ...photo,
                    status: 'Failed' as const,
                    error: pending.error || 'Upload failed',
                  };
                }

                return photo;
              });

              return updated;
            });

            const toasts: Array<{ type: 'success' | 'error'; text2: string }> = [];
            pendingUploads.forEach((pending) => {
              const photo = stored.find((p) => p.uploadId === pending.uploadId);
              if (!photo) return;
              if (pending.status === 'completed') {
                toasts.push({ type: 'success', text2: photo.fileName || 'Photo' });
              } else if (pending.status === 'failed') {
                toasts.push({ type: 'error', text2: pending.error || 'Unknown error' });
              }
            });
            if (toasts.length > 0) {
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
          }
        } catch (error) {
          console.log('Could not check pending uploads:', error);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveUploadQueue(uploadQueue);
  }, [uploadQueue]);

  const checkAndProcessPendingUploads = useCallback(async () => {
    try {
      const pendingUploads: Array<Record<string, string>> =
        await Upload.checkPendingUploads();
      if (pendingUploads.length === 0) return;

      setUploadQueue((prev) => {
        const updated = prev.map((photo) => {
          const pending = pendingUploads.find(
            (p) => p.uploadId === photo.uploadId,
          );
          if (!pending) return photo;

          if (pending.status === 'completed') {
            try {
              const response = pending.response || '';
              const parsed = response ? JSON.parse(response) : {};
              const fileId =
                typeof parsed.file_id === 'string'
                  ? (parsed.file_id as string)
                  : undefined;
              const fileUrl =
                typeof parsed.file_url === 'string'
                  ? (parsed.file_url as string)
                  : undefined;

              return {
                ...photo,
                status: 'Success' as const,
                fileId,
                fileUrl,
              };
            } catch {
              return {
                ...photo,
                status: 'Failed' as const,
                error: 'Invalid server response',
              };
            }
          } else if (pending.status === 'failed') {
            return {
              ...photo,
              status: 'Failed' as const,
              error: pending.error || 'Upload failed',
            };
          }

          return photo;
        });

        const toasts: Array<{ type: 'success' | 'error'; text2: string }> = [];
        pendingUploads.forEach((pending) => {
          const photo = updated.find((p) => p.uploadId === pending.uploadId);
          if (!photo) return;
          if (pending.status === 'completed') {
            toasts.push({ type: 'success', text2: photo.fileName || 'Photo' });
          } else if (pending.status === 'failed') {
            toasts.push({ type: 'error', text2: pending.error || 'Unknown error' });
          }
        });
        if (toasts.length > 0) {
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

        return updated;
      });
    } catch (error) {
      console.log('Could not check pending uploads:', error);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
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
      .then(() => {
        setTimeout(() => {
          checkAndProcessPendingUploads();
        }, 1000);
      })
      .catch(() => {
      });
  }, [checkAndProcessPendingUploads]);

  const setPhotoStatus = useCallback(
    (
      id: string,
      status: UploadPhotoStatus,
      extra?: {
        error?: string;
        fileId?: string;
        fileUrl?: string;
        uploadId?: string;
        progress?: number;
      },
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
      prev.map((p) => (p.id === photo.id ? { ...p, status: 'Uploading' as const } : p)),
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

        let completedSub: { remove: () => void } | undefined;
        let errorSub: { remove: () => void } | undefined;
        let progressSub: { remove: () => void } | undefined;

        const removeAllListeners = () => {
          completedSub?.remove();
          errorSub?.remove();
          progressSub?.remove();
        };

        const handleProgress = (data: { progress?: number }) => {
          const pct = typeof data.progress === 'number' ? Math.round(data.progress) : undefined;
          if (pct !== undefined) {
            setPhotoStatus(photo.id, 'Uploading', { progress: pct });
          }
        };

        const handleCompleted = (data: any) => {
          try {
            const body = data.responseBody ?? '';
            const parsed = body ? JSON.parse(body) : {};
            const fileId =
              typeof parsed.file_id === 'string' ? (parsed.file_id as string) : undefined;
            const fileUrl =
              typeof parsed.file_url === 'string' ? (parsed.file_url as string) : undefined;

            console.log('[Upload] Server response:', {
              fileName: label,
              time: new Date().toISOString(),
              responseBody: body,
              parsed,
              fileId,
              fileUrl,
            });

            setPhotoStatus(photo.id, 'Success', {
              fileId,
              fileUrl,
              progress: undefined,
            });
            Toast.show({ type: 'success', text1: 'Upload successful', text2: label });
          } catch {
            setPhotoStatus(photo.id, 'Failed', {
              error: 'Invalid server response',
              progress: undefined,
            });
            Toast.show({
              type: 'error',
              text1: 'Upload failed',
              text2: 'Invalid server response',
            });
          } finally {
            removeAllListeners();
            processingIdRef.current = null;
          }
        };

        const handleError = (event: any) => {
          const message =
            (event && (event.error as string | undefined)) || 'Upload failed';
          console.log('[Upload] Upload failed:', {
            fileName: label,
            time: new Date().toISOString(),
            error: message,
            event,
          });
          setPhotoStatus(photo.id, 'Failed', { error: message, progress: undefined });
          Toast.show({
            type: 'error',
            text1: 'Upload failed',
            text2: message,
          });
          removeAllListeners();
          processingIdRef.current = null;
        };

        progressSub = Upload.addListener('progress', uploadId, handleProgress) as any;
        completedSub = Upload.addListener('completed', uploadId, handleCompleted) as any;
        errorSub = Upload.addListener('error', uploadId, handleError) as any;
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

import React, { useCallback, useEffect, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { uploadPhotoAsync } from '../services/uploadService';
import type { UploadPhoto, UploadPhotoStatus } from '../types/upload';
import { handleImageResult } from '../utils/imagePicker';
import { makePhotoId } from '../utils/format';

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

  const setPhotoStatus = useCallback(
    (
      id: string,
      status: UploadPhotoStatus,
      extra?: { error?: string; fileId?: string; fileUrl?: string }
    ) => {
      setUploadQueue((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status, ...(extra?.error !== undefined && { error: extra.error }), ...(extra?.fileId !== undefined && { fileId: extra.fileId }), ...(extra?.fileUrl !== undefined && { fileUrl: extra.fileUrl }) } : p
        )
      );
    },
    []
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
      prev.map((p) => (p.id === photo.id ? { ...p, status: 'Uploading' as const } : p))
    );

    const label = photo.fileName ?? 'Photo';
    Toast.show({ type: 'info', text1: 'Upload started', text2: label });

    uploadPhotoAsync(photo.uri, { fileName: photo.fileName, type: photo.type })
      .then((result) => {
        setPhotoStatus(photo.id, 'Success', {
          fileId: result.fileId,
          fileUrl: result.fileUrl,
        });
        processingIdRef.current = null;
        Toast.show({ type: 'success', text1: 'Upload successful', text2: label });
      })
      .catch((err) => {
        setPhotoStatus(photo.id, 'Failed', { error: err?.message ?? 'Upload failed' });
        processingIdRef.current = null;
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: err?.message ?? label,
        });
      });
  }, [uploadQueue, setPhotoStatus]);

  const retryUpload = useCallback((photoId: string) => {
    setUploadQueue((prev) =>
      prev.map((p) => (p.id === photoId && p.status === 'Failed' ? { ...p, status: 'Queued' as const, error: undefined } : p))
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

import React, { useCallback, useEffect, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { uploadPhotoAsync } from '../services/uploadService';
import type { UploadJob, UploadJobStatus } from '../types/upload';
import { handleImageResult } from '../utils/imagePicker';
import { makeJobId } from '../utils/format';

export function useUploadQueue() {
  const [uploadQueue, setUploadQueue] = React.useState<UploadJob[]>([]);
  const processingIdRef = useRef<string | null>(null);

  const addToQueue = useCallback((uri: string, fileName?: string, type?: string) => {
    const job: UploadJob = {
      id: makeJobId(),
      uri,
      fileName,
      type,
      status: 'Queued',
      timestamp: Date.now(),
    };
    setUploadQueue((prev) => [...prev, job]);
  }, []);

  const setJobStatus = useCallback((id: string, status: UploadJobStatus, error?: string) => {
    setUploadQueue((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status, error } : j))
    );
  }, []);

  useEffect(() => {
    const firstQueued = uploadQueue.find((j) => j.status === 'Queued');
    if (!firstQueued) {
      processingIdRef.current = null;
      return;
    }
    if (processingIdRef.current === firstQueued.id) return;
    processingIdRef.current = firstQueued.id;

    const job = firstQueued;
    setUploadQueue((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'Uploading' as const } : j))
    );

    const label = job.fileName ?? 'Photo';
    Toast.show({ type: 'info', text1: 'Upload started', text2: label });

    uploadPhotoAsync(job.uri, { fileName: job.fileName, type: job.type })
      .then(() => {
        setJobStatus(job.id, 'Success');
        processingIdRef.current = null;
        Toast.show({ type: 'success', text1: 'Upload successful', text2: label });
      })
      .catch((err) => {
        setJobStatus(job.id, 'Failed', err?.message ?? 'Upload failed');
        processingIdRef.current = null;
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: err?.message ?? label,
        });
      });
  }, [uploadQueue, setJobStatus]);

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
  };
}

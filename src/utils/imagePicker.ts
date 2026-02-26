import { Alert } from 'react-native';
import type { ImagePickerResponse } from 'react-native-image-picker';

export function handleImageResult(result: ImagePickerResponse): {
  uri: string;
  fileName?: string;
  type?: string;
} | null {
  if (result.didCancel) return null;
  if (result.errorCode) {
    Alert.alert('Error', result.errorMessage ?? 'Failed to get image');
    return null;
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    type: asset.type ?? undefined,
  };
}

import { Alert } from 'react-native';

export function handleImageResult(result) {
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

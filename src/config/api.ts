import Config from 'react-native-config';

const DEFAULT_API_BASE = 'https://api-dev.serveus.ai/api';

export const API_BASE_URL =
  (Config.API_BASE_URL && Config.API_BASE_URL.trim()) || DEFAULT_API_BASE;
  
export const UPLOAD_ENDPOINT = `${API_BASE_URL}/Utilities/upload`;

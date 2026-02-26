import type { UploadJobStatus } from '../types/upload';
import { colors } from './colors';

export function getStatusStyle(status: UploadJobStatus): { bg: string; text: string } {
  switch (status) {
    case 'Queued':
      return { bg: colors.warningSoft, text: colors.warning };
    case 'Uploading':
      return { bg: colors.infoSoft, text: colors.info };
    case 'Success':
      return { bg: colors.successSoft, text: colors.success };
    case 'Failed':
      return { bg: colors.errorSoft, text: colors.error };
  }
}

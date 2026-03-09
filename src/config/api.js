import Config from 'react-native-config';

const DEFAULT_API_BASE = 'https://api-dev.serveus.ai/api';

export const API_BASE_URL =
  (Config.API_BASE_URL && Config.API_BASE_URL.trim()) || DEFAULT_API_BASE;

export const PLATFORM_KEY =
  (Config.PLATFORM_KEY && Config.PLATFORM_KEY.trim()) ||
  '2c400285-fd4a-4eff-b69e-c5efc1bad3d5';

export const MEMBERS_BASE = 'Members';
export const API_LOGIN = `${MEMBERS_BASE}/login`;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const APPOINTMENT_BASE = 'Appointment';
export const API_APPOINTMENTS_BY_CUSTOMER = `${APPOINTMENT_BASE}/get-appointments-by-customer-id`;
export const API_APPOINTMENTS_BY_SERVICE_PROVIDER = `${APPOINTMENT_BASE}/get-appointments-by-service-provider-id`;
export const API_APPOINTMENTS_BY_SERVICE_PROVIDER_USER = `${APPOINTMENT_BASE}/get-appointments-by-service-provider-user-id`;
export const API_MARK_APPOINTMENT_COMPLETED = `${APPOINTMENT_BASE}/mark-appointment-as-completed`;
export const API_UPDATE_APPOINTMENT = `${APPOINTMENT_BASE}/update-appointment`;
export const API_UPLOAD_PROOF_OF_WORK_V2 = `${APPOINTMENT_BASE}/upload-proof-of-work-V2`;

export const SERVICE_PROVIDER_BASE = 'ServiceProvider';
export const API_CUSTOMERS_PROFILES = `${SERVICE_PROVIDER_BASE}/customers/profiles`;

export const UTILITIES_BASE = 'Utilities';
export const API_UPLOAD = `${UTILITIES_BASE}/upload`;
export const UPLOAD_ENDPOINT = `${API_BASE_URL}/${API_UPLOAD}`;

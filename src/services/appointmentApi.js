import { request } from './api';
import {
  API_BASE_URL,
  APPOINTMENT_STATUS,
  API_APPOINTMENTS_BY_CUSTOMER,
  API_APPOINTMENTS_BY_SERVICE_PROVIDER,
  API_APPOINTMENTS_BY_SERVICE_PROVIDER_USER,
  API_MARK_APPOINTMENT_COMPLETED,
  API_UPDATE_APPOINTMENT,
  API_UPLOAD_PROOF_OF_WORK_V2,
  API_CUSTOMERS_PROFILES,
} from '../config/api';
import { getAuthHeaders } from './api';
import { MEMBER_TYPE } from '../constants/strings';

function getAppointmentsEndpoint(userData) {
  const mt = userData?.memberType;
  if (mt === MEMBER_TYPE.CUSTOMER) {
    return { path: API_APPOINTMENTS_BY_CUSTOMER, paramKey: 'customerId', paramValue: userData.customerId };
  }
  if (mt === MEMBER_TYPE.SERVICE_PROVIDER) {
    return { path: API_APPOINTMENTS_BY_SERVICE_PROVIDER, paramKey: 'serviceProviderId', paramValue: userData.serviceProviderId };
  }
  if (mt === MEMBER_TYPE.SERVICE_PROVIDER_WORKERS) {
    return { path: API_APPOINTMENTS_BY_SERVICE_PROVIDER_USER, paramKey: 'serviceProviderUserId', paramValue: userData.serviceProviderUserId };
  }
  return null;
}

function parseScheduledAt(dated, timeSlotFrom) {
  if (!dated) return Date.now();
  const d = new Date(dated);
  if (timeSlotFrom && typeof timeSlotFrom === 'string') {
    const [h, m] = timeSlotFrom.split(':').map(Number);
    if (!isNaN(h)) d.setHours(h, isNaN(m) ? 0 : m, 0, 0);
  }
  return d.getTime();
}

function mapStatus(apiStatus) {
  if (!apiStatus) return 'scheduled';
  const s = String(apiStatus).trim();
  if (s === APPOINTMENT_STATUS.COMPLETED) return 'completed';
  if (s === APPOINTMENT_STATUS.CANCELLED) return 'cancelled';
  if (s === APPOINTMENT_STATUS.ACTIVE) return 'in_progress';
  if (s === APPOINTMENT_STATUS.PENDING) return 'pending';
  if (s === APPOINTMENT_STATUS.SCHEDULED) return 'scheduled';
  const lower = s.toLowerCase();
  if (lower.includes('complete')) return 'completed';
  if (lower.includes('cancel')) return 'cancelled';
  if (lower.includes('active') || lower.includes('progress')) return 'in_progress';
  if (lower.includes('pending')) return 'pending';
  return 'scheduled';
}

function toAddressString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.address != null) return String(value.address);
  return '';
}

export function normalizeAppointment(item) {
  const appointmentId = item.appointmentId ?? item.id;
  const scheduledAt = parseScheduledAt(item.dated, item.timeSlotFrom);
  const address = toAddressString(item.address) || toAddressString(item.customerAddress) || toAddressString(item.streetAddress) || '';
  return {
    id: appointmentId,
    appointmentId,
    customerName: item.customerName ?? item.customer?.name ?? item.CustomerName ?? 'Customer',
    address,
    scheduledAt,
    status: mapStatus(item.status ?? item.Status),
    enRouteAt: item.enRouteAt ?? item.EnRouteAt ?? null,
    startedAt: item.startedAt ?? item.StartedAt ?? null,
    completedAt: item.completedAt ?? item.CompletedAt ?? null,
    serviceAgreementId: item.serviceAgreementId ?? item.ServiceAgreementId ?? null,
    customerId: item.customerId ?? item.CustomerId ?? null,
    serviceProviderId: item.serviceProviderId ?? item.ServiceProviderId ?? null,
    serviceProviderUserId: item.serviceProviderUserId ?? item.ServiceProviderUserId ?? null,
    dated: item.dated ?? item.Dated,
    timeSlotFrom: item.timeSlotFrom ?? item.TimeSlotFrom,
    timeSlotTo: item.timeSlotTo ?? item.TimeSlotTo,
  };
}

export async function getAppointments(token, userData, options = {}) {
  const ep = getAppointmentsEndpoint(userData);
  if (!ep || !ep.paramValue) {
    return [];
  }
  const query = {
    [ep.paramKey]: ep.paramValue,
    Page: String(options.page ?? 1),
    PageSize: String(options.pageSize ?? 50),
    Sorts: options.sorts ?? 'dated,timeSlotFrom',
  };
  if (options.filters != null && options.filters !== '') query.Filters = options.filters;

  const data = await request(ep.path, { method: 'GET', token, query });
  const rawList = Array.isArray(data) ? data : data?.items ?? data?.data ?? data?.results ?? [];
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeAppointment);
}

export async function getCustomerProfiles(token, options = {}) {
  const query = {
    Page: String(options.page ?? 1),
    PageSize: String(options.pageSize ?? 10),
  };
  if (options.sorts != null && options.sorts !== '') query.Sorts = options.sorts;
  if (options.filters != null && options.filters !== '') query.Filters = options.filters;
  const data = await request(API_CUSTOMERS_PROFILES, { method: 'GET', token, query });
  const raw = Array.isArray(data)
    ? data
    : data?.data?.items ?? data?.items ?? (Array.isArray(data?.data) ? data.data : null) ?? data?.results ?? [];
  return Array.isArray(raw) ? raw : [];
}

export async function getAppointmentsByCustomerId(token, customerId, options = {}) {
  const query = {
    customerId,
    Page: String(options.page ?? 1),
    PageSize: String(options.pageSize ?? 10),
    Sorts: options.sorts ?? 'dated,timeSlotFrom',
  };
  if (options.filters != null && options.filters !== '') query.Filters = options.filters;
  const data = await request(API_APPOINTMENTS_BY_CUSTOMER, { method: 'GET', token, query });
  const rawList = Array.isArray(data) ? data : data?.items ?? data?.data ?? data?.results ?? [];
  return rawList.map(normalizeAppointment);
}

export function buildUpdateAppointmentBody(updates, options = {}) {
  const now = new Date().toISOString();
  const appointment = options.appointment ?? {};
  const userData = options.userData ?? {};
  const serviceProviderUserId = userData.serviceProviderUserId;

  const body = {
    dated: appointment.dated ?? null,
    timeSlotFrom: appointment.timeSlotFrom ?? null,
    timeSlotTo: appointment.timeSlotTo ?? null,
    ...(updates.status != null && { status: updates.status }),
    statusDate: now,
    statusUpdatedBy: 0,
    proofofWorkPhoto: updates.proofofWorkPhoto ?? appointment.proofofWorkPhoto ?? null,
    proofofWorkText: updates.proofofWorkText ?? appointment.proofofWorkText ?? null,
    proofofWorkUploadedDate: updates.proofofWorkUploadedDate ?? appointment.proofofWorkUploadedDate ?? null,
    proofofWorkUploadedBy: 0,
    notes: updates.notes ?? appointment.notes ?? null,
    updatedDate: now,
    deletedBy: updates.deletedBy ?? null,
    ...(serviceProviderUserId != null && serviceProviderUserId !== '' && { serviceProviderUserId }),
  };
  return body;
}

export async function updateAppointment(token, appointmentId, body) {
  if (!appointmentId) throw new Error('appointmentId is required');
  await request(API_UPDATE_APPOINTMENT, {
    method: 'PUT',
    token,
    query: { appointmentId },
    body: body ?? {},
  });
}

export async function markAppointmentAsCompleted(token, appointmentId) {
  await request(API_MARK_APPOINTMENT_COMPLETED, {
    method: 'POST',
    token,
    query: { appointmentId },
  });
}

const EMPTY_PHOTO_PLACEHOLDER = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  name: 'placeholder.png',
  type: 'image/png',
};

export async function uploadProofOfWorkV2(token, { serviceProviderId, customerId, appointmentId, description, isOffSchedule, photoUris }) {
  const formData = new FormData();
  formData.append('ServiceProviderId', serviceProviderId);
  formData.append('CustomerId', customerId);
  if (appointmentId) formData.append('AppointmentId', appointmentId);
  formData.append('Description', description ?? '');
  formData.append('IsOffSchedule', isOffSchedule === true ? 'true' : 'false');

  const photos = Array.isArray(photoUris) && photoUris.length > 0
    ? photoUris.map((uri, i) => ({ uri, name: `photo-${i}.jpg`, type: 'image/jpeg' }))
    : [EMPTY_PHOTO_PLACEHOLDER];
  photos.forEach((file) => {
    formData.append('Photos', file);
  });

  const url = `${API_BASE_URL}/${API_UPLOAD_PROOF_OF_WORK_V2}`;
  const headers = getAuthHeaders(token);
  delete headers['Content-Type'];
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message || data.title || data.error)) || `Upload failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

import {
  getCustomerProfiles,
  getAppointmentsByCustomerId,
  updateAppointment,
  buildUpdateAppointmentBody,
  markAppointmentAsCompleted,
  uploadProofOfWorkV2,
} from './appointmentApi';
import { APPOINTMENT_STATUS } from '../config/api';

const VOICE_PAGE = 1;
const VOICE_PAGE_SIZE = 10;

function buildNameFilter(name) {
  const q = (name || '').trim();
  if (!q) return '';
  return `Name@=${q}`;
}

function toCustomerId(profile) {
  return profile.customerId ?? profile.CustomerId ?? profile.id ?? profile.Id;
}
function toCustomerName(profile, fallback) {
  const name = profile.name ?? profile.Name;
  if (name != null && String(name).trim()) return String(name).trim();
  return fallback ?? '';
}

async function findCustomerByName(token, name) {
  const filters = buildNameFilter(name);
  const list = await getCustomerProfiles(token, {
    filters,
    page: VOICE_PAGE,
    pageSize: VOICE_PAGE_SIZE,
  });
  const first = list && list[0];
  return first ? { customerId: toCustomerId(first), customerName: toCustomerName(first, name) } : null;
}

async function getFirstAppointmentForCustomer(token, customerId, statusFilter) {
  const list = await getAppointmentsByCustomerId(token, customerId, {
    filters: statusFilter,
    page: VOICE_PAGE,
    pageSize: VOICE_PAGE_SIZE,
  });
  return list && list[0] ? list[0] : null;
}

export async function executeOnMyWay(token, userData, customerName) {
  const customer = await findCustomerByName(token, customerName);
  if (!customer) return { ok: false, message: `No customer found for "${customerName}"` };
  const appointment = await getFirstAppointmentForCustomer(token, customer.customerId, `Status==${APPOINTMENT_STATUS.SCHEDULED}`);
  if (!appointment) return { ok: false, message: `No appointment found for ${customer.customerName || customerName}` };
  const body = buildUpdateAppointmentBody(
    { status: APPOINTMENT_STATUS.ACTIVE },
    { appointment, userData }
  );
  await updateAppointment(token, appointment.appointmentId ?? appointment.id, body);
  return { ok: true, customerName: customer.customerName, appointmentId: appointment.appointmentId ?? appointment.id };
}

export async function executeCompleteAppointment(token, userData, customerName) {
  const customer = await findCustomerByName(token, customerName);
  if (!customer) return { ok: false, message: `No customer found for "${customerName}"` };
  let appointment = await getFirstAppointmentForCustomer(token, customer.customerId, `Status==${APPOINTMENT_STATUS.ACTIVE}`);
  if (!appointment) {
    appointment = await getFirstAppointmentForCustomer(token, customer.customerId, `Status==${APPOINTMENT_STATUS.SCHEDULED}`);
  }
  if (!appointment) return { ok: false, message: `No appointment found for ${customer.customerName || customerName}` };
  await markAppointmentAsCompleted(token, appointment.appointmentId ?? appointment.id);
  return { ok: true, customerName: customer.customerName, appointmentId: appointment.appointmentId ?? appointment.id };
}

export async function executeCreateProofOfWork(token, userData, customerName, description = '') {
  const customer = await findCustomerByName(token, customerName);
  if (!customer) return { ok: false, message: `No customer found for "${customerName}"` };
  const serviceProviderId = userData?.serviceProviderId ?? userData?.serviceProviderUserId;
  if (!serviceProviderId) return { ok: false, message: 'Service provider ID not found' };
  await uploadProofOfWorkV2(token, {
    serviceProviderId,
    customerId: customer.customerId,
    appointmentId: null,
    description: description || '',
    isOffSchedule: false,
    photoUris: [],
  });
  return { ok: true, customerName: customer.customerName };
}

export async function executeOnMyWayWithAppointment(token, appointmentId, userData, options = {}) {
  if (!appointmentId) return { ok: false, message: 'No appointment selected' };
  const appointment = options.appointment ?? {};
  const body = buildUpdateAppointmentBody(
    { status: APPOINTMENT_STATUS.ACTIVE },
    { appointment, userData }
  );
  await updateAppointment(token, appointmentId, body);
  return { ok: true };
}

export async function executeCreateProofOfWorkWithDraft(token, userData, activeJob, proofOfWorkDraft, descriptionOverride = '') {
  const serviceProviderId = userData?.serviceProviderId ?? userData?.serviceProviderUserId;
  const customerId = activeJob?.customerId;
  const appointmentId = activeJob?.appointmentId ?? activeJob?.id;
  if (!serviceProviderId || !customerId) return { ok: false, message: 'No active appointment' };
  const draftNotes = Array.isArray(proofOfWorkDraft?.notes)
    ? proofOfWorkDraft.notes.map((n) => n?.text).filter(Boolean).join('\n').trim()
    : '';
  const description = [descriptionOverride?.trim(), draftNotes].filter(Boolean).join('\n') || '';
  const photoUris = Array.isArray(proofOfWorkDraft?.photoUris) ? proofOfWorkDraft.photoUris : [];
  await uploadProofOfWorkV2(token, {
    serviceProviderId,
    customerId,
    appointmentId: appointmentId || undefined,
    description,
    isOffSchedule: false,
    photoUris,
  });
  return { ok: true, customerName: activeJob.customerName || 'Customer' };
}

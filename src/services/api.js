import { API_BASE_URL, API_LOGIN, PLATFORM_KEY } from '../config/api';

export function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function login(body) {
  const url = `${API_BASE_URL}/${API_LOGIN}?platFormKey=${encodeURIComponent(PLATFORM_KEY)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      emailAddress: body.emailAddress?.trim() || '',
      password: body.password || '',
      deviceToken: body.deviceToken || '',
    }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      resData.Value?.Message ||
      resData.message ||
      resData.title ||
      resData.error ||
      `Login failed (${res.status})`;
    throw new Error(message);
  }

  const data = resData.data != null ? resData.data : resData;
  return data;
}

export async function request(path, options = {}) {
  const { method = 'GET', token, body, query } = options;
  let url = `${API_BASE_URL}/${path.replace(/^\//, '')}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v != null && v !== '') params.append(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const fetchOptions = {
    method,
    headers: getAuthHeaders(token),
  };
  if (body != null && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message || data.title || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

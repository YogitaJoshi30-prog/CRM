const API_BASE_URL = '/api';

/**
 * Fetch wrapper for JSON REST API requests
 */
export async function apiRequest(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const token = localStorage.getItem('drisu_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders
  };

  const config = {
    method,
    headers
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Auth expired, clear session if needed
    localStorage.removeItem('drisu_token');
    localStorage.removeItem('drisu_user');
  }

  const text = await response.text();
  let resData;
  try {
    resData = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    throw new Error(resData.message || `API error (${response.status}): ${response.statusText}`);
  }

  return resData;
}

/**
 * Multipart file upload wrapper
 */
export async function apiUpload(endpoint, formData) {
  const token = localStorage.getItem('drisu_token');

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || 'File upload failed.');
  }

  return resData;
}

/**
 * Direct file download wrapper
 */
export async function apiDownload(endpoint, fileName) {
  const token = localStorage.getItem('drisu_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    throw new Error('Download failed. You may not have authorization.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'download';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

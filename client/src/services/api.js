/**
 * Centralized API service layer.
 *
 * All HTTP requests to the backend MUST go through this module.
 * Provides automatic fallback to mock data when the server is offline.
 */

import {
  MOCK_LOKER,
  MOCK_UMKM,
  MOCK_KEGIATAN,
  MOCK_PENGUMUMAN,
  MOCK_RECENT_ITEMS,
} from '../constants/mockData';

const API_BASE = 'http://localhost:5555/api';

// --------------- Fallback map by info type ---------------
const FALLBACK_MAP = {
  loker: MOCK_LOKER,
  umkm: MOCK_UMKM,
  kegiatan: MOCK_KEGIATAN,
  pengumuman: MOCK_PENGUMUMAN,
};

// --------------- Info Items ---------------

/**
 * Fetch info items from the API, optionally filtered by type.
 * Falls back to mock data if the server is unreachable.
 *
 * @param {string|null} type - Optional info type filter (loker, umkm, kegiatan, pengumuman).
 * @returns {Promise<Array>} List of info items.
 */
export const fetchInfoItems = async (type = null) => {
  try {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE}/info${query}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (_err) {
    console.warn(`API offline (fetchInfoItems type=${type}). Using fallback data.`);
    if (type && FALLBACK_MAP[type]) {
      return FALLBACK_MAP[type];
    }
    return MOCK_RECENT_ITEMS;
  }
};

/**
 * Fetch the latest info items for the Home page preview (limited to 2).
 *
 * @returns {Promise<Array>} Top 2 recent items.
 */
export const fetchRecentItems = async () => {
  try {
    const res = await fetch(`${API_BASE}/info`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.slice(0, 2);
  } catch (_err) {
    console.warn('API offline (fetchRecentItems). Using fallback data.');
    return MOCK_RECENT_ITEMS;
  }
};

/**
 * Create a new info item via the API.
 *
 * @param {Object} payload - Info item data.
 * @returns {Promise<Object>} API response data.
 */
export const createInfoItem = async (payload) => {
  const res = await fetch(`${API_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create info item');
  }

  return data;
};

// --------------- Registration ---------------

/**
 * Submit a new member registration.
 *
 * @param {Object} payload - Registration form data.
 * @returns {Promise<Object>} API response data.
 */
export const submitRegistration = async (payload) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
};

/**
 * Fetch all member registrations (admin).
 *
 * @returns {Promise<Array>} List of registrations.
 */
export const fetchRegistrations = async () => {
  const res = await fetch(`${API_BASE}/register`);

  if (!res.ok) {
    throw new Error('Failed to fetch registrations');
  }

  return await res.json();
};

// --------------- Newsletter ---------------

/**
 * Subscribe an email to the newsletter.
 *
 * @param {string} email - Subscriber email address.
 * @returns {Promise<Object>} API response data.
 */
export const subscribeNewsletter = async (email) => {
  const res = await fetch(`${API_BASE}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Newsletter subscription failed');
  }

  return data;
};

/**
 * Fetch all newsletter subscribers (admin).
 *
 * @returns {Promise<Array>} List of subscribers.
 */
export const fetchSubscribers = async () => {
  const res = await fetch(`${API_BASE}/newsletter`);

  if (!res.ok) {
    throw new Error('Failed to fetch subscribers');
  }

  return await res.json();
};

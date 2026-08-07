/* eslint-disable no-console */
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
  MOCK_FINANCE_TRANSACTIONS,
  MOCK_FINANCE_SUMMARY,
} from '../constants/mockData';
import { structureData } from '../constants/structureData';
import { compressImageIfNeeded } from '../utils/imageCompressor';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

// --------------- Fallback map by info type ---------------
const FALLBACK_MAP = {
  loker: MOCK_LOKER,
  umkm: MOCK_UMKM,
  kegiatan: MOCK_KEGIATAN,
  pengumuman: MOCK_PENGUMUMAN,
};

// --------------- Helper: get auth headers ---------------
const getAuthHeaders = () => {
  const token =
    localStorage.getItem('access_token') || localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
    console.warn(
      `API offline (fetchInfoItems type=${type}). Using fallback data.`
    );
    if (type && FALLBACK_MAP[type]) {
      return FALLBACK_MAP[type];
    }
    return MOCK_RECENT_ITEMS;
  }
};

/**
 * Fetch a single info item by ID.
 * Falls back to local search in mock data if the server is unreachable.
 *
 * @param {string} id - The ID of the info item.
 * @returns {Promise<Object|null>} Info item or null if not found.
 */
export const fetchInfoItemById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/info/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (_err) {
    const all = await fetchInfoItems();
    return all.find((item) => String(item._id) === String(id)) || null;
  }
};

/**
 * Increment info item view count.
 * Uses sessionStorage deduplication to prevent duplicate counts on page refresh or double mounts.
 */
export const incrementInfoView = async (id) => {
  if (!id) return null;
  const storageKey = `viewed_info_${id}`;
  if (sessionStorage.getItem(storageKey)) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/info/${id}/view`, { method: 'POST' });
    if (!res.ok) return null;
    sessionStorage.setItem(storageKey, 'true');
    return await res.json();
  } catch (_err) {
    return null;
  }
};

// --------------- Dedicated UMKM API Service ---------------

export const fetchUmkms = async (
  categoryType = null,
  search = '',
  subCategory = null
) => {
  try {
    const params = new URLSearchParams();
    if (categoryType && categoryType !== 'all')
      params.append('categoryType', categoryType);
    if (subCategory && subCategory !== 'all')
      params.append('subCategory', subCategory);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/umkm${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchUmkms). Using fallback data.');
    return [];
  }
};

export const fetchUmkmById = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/umkm/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchUmkmById).');
    return null;
  }
};

/**
 * Increment UMKM view count.
 * Uses sessionStorage deduplication to prevent duplicate counts on page refresh or double mounts.
 */
export const incrementUmkmView = async (id) => {
  if (!id) return null;
  const storageKey = `viewed_umkm_${id}`;
  if (sessionStorage.getItem(storageKey)) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/umkm/${id}/view`, { method: 'POST' });
    if (!res.ok) return null;
    sessionStorage.setItem(storageKey, 'true');
    return await res.json();
  } catch (_err) {
    return null;
  }
};

export const createUmkm = async (payload) => {
  const res = await fetch(`${API_BASE}/umkm`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menambahkan data UMKM baru.');
  }
  return await res.json();
};

export const updateUmkm = async (id, payload) => {
  const res = await fetch(`${API_BASE}/umkm/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal merubah data UMKM.');
  }
  return await res.json();
};

export const deleteUmkm = async (id) => {
  const res = await fetch(`${API_BASE}/umkm/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menghapus data UMKM.');
  }
  return await res.json();
};

export const toggleVerifyUmkm = async (id) => {
  const res = await fetch(`${API_BASE}/umkm/${id}/verify`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal mengubah status verifikasi UMKM.');
  }
  return await res.json();
};

/**
 * Fetch the latest info items for the Home page preview (limited to 4).
 *
 * @returns {Promise<Array>} Top 4 recent items.
 */
export const fetchRecentItems = async () => {
  try {
    const res = await fetch(`${API_BASE}/info`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const sorted = [...data].sort((a, b) => {
      const timeA =
        new Date(a.createdAt || a.updatedAt || a.date).getTime() || 0;
      const timeB =
        new Date(b.createdAt || b.updatedAt || b.date).getTime() || 0;
      return timeB - timeA;
    });
    return sorted.slice(0, 4);
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
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create info item');
  }

  return data;
};

/**
 * Update an existing info item by ID.
 *
 * @param {string} id - Info item ID.
 * @param {Object} payload - Updated info item data.
 * @returns {Promise<Object>} Updated item data.
 */
export const updateInfoItem = async (id, payload) => {
  const res = await fetch(`${API_BASE}/info/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update info item');
  }

  return data;
};

/**
 * Delete an info item by ID.
 *
 * @param {string} id - Info item ID.
 * @returns {Promise<Object>} API response data.
 */
export const deleteInfoItem = async (id) => {
  const res = await fetch(`${API_BASE}/info/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete info item');
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
  const res = await fetch(`${API_BASE}/register`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch registrations');
  }

  return await res.json();
};

/**
 * Delete a member registration by ID.
 *
 * @param {string} id - Registration ID.
 * @returns {Promise<Object>} API response data.
 */
export const deleteRegistration = async (id) => {
  const res = await fetch(`${API_BASE}/register/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete registration');
  }

  return data;
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
  const res = await fetch(`${API_BASE}/newsletter`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch subscribers');
  }

  return await res.json();
};

/**
 * Delete a newsletter subscriber by ID.
 *
 * @param {string} id - Subscriber ID.
 * @returns {Promise<Object>} API response data.
 */
export const deleteSubscriber = async (id) => {
  const res = await fetch(`${API_BASE}/newsletter/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete subscriber');
  }

  return data;
};

// --------------- Auth ---------------

// --------------- Stats (dashboard) ---------------

/**
 * Fetch aggregate stats for the admin dashboard.
 *
 * @returns {Promise<Object>} { totalInfo, totalAnggota, totalSubscriber, recentInfo, recentAnggota }
 */
export const fetchAdminStats = async () => {
  const [infoItems, registrations, subscribers, programs, partners] =
    await Promise.all([
      fetchInfoItems(),
      fetchRegistrations(),
      fetchSubscribers(),
      fetchPrograms(),
      fetchPartners(),
    ]);

  return {
    totalInfo: infoItems.length,
    totalAnggota: registrations.length,
    totalSubscriber: subscribers.length,
    totalProgram: programs.length,
    totalPartner: partners.length,
    recentInfo: infoItems.slice(0, 5),
    recentAnggota: registrations.slice(0, 5),
    recentSubscribers: subscribers.slice(0, 5),
  };
};

/**
 * Change the admin password.
 *
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
export const changePassword = async (oldPassword, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengubah password.');
  }

  return data;
};

/**
 * Update the status of a registration (Pending, Approved, Rejected).
 *
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>}
 */
export const updateRegistrationStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/register/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gagal merubah status.');
  }

  return data;
};

/**
 * Generate user accounts for all pengurus members automatically
 */
export const generatePengurusAccounts = async () => {
  const token =
    localStorage.getItem('access_token') || localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE}/pengurus/generate-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memproses pembuatan akun.');
  return data;
};

/**
 * Helper to normalize image URLs.
 * Ensures relative upload filenames (e.g. 'info-xxx.jpg') start with '/uploads/'.
 *
 * @param {string} url
 * @returns {string} Normalized image URL path.
 */
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (!url.startsWith('/uploads/') && !url.startsWith('/assets/')) {
    if (url.startsWith('uploads/')) return `/${url}`;
    if (url.startsWith('/')) return url;
    return `/uploads/${url}`;
  }
  return url;
};

/**
 * Upload an image file to the server.
 * Automatically compresses large image files on the client-side before upload.
 *
 * @param {File} file
 * @returns {Promise<Object>} Object containing { imageUrl, url, success }
 */
export const uploadImage = async (file) => {
  if (!file) throw new Error('File gambar tidak valid.');

  // Auto-compress large image files (< 1.5MB) before upload
  let fileToUpload = file;
  try {
    fileToUpload = await compressImageIfNeeded(file, 1.5);
  } catch (_e) {
    // Fallback to original file if compression fails
  }

  const formData = new FormData();
  formData.append('image', fileToUpload);

  const token =
    localStorage.getItem('access_token') || localStorage.getItem('admin_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = {};

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    // Handle non-JSON response (Express/proxy HTML error pages like 413, 404, 500)
    if (res.status === 413) {
      throw new Error(
        'Ukuran file gambar terlalu besar (Melewati batas server 15MB).'
      );
    }
    throw new Error(`Terjadi kesalahan server (HTTP Status ${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengunggah gambar.');
  }

  const path = formatImageUrl(data.imageUrl || data.url || '');
  return {
    imageUrl: path,
    url: path,
    success: true,
  };
};

/**
 * Send a broadcast email to all newsletter subscribers.
 *
 * @param {string} subject
 * @param {string} content
 * @returns {Promise<Object>}
 */
export const sendBroadcastEmail = async (subject, content) => {
  const res = await fetch(`${API_BASE}/newsletter/broadcast`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ subject, content }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengirim email broadcast.');
  }

  return data;
};

// --------------- Pengurus (Struktur Organisasi) ---------------

/**
 * Generate a flat list of pengurus from static structureData for mock fallback.
 */
const getMockPengurusFlat = () => {
  const list = [];
  list.push({
    _id: 'mock-pembina',
    name: structureData.pembina.name,
    role: structureData.pembina.role,
    category: 'pembina',
    level: 1,
    imageUrl: '',
    isKoordinator: false,
    socials: [],
  });

  structureData.harian.forEach((h, index) => {
    list.push({
      _id: `mock-harian-${index}`,
      name: h.name,
      role: h.role,
      category: 'harian',
      level: h.level,
      imageUrl: '',
      isKoordinator: false,
      socials: [],
    });
  });

  structureData.bidang.forEach((b) => {
    list.push({
      _id: `mock-koor-${b.id}`,
      name: b.koordinator,
      role: 'Koordinator Bidang',
      category: 'bidang',
      level: 3,
      bidangId: b.id,
      bidangTitle: b.title,
      isKoordinator: true,
      imageUrl: '',
      socials: [],
    });

    b.anggota.forEach((name, index) => {
      list.push({
        _id: `mock-ang-${b.id}-${index}`,
        name,
        role: 'Anggota',
        category: 'bidang',
        level: 3,
        bidangId: b.id,
        bidangTitle: b.title,
        isKoordinator: false,
        imageUrl: '',
        socials: [],
      });
    });
  });
  return list;
};

/**
 * Fetch all pengurus members from the API.
 * Falls back to local structureData flat mock list if offline.
 *
 * @returns {Promise<Array>} List of pengurus.
 */
export const fetchPengurus = async () => {
  try {
    const res = await fetch(`${API_BASE}/pengurus`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchPengurus). Using mock fallback data.');
    return getMockPengurusFlat();
  }
};

/**
 * Create a new pengurus member.
 *
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createPengurus = async (payload) => {
  const res = await fetch(`${API_BASE}/pengurus`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || 'Gagal menyimpan anggota pengurus.');
  return data;
};

/**
 * Update a pengurus member by ID.
 *
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const updatePengurus = async (id, payload) => {
  const res = await fetch(`${API_BASE}/pengurus/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal merubah data pengurus.');
  return data;
};

/**
 * Delete a pengurus member by ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deletePengurus = async (id) => {
  const res = await fetch(`${API_BASE}/pengurus/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || 'Gagal menghapus anggota pengurus.');
  return data;
};

/**
 * Helper to group flat list back into bagan structure format:
 * { pembina: {name, role}, harian: [...], bidang: [...] }
 *
 * @param {Array} flatList
 * @returns {Object} Grouped structure
 */
export const groupPengurusData = (flatList) => {
  const data = {
    pembina: {
      name: 'Kepala Kelurahan Rawa Arum',
      role: 'Pelindung / Pembina',
      imageUrl: '',
      socials: [],
    },
    harian: [],
    bidang: [],
  };

  const pembinaDoc = flatList.find((p) => p.category === 'pembina');
  if (pembinaDoc) {
    data.pembina = {
      name: pembinaDoc.name,
      role: pembinaDoc.role,
      imageUrl: pembinaDoc.imageUrl,
      socials: pembinaDoc.socials || [],
      _id: pembinaDoc._id,
    };
  }

  data.harian = flatList
    .filter((p) => p.category === 'harian')
    .sort((a, b) => a.level - b.level);

  const bidangMap = {};
  const standardBidangList = [
    {
      id: 'kaderisasi',
      title: 'Pemberdayaan Aparatur Organisasi & Kaderisasi',
    },
    { id: 'advokasi', title: 'Advokasi, HAM & Lingkungan Hidup' },
    {
      id: 'hubungan',
      title: 'Hubungan Antar-Lembaga, Masyarakat, dan Industri',
    },
    { id: 'perempuan', title: 'Pemberdayaan Perempuan dan Anak' },
    { id: 'media', title: 'Media, Data, dan Informasi' },
    { id: 'seni', title: 'Seni, Budaya, dan Olahraga' },
    { id: 'ekonomi', title: 'Kemandirian Organisasi dan Ekonomi Kreatif' },
    { id: 'pendidikan', title: 'Pendidikan dan Keagamaan' },
    { id: 'sosial', title: 'Sosial, Kemanusiaan, dan Mitigasi Bencana' },
  ];

  standardBidangList.forEach((b) => {
    bidangMap[b.id] = {
      id: b.id,
      title: b.title,
      koordinator: '',
      koordinatorDoc: null,
      anggota: [],
      anggotaDocs: [],
    };
  });

  flatList.forEach((p) => {
    if (p.category === 'bidang' && p.bidangId) {
      if (!bidangMap[p.bidangId]) {
        bidangMap[p.bidangId] = {
          id: p.bidangId,
          title: p.bidangTitle || p.bidangId.toUpperCase(),
          koordinator: '',
          koordinatorDoc: null,
          anggota: [],
          anggotaDocs: [],
        };
      }

      if (p.isKoordinator) {
        bidangMap[p.bidangId].koordinator = p.name;
        bidangMap[p.bidangId].koordinatorDoc = p;
      } else {
        bidangMap[p.bidangId].anggota.push(p.name);
        bidangMap[p.bidangId].anggotaDocs.push(p);
      }
    }
  });

  data.bidang = Object.values(bidangMap);
  return data;
};

// --------------- Site Settings ---------------

export const fetchSiteSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_err) {
    console.warn(
      'API offline (fetchSiteSettings). Using mock default settings.'
    );
    return {
      heroTitle: '',
      heroSubtitle: 'Muda, Beda, Berkarya untuk Kemajuan Rawa Arum',
      heroDescription:
        'Wadah pengembangan generasi muda Kelurahan Rawa Arum yang berkesadaran sosial, kreatif, inovatif, dan berdaya saing.',
      visiText:
        'Terwujudnya Pemuda Rawa Arum yang Mandiri, Berkarakter, Kreatif, dan Berjiwa Sosial tinggi dalam membangun Kelurahan Rawa Arum yang Sejahtera.',
      misiList: [
        'Mewujudkan pemuda yang bertakwa, berakhlak mulia, dan berpengetahuan luas.',
        'Meningkatkan jiwa kewirausahaan dan kemandirian ekonomi pemuda kelurahan.',
        'Mendorong aksi tanggap sosial, pelestarian lingkungan, dan kemanusiaan.',
        'Mempererat tali silaturahmi dan solidaritas antar pemuda se-Kelurahan Rawa Arum.',
      ],
      address:
        'Jl. Raya Merak No. 12, Kel. Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436',
      phone: '0812-3456-7890',
      whatsapp: '6281234567890',
      email: 'kontak@karangtarunarawaarum.id',
      mapsEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.68598762397!2d106.0123!3d-5.9812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwNTgnNTIuMyJTIDEwNsKwMDAnNDQuMyJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid',
      socialInstagram: 'https://instagram.com/kartar_rawaarum',
      socialFacebook: 'https://facebook.com/kartar.rawaarum',
      socialYoutube: 'https://youtube.com/@kartarrawaarum',
    };
  }
};

export const updateSiteSettings = async (payload) => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || 'Gagal menyimpan pengaturan situs.');
  return data;
};

// --------------- Program Kerja ---------------

export const fetchPrograms = async () => {
  try {
    const res = await fetch(`${API_BASE}/program`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchPrograms). Using mock default programs.');
    return [
      {
        _id: 'p1',
        title: 'Pelatihan Kewirausahaan Pemuda',
        category: 'Ekonomi Kreatif',
        description:
          'Workshop digital marketing, packaging UMKM, dan pendampingan legalitas NIB gratis untuk wirausaha muda.',
        icon: 'fa-lightbulb',
        target: 'Pemuda Pelaku Usaha',
        status: 'Berjalan',
      },
      {
        _id: 'p2',
        title: 'Turnamen Olahraga Pemuda Kelurahan',
        category: 'Olahraga & Seni',
        description:
          'Kompetisi sepak bola, futsal, dan bulu tangkis antar RW se-Kelurahan Rawa Arum.',
        icon: 'fa-trophy',
        target: 'Pemuda & Warga',
        status: 'Berjalan',
      },
      {
        _id: 'p3',
        title: 'Pengajian & Kajian Rutin Remaja Masjid',
        category: 'Keagamaan',
        description:
          'Kegiatan pembinaan mental, spiritual, dan kajian tematik kepemudaan setiap bulan.',
        icon: 'fa-hands-praying',
        target: 'Remaja Masjid & Warga',
        status: 'Berjalan',
      },
      {
        _id: 'p4',
        title: 'Aksi Bersih Lingkungan & Tanggap Bencana',
        category: 'Sosial & Lingkungan',
        description:
          'Kerja bakti pembersihan drainase, penanaman pohon, dan kesiapsiagaan mitigasi banjir.',
        icon: 'fa-tree',
        target: 'Masyarakat Rawa Arum',
        status: 'Berjalan',
      },
      {
        _id: 'p5',
        title: 'Bantuan Hukum & Advokasi Hak Pemuda',
        category: 'Advokasi & HAM',
        description:
          'Konsultasi hukum gratis dan pendampingan advokasi tenaga kerja lokal ke industri sekitar.',
        icon: 'fa-scale-balanced',
        target: 'Pencari Kerja & Pemuda',
        status: 'Berjalan',
      },
    ];
  }
};

export const createProgram = async (payload) => {
  const res = await fetch(`${API_BASE}/program`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menyimpan program kerja.');
  return data;
};

export const updateProgram = async (id, payload) => {
  const res = await fetch(`${API_BASE}/program/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengubah program kerja.');
  return data;
};

export const deleteProgram = async (id) => {
  const res = await fetch(`${API_BASE}/program/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus program kerja.');
  return data;
};

// --------------- Kemitraan (Partners) ---------------

export const fetchPartners = async () => {
  try {
    const res = await fetch(`${API_BASE}/partner`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchPartners). Using mock default partners.');
    return [
      {
        _id: 'pt1',
        name: 'Pemerintah Kelurahan Rawa Arum',
        category: 'Pemerintahan',
        description:
          'Mitra utama dalam pembinaan kemasyarakatan dan fasilitas kantor sekretariat.',
        logoUrl: '',
        websiteUrl: '#',
      },
      {
        _id: 'pt2',
        name: 'Kecamatan Grogol Kota Cilegon',
        category: 'Pemerintahan',
        description: 'Instansi pembina program kepemudaan tingkat kecamatan.',
        logoUrl: '',
        websiteUrl: '#',
      },
      {
        _id: 'pt3',
        name: 'Kemitraan Industri Kawasan Cilegon',
        category: 'Industri & Swasta',
        description:
          'Sinergi penyaluran tenaga kerja lokal dan program Tanggung Jawab Sosial Lingkungan (TJSL).',
        logoUrl: '',
        websiteUrl: '#',
      },
    ];
  }
};

export const createPartner = async (payload) => {
  const res = await fetch(`${API_BASE}/partner`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data mitra.');
  return data;
};

export const updatePartner = async (id, payload) => {
  const res = await fetch(`${API_BASE}/partner/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengubah data mitra.');
  return data;
};

export const deletePartner = async (id) => {
  const res = await fetch(`${API_BASE}/partner/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus mitra.');
  return data;
};

// --------------- Auth & JWT Helper Services ---------------

/**
 * Login user — receives accessToken and refreshToken
 */
export const adminLogin = async (username, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login gagal.');

  if (data.accessToken) localStorage.setItem('access_token', data.accessToken);
  if (data.token) localStorage.setItem('admin_token', data.token); // backward compatibility
  if (data.refreshToken)
    localStorage.setItem('refresh_token', data.refreshToken);

  return data;
};

/**
 * Refresh expired access token silently
 */
export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    // Refresh token expired or revoked -> clear storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('refresh_token');
    throw new Error(data.error || 'Sesi telah berakhir.');
  }

  if (data.accessToken) {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('admin_token', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refresh_token', data.refreshToken);
  }

  return data;
};

/**
 * Logout user — revokes refresh token on backend
 */
export const apiLogout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  try {
    if (refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (_err) {
    // Ignore logout network errors
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Verify current user session from access token
 */
export const verifyAdminToken = async () => {
  const token =
    localStorage.getItem('access_token') || localStorage.getItem('admin_token');
  if (!token) throw new Error('Token tidak ditemukan');

  let res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // If access token expired, try to refresh automatically!
  if (res.status === 401) {
    try {
      const refreshed = await refreshAuthToken();
      res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    } catch (_refreshErr) {
      throw new Error('Sesi telah berakhir, silakan login kembali.');
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Token tidak valid');
  return data;
};

/**
 * Smart fetch wrapper that handles Authorization headers & automatic token refresh on 401
 */
export const fetchWithAuth = async (url, options = {}) => {
  let token =
    localStorage.getItem('access_token') || localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, { ...options, headers });

  // If 401 Unauthorized (Access token expired), attempt auto-refresh
  if (res.status === 401 && localStorage.getItem('refresh_token')) {
    try {
      const refreshed = await refreshAuthToken();
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshed.accessToken}`,
      };
      res = await fetch(url, { ...options, headers: newHeaders });
    } catch (_err) {
      // Refresh failed
    }
  }

  return res;
};

/**
 * Update user profile (Name, Username, Email, Phone, Social Media)
 */
export const updateUserProfile = async (profileData) => {
  const res = await fetchWithAuth(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengupdate profil');
  return data;
};

/**
 * Fetch activity logs for the logged-in user
 */
export const fetchUserActivityLogs = async () => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/auth/logs`);
    if (!res.ok) return [];
    return await res.json();
  } catch (_err) {
    return [];
  }
};

// --------------- Contact Messages / Pesan Masuk ---------------

export const sendContactMessage = async (payload) => {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengirim pesan.');
  return data;
};

export const fetchContactMessages = async (statusFilter = 'all') => {
  try {
    const url =
      statusFilter && statusFilter !== 'all'
        ? `${API_BASE}/messages?status=${statusFilter}`
        : `${API_BASE}/messages`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchContactMessages). Using empty array.');
    return [];
  }
};

export const updateMessageStatus = async (id, status) => {
  const res = await fetchWithAuth(`${API_BASE}/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status pesan.');
  return data;
};

export const deleteContactMessage = async (id) => {
  const res = await fetchWithAuth(`${API_BASE}/messages/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus pesan.');
  return data;
};

// --------------- Transparansi Keuangan ---------------

export const fetchFinanceTransactions = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all')
      query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/finance${queryString}`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (_err) {
    console.warn(
      'API offline (fetchFinanceTransactions). Using fallback data.'
    );
    let data = [...MOCK_FINANCE_TRANSACTIONS];
    if (params.type && params.type !== 'all') {
      data = data.filter((item) => item.type === params.type);
    }
    if (params.category && params.category !== 'all') {
      data = data.filter((item) => item.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }
    return data;
  }
};

export const fetchFinanceSummary = async () => {
  try {
    const res = await fetch(`${API_BASE}/finance/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (_err) {
    console.warn('API offline (fetchFinanceSummary). Using fallback summary.');
    return MOCK_FINANCE_SUMMARY;
  }
};

export const createFinanceTransaction = async (payload) => {
  const res = await fetchWithAuth(`${API_BASE}/finance`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || 'Gagal menambahkan transaksi kas.');
  return data;
};

export const updateFinanceTransaction = async (id, payload) => {
  const res = await fetchWithAuth(`${API_BASE}/finance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || 'Gagal memperbarui transaksi kas.');
  return data;
};

export const deleteFinanceTransaction = async (id) => {
  const res = await fetchWithAuth(`${API_BASE}/finance/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menghapus transaksi kas.');
  return data;
};

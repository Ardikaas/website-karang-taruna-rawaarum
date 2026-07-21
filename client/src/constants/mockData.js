/**
 * Centralized mock/fallback data used when the API server is offline.
 * Each key corresponds to an info type returned by GET /api/info?type=X.
 */

export const MOCK_LOKER = [
  {
    _id: 'mock-loker-1',
    title: 'Lowongan Kerja Kelurahan',
    description: 'Informasi lowongan kerja terbaru, pelatihan kerja, dan program magang untuk warga Rawa Arum.',
    type: 'loker',
    date: '10 Juli 2026',
    imageUrl: '/assets/lowongan_kerja.png',
    badge: 'Loker',
    linkText: 'Lihat Lowongan',
  },
];

export const MOCK_UMKM = [
  {
    _id: 'mock-umkm-1',
    title: 'Potensi UMKM Binaan',
    description: 'Kenali produk unggulan kreatif, kerajinan tangan, dan usaha kuliner warga binaan Rawa Arum.',
    type: 'umkm',
    date: '08 Juli 2026',
    imageUrl: '/assets/potensi_umkm.png',
    badge: 'UMKM',
    linkText: 'Lihat UMKM',
  },
];

export const MOCK_KEGIATAN = [
  {
    _id: 'mock-kegiatan-1',
    title: 'Bakti Sosial & Gotong Royong Kelurahan',
    description: 'Update agenda, dokumentasi gotong royong, dan kegiatan sosial kepemudaan Karang Taruna.',
    type: 'kegiatan',
    date: '05 Juli 2026',
    imageUrl: '/assets/info_kegiatan.png',
    badge: 'Kegiatan',
    linkText: 'Lihat Kegiatan',
  },
];

export const MOCK_PENGUMUMAN = [
  {
    _id: 'mock-pengumuman-1',
    title: 'Pengumuman Penting Kelurahan',
    description: 'Informasi penting kelurahan, rilis kebijakan pemuda, serta agenda rapat umum bulanan warga.',
    type: 'pengumuman',
    date: '01 Juli 2026',
    imageUrl: '/assets/pengumuman.png',
    badge: 'Penting',
    linkText: 'Lihat Pengumuman',
  },
];

/**
 * Combined recent items used as fallback on the Home page preview section.
 */
export const MOCK_RECENT_ITEMS = [
  {
    _id: 'mock-recent-1',
    title: 'Lowongan Kerja',
    description: 'Informasi lowongan kerja terbaru, pelatihan kerja, dan program magang untuk warga Rawa Arum.',
    type: 'loker',
    date: '10 Juli 2026',
    imageUrl: '/assets/lowongan_kerja.png',
    badge: 'Loker',
    linkText: 'Lihat Lowongan',
  },
  {
    _id: 'mock-recent-2',
    title: 'Potensi UMKM',
    description: 'Kenali produk unggulan kreatif, kerajinan tangan, dan usaha kuliner warga binaan Rawa Arum.',
    type: 'umkm',
    date: '08 Juli 2026',
    imageUrl: '/assets/potensi_umkm.png',
    badge: 'UMKM',
    linkText: 'Lihat UMKM',
  },
];

/**
 * Hero banner slides used on the Home page carousel.
 */
export const HERO_SLIDES = [
  {
    image: '/assets/hero_banner.png',
    title: 'Bersama Rawa Arum, Berkarya untuk <span class="highlight-text">Maju</span>',
    desc: 'Karang Taruna Rawa Arum hadir sebagai wadah generasi muda yang peduli, berdaya dan berkontribusi membangun lingkungan yang lebih baik.',
  },
  {
    image: '/assets/info_kegiatan.png',
    title: 'Kolaborasi & Aksi <span class="highlight-text">Sosial</span> Nyata',
    desc: 'Kami bergerak aktif dalam berbagai kegiatan sosial, gotong royong, dan kepedulian lingkungan untuk kesejahteraan warga Rawa Arum.',
  },
  {
    image: '/assets/potensi_umkm.png',
    title: 'Pemberdayaan <span class="highlight-text">Ekonomi</span> Pemuda',
    desc: 'Mendukung pertumbuhan UMKM lokal kelurahan Rawa Arum untuk menciptakan kemandirian ekonomi yang kreatif dan berkelanjutan.',
  },
];

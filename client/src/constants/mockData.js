/**
 * Centralized mock/fallback data used when the API server is offline.
 * Each key corresponds to an info type returned by GET /api/info?type=X.
 */

export const HERO_SLIDES = [
  {
    image: '/assets/hero_banner.png',
    title: 'Muda, Beda, Berkarya untuk Kemajuan Rawa Arum',
    subtitle:
      'Wadah pengembangan generasi muda Kelurahan Rawa Arum yang berkesadaran sosial, kreatif, inovatif, dan berdaya saing.',
  },
  {
    image: '/assets/potensi_umkm.png',
    title: 'Pemberdayaan Ekonomi & UMKM Pemuda',
    subtitle:
      'Mendukung wirausaha muda lokal melalui pelatihan digital marketing, katalog UMKM, dan legalitas usaha.',
  },
  {
    image: '/assets/info_kegiatan.png',
    title: 'Aksi Sosial, Olahraga & Keagamaan',
    subtitle:
      'Mempererat tali silaturahmi warga melalui turnamen olahraga, kerja bakti lingkungan, dan pembinaan mental kepemudaan.',
  },
];

export const MOCK_LOKER = [];

export const MOCK_UMKM = [];

export const MOCK_KEGIATAN = [];

export const MOCK_PENGUMUMAN = [];

export const MOCK_RECENT_ITEMS = [];

export const MOCK_FINANCE_TRANSACTIONS = [
  {
    _id: 'fin-001',
    title: 'Dana Hibah Program Pemuda Kelurahan Rawa Arum',
    type: 'pemasukan',
    amount: 5000000,
    date: '2026-07-01T09:00:00.000Z',
    category: 'Dana Kelurahan',
    description:
      'Pencairan dana hibah pembinaan kepemudaan semester 2 dari Kantor Kelurahan Rawa Arum.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    proofName: 'Kwitansi & SK Hibah Kelurahan No. 042/SK-RA/2026',
    recordedBy: 'Ahmad Supriadi (Bendahara Umum)',
  },
  {
    _id: 'fin-002',
    title: 'Sponsorship Kegiatan HUT RI dari PT Cilegon Industrial',
    type: 'pemasukan',
    amount: 3500000,
    date: '2026-07-10T14:30:00.000Z',
    category: 'Donasi & Sponsor',
    description:
      'Bantuan dana sponsorship dari CSR PT Cilegon Industrial untuk kepanitiaan Peringatan HUT RI ke-81.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    proofName: 'Bukti Transfer Bank Mandiri - CSR PT Cilegon',
    recordedBy: 'Ahmad Supriadi (Bendahara Umum)',
  },
  {
    _id: 'fin-003',
    title: 'Pembelian Portable Sound System & 2 Wireless Mic',
    type: 'pengeluaran',
    amount: 2450000,
    date: '2026-07-15T11:20:00.000Z',
    category: 'Operasional & Peralatan',
    description:
      'Pengadaan inventaris sound system portable untuk rapat RT/RW, rapat pengurus, dan kegiatan outdoor Karang Taruna.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    proofName: 'Nota Toko Elektronik Jaya Cilegon #INV-88912',
    recordedBy: 'Siti Rahma (Wakil Bendahara)',
  },
  {
    _id: 'fin-004',
    title: 'Penyaluran Paket Sembako untuk 15 Keluarga Lansia',
    type: 'pengeluaran',
    amount: 1800000,
    date: '2026-07-20T10:00:00.000Z',
    category: 'Bantuan Sosial',
    description:
      'Pembelian bahan pokok (Beras 5kg, Minyak, Gula, Mi Instan) untuk Bakti Sosial Peduli Lansia Rawa Arum.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    proofName: 'Kwitansi Agen Sembako Barokah Rawa Arum',
    recordedBy: 'Ahmad Supriadi (Bendahara Umum)',
  },
  {
    _id: 'fin-005',
    title: 'Iuran Kas Rutin Pengurus Bulan Juli 2026',
    type: 'pemasukan',
    amount: 750000,
    date: '2026-07-25T16:00:00.000Z',
    category: 'Kas Rutin',
    description:
      'Terkumpul dari iuran bulanan 25 anggota pengurus aktif Karang Taruna Kelurahan Rawa Arum @Rp 30.000.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    proofName: 'Buku Catatan Kas & Tanda Tangan Anggota',
    recordedBy: 'Siti Rahma (Wakil Bendahara)',
  },
  {
    _id: 'fin-006',
    title: 'Cetak Spanduk & Konsumsi Turnamen Futsal Pemuda',
    type: 'pengeluaran',
    amount: 920000,
    date: '2026-07-28T19:00:00.000Z',
    category: 'Kegiatan & Event',
    description:
      'Cetak banner spanduk 3x1m (2 buah), snack & air mineral peserta Turnamen Futsal Antar-RW.',
    proofUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    proofName: 'Nota Digital Printing & Kwitansi Snack Bu Yanti',
    recordedBy: 'Ahmad Supriadi (Bendahara Umum)',
  },
];

export const MOCK_FINANCE_SUMMARY = {
  totalIncome: 9250000,
  totalExpense: 5170000,
  balance: 4080000,
  totalCount: 6,
  categoryBreakdown: {
    'Dana Kelurahan': { income: 5000000, expense: 0, count: 1 },
    'Donasi & Sponsor': { income: 3500000, expense: 0, count: 1 },
    'Kas Rutin': { income: 750000, expense: 0, count: 1 },
    'Operasional & Peralatan': { income: 0, expense: 2450000, count: 1 },
    'Bantuan Sosial': { income: 0, expense: 1800000, count: 1 },
    'Kegiatan & Event': { income: 0, expense: 920000, count: 1 },
  },
};

export const MOCK_DETAILED_WEATHER = {
  location: 'Kelurahan Rawa Arum, Cilegon',
  district: 'Kecamatan Grogol, Kota Cilegon, Banten',
  temperature: 30,
  feelsLike: 33,
  conditionText: 'Cerah Berawan',
  weatherCode: 2,
  humidity: 78,
  dewPoint: 25,
  windSpeed: 14,
  windDirection: 'TL (Barat Daya)',
  windDegree: 225,
  lux: 48000,
  uvIndex: 6,
  pressure: 1012,
  visibility: '10 km (Jernih)',
  airQuality: 'Sangat Baik (AQI 28)',
  hourlyForecast: [
    {
      time: '10:00',
      temp: 30,
      humidity: 78,
      pop: 10,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
    },
    {
      time: '11:00',
      temp: 31,
      humidity: 74,
      pop: 10,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
    },
    {
      time: '12:00',
      temp: 32,
      humidity: 70,
      pop: 15,
      weatherCode: 1,
      conditionText: 'Cerah',
    },
    {
      time: '13:00',
      temp: 33,
      humidity: 68,
      pop: 15,
      weatherCode: 1,
      conditionText: 'Cerah',
    },
    {
      time: '14:00',
      temp: 32,
      humidity: 72,
      pop: 20,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
    },
    {
      time: '15:00',
      temp: 31,
      humidity: 75,
      pop: 25,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
    },
    {
      time: '16:00',
      temp: 30,
      humidity: 79,
      pop: 30,
      weatherCode: 3,
      conditionText: 'Berawan',
    },
    {
      time: '17:00',
      temp: 29,
      humidity: 82,
      pop: 35,
      weatherCode: 3,
      conditionText: 'Berawan',
    },
    {
      time: '18:00',
      temp: 28,
      humidity: 85,
      pop: 20,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
    },
    {
      time: '19:00',
      temp: 27,
      humidity: 87,
      pop: 10,
      weatherCode: 1,
      conditionText: 'Cerah',
    },
    {
      time: '20:00',
      temp: 26,
      humidity: 88,
      pop: 5,
      weatherCode: 0,
      conditionText: 'Cerah',
    },
    {
      time: '21:00',
      temp: 26,
      humidity: 89,
      pop: 5,
      weatherCode: 0,
      conditionText: 'Cerah',
    },
  ],
  dailyForecast: [
    {
      dayLabel: 'Hari Ini',
      dateFormatted: '11 Ags',
      tempMax: 32,
      tempMin: 24,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
      uvIndexMax: 6,
      windSpeedMax: 14,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Besok',
      dateFormatted: '12 Ags',
      tempMax: 31,
      tempMin: 24,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
      uvIndexMax: 6,
      windSpeedMax: 15,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Rabu',
      dateFormatted: '13 Ags',
      tempMax: 30,
      tempMin: 23,
      weatherCode: 61,
      conditionText: 'Hujan Ringan',
      uvIndexMax: 4,
      windSpeedMax: 18,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Kamis',
      dateFormatted: '14 Ags',
      tempMax: 31,
      tempMin: 24,
      weatherCode: 2,
      conditionText: 'Cerah Berawan',
      uvIndexMax: 7,
      windSpeedMax: 12,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Jumat',
      dateFormatted: '15 Ags',
      tempMax: 32,
      tempMin: 25,
      weatherCode: 1,
      conditionText: 'Cerah',
      uvIndexMax: 8,
      windSpeedMax: 11,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Sabtu',
      dateFormatted: '16 Ags',
      tempMax: 33,
      tempMin: 25,
      weatherCode: 1,
      conditionText: 'Cerah',
      uvIndexMax: 8,
      windSpeedMax: 13,
      sunrise: '05:58',
      sunset: '18:02',
    },
    {
      dayLabel: 'Minggu',
      dateFormatted: '17 Ags',
      tempMax: 31,
      tempMin: 24,
      weatherCode: 3,
      conditionText: 'Berawan',
      uvIndexMax: 5,
      windSpeedMax: 16,
      sunrise: '05:58',
      sunset: '18:02',
    },
  ],
  updatedAt: new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }),
};

export const MOCK_WEATHER_DATA = MOCK_DETAILED_WEATHER;

export const MOCK_HOLIDAYS = [
  {
    _id: 'mock-hol-1',
    title: 'HUT Republik Indonesia ke-81',
    subtitle:
      'Dirgahayu Republik Indonesia! Bersatu Berdaulat, Nusantara Baru Indonesia Maju 🇮🇩',
    startDate: new Date(
      new Date().setDate(new Date().getDate() - 1)
    ).toISOString(),
    endDate: new Date(
      new Date().setDate(new Date().getDate() + 7)
    ).toISOString(),
    theme: 'merah-putih',
    customColor: '',
    bannerImageUrl: '',
    emoji: '🇮🇩',
    isActive: true,
  },
];

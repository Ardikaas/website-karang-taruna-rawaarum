/**
 * Static organizational structure data for StrukturPage.
 * Extracted from the page component to keep UI logic clean.
 */

export const structureData = {
  pembina: { name: 'Kepala Kelurahan Rawa Arum', role: 'Pelindung / Pembina' },
  harian: [
    { name: 'Rifki Amrullah', role: 'Ketua', level: 1 },
    { name: 'Imamul Hakim, S.AP', role: 'Wakil Ketua I', level: 2 },
    { name: 'Insan Ansori', role: 'Wakil Ketua II', level: 2 },
    { name: 'Ibnu Aminudin, S.HI', role: 'Sekretaris', level: 3 },
    { name: 'Lendhia Marhani Pramesta, S.AP', role: 'Wakil Sekretaris', level: 3 },
    { name: 'Febri Kurniawan, S.E', role: 'Bendahara', level: 3 },
    { name: 'Cahya Agung Prayoga, S.T', role: 'Wakil Bendahara', level: 3 },
  ],
  bidang: [
    {
      id: 'kaderisasi',
      title: 'Pemberdayaan Aparatur Organisasi & Kaderisasi',
      koordinator: 'Derico',
      anggota: ['Dedi Cahyadi', 'Nia Agustin', 'Tazkiyatunnufus', 'Sulthoni', 'Juwita Sari', 'Suhendar, S.T'],
    },
    {
      id: 'advokasi',
      title: 'Advokasi, HAM & Lingkungan Hidup',
      koordinator: 'Aneka Rosani, S.H',
      anggota: ['Alfa Nizar Al-Khaidar', 'Ilham Hari Mulyadi'],
    },
    {
      id: 'hubungan',
      title: 'Hubungan Antar-Lembaga, Masyarakat, dan Industri',
      koordinator: 'Fiki Kosasih',
      anggota: ['M. Syahrul Alamsyah', 'Rudi Hidayat', 'M. Nazarudin', 'Indra Saputra', 'Saiful Bahri', 'Endang Kurniawan', 'Ferdi Febianto'],
    },
    {
      id: 'perempuan',
      title: 'Pemberdayaan Perempuan dan Anak',
      koordinator: 'Nila Nurmala Dewi, S.I.Kom',
      anggota: ['Asih Herawati', 'Chyntia Permatasari', 'Devi Olivia', 'Alita', 'Faridzatul Aini', 'Levi Gustiana', 'Nauraa Lafa Ayu'],
    },
    {
      id: 'media',
      title: 'Media, Data, dan Informasi',
      koordinator: 'Dodi',
      anggota: ['Sahrul Tamam', 'Mufallih Arrosyid', 'Ardika Aji Setiawan', 'Didi Ardiansyah', 'Ali Rafiudin'],
    },
    {
      id: 'seni',
      title: 'Seni, Budaya, dan Olahraga',
      koordinator: 'Nafis Setiyadi',
      anggota: ['Yuda Andika', 'Dede Sapta Kurniawan', 'Muhlis', 'Saiful Anwar', 'Agus Hairil Anam', 'Muhammad Farhan Dzulqisthi'],
    },
    {
      id: 'ekonomi',
      title: 'Kemandirian Organisasi dan Ekonomi Kreatif',
      koordinator: 'Imron Rosyadi',
      anggota: ['Ade Rizki Ramadhan', 'Asep Saefulloh', 'Insan Effendi', 'Santi Dewi Nurjanah'],
    },
    {
      id: 'pendidikan',
      title: 'Pendidikan dan Keagamaan',
      koordinator: 'Dewi Kurnia, S.Sos',
      anggota: ['Syafina Yunia Rahma', 'Raihan Muliya', 'Juwita Sari', 'Siti Auliya Istiqomah'],
    },
    {
      id: 'sosial',
      title: 'Sosial, Kemanusiaan, dan Mitigasi Bencana',
      koordinator: 'Suhebi',
      anggota: ['Haris', 'Ponco Joko Susilo', 'Muhammad Rizki Salsabil', 'Agung Setiawan', 'Sulaiman Hadi', 'Riyan Kurniawan'],
    },
  ],
};

/**
 * Determine avatar image path based on estimated gender from the person's name.
 * Uses keyword matching against common female name fragments.
 *
 * @param {string} name - Full name of the person.
 * @returns {string} Path to the avatar image.
 */
export const getAvatarPhoto = (name) => {
  const femaleKeywords = [
    'nia', 'dewi', 'nila', 'nurmala', 'asih', 'chyntia', 'devi', 'alita',
    'faridzatul', 'levi', 'nauraa', 'syafina', 'siti', 'juwita', 'santi',
    'marhani', 'pramesta',
  ];

  const lowerName = name.toLowerCase();
  const isFemale = femaleKeywords.some((keyword) => lowerName.includes(keyword));

  // Hash name to select avatar variant (1 or 2)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variant = (Math.abs(hash) % 2) + 1;

  return isFemale ? `/assets/avatar_f${variant}.png` : `/assets/avatar_m${variant}.png`;
};

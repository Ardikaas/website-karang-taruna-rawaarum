const InfoItem = require('../models/InfoItem');

const seedDatabase = async () => {
  try {
    const count = await InfoItem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial data for InfoItems...');
      const seedItems = [
        {
          title: 'Lowongan Kerja',
          description: 'Informasi lowongan kerja terbaru, pelatihan kerja, dan program magang untuk warga Rawaarum.',
          type: 'loker',
          date: '10 Juli 2026',
          imageUrl: '/assets/lowongan_kerja.png',
          badge: 'Loker',
          linkText: 'Lihat Lowongan'
        },
        {
          title: 'Potensi UMKM',
          description: 'Kenali produk unggulan kreatif, kerajinan tangan, dan usaha kuliner warga binaan Rawaarum.',
          type: 'umkm',
          date: '08 Juli 2026',
          imageUrl: '/assets/potensi_umkm.png',
          badge: 'UMKM',
          linkText: 'Lihat UMKM'
        },
        {
          title: 'Info Kegiatan',
          description: 'Update agenda, dokumentasi gotong royong, dan kegiatan sosial kepemudaan Karang Taruna.',
          type: 'kegiatan',
          date: '05 Juli 2026',
          imageUrl: '/assets/info_kegiatan.png',
          badge: 'Kegiatan',
          linkText: 'Lihat Kegiatan'
        },
        {
          title: 'Pengumuman',
          description: 'Informasi penting kelurahan, rilis kebijakan pemuda, serta agenda rapat umum bulanan warga.',
          type: 'pengumuman',
          date: '01 Juli 2026',
          imageUrl: '/assets/pengumuman.png',
          badge: 'Penting',
          linkText: 'Lihat Pengumuman'
        }
      ];
      await InfoItem.insertMany(seedItems);
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;

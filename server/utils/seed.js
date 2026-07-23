const bcrypt = require('bcryptjs');
const InfoItem = require('../models/InfoItem');
const Admin = require('../models/Admin');
const Pengurus = require('../models/Pengurus');
const SiteSettings = require('../models/SiteSettings');
const Program = require('../models/Program');
const Partner = require('../models/Partner');

const seedDatabase = async () => {
  try {
    // --------------- Seed InfoItems ---------------
    const infoCount = await InfoItem.countDocuments();
    if (infoCount === 0) {
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
      console.log('InfoItems seeded successfully.');
    }

    // --------------- Seed Admin User ---------------
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding default admin user...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await Admin.create({ username: 'admin', passwordHash });
      console.log('Admin user seeded. Username: admin | Password: admin123');
    }

    // --------------- Seed Pengurus ---------------
    const pengurusCount = await Pengurus.countDocuments();
    if (pengurusCount === 0) {
      console.log('Seeding initial data for Pengurus...');
      const seedPengurus = [];

      // 1. Pembina
      seedPengurus.push({
        name: 'Kepala Kelurahan Rawa Arum',
        role: 'Pelindung / Pembina',
        category: 'pembina',
        level: 1
      });

      // 2. Harian
      const harianList = [
        { name: 'Rifki Amrullah', role: 'Ketua', level: 1 },
        { name: 'Imamul Hakim, S.AP', role: 'Wakil Ketua I', level: 2 },
        { name: 'Insan Ansori', role: 'Wakil Ketua II', level: 2 },
        { name: 'Ibnu Aminudin, S.HI', role: 'Sekretaris', level: 3 },
        { name: 'Lendhia Marhani Pramesta, S.AP', role: 'Wakil Sekretaris', level: 3 },
        { name: 'Febri Kurniawan, S.E', role: 'Bendahara', level: 3 },
        { name: 'Cahya Agung Prayoga, S.T', role: 'Wakil Bendahara', level: 3 },
      ];
      harianList.forEach(h => {
        seedPengurus.push({
          name: h.name,
          role: h.role,
          category: 'harian',
          level: h.level
        });
      });

      // 3. Bidang-Bidang
      const bidangRaw = [
        {
          id: 'kaderisasi',
          title: 'Pemberdayaan Aparatur Organisasi & Kaderisasi',
          koor: 'Derico',
          anggota: ['Dedi Cahyadi', 'Nia Agustin', 'Tazkiyatunnufus', 'Sulthoni', 'Juwita Sari', 'Suhendar, S.T'],
        },
        {
          id: 'advokasi',
          title: 'Advokasi, HAM & Lingkungan Hidup',
          koor: 'Aneka Rosani, S.H',
          anggota: ['Alfa Nizar Al-Khaidar', 'Ilham Hari Mulyadi'],
        },
        {
          id: 'hubungan',
          title: 'Hubungan Antar-Lembaga, Masyarakat, dan Industri',
          koor: 'Fiki Kosasih',
          anggota: ['M. Syahrul Alamsyah', 'Rudi Hidayat', 'M. Nazarudin', 'Indra Saputra', 'Saiful Bahri', 'Endang Kurniawan', 'Ferdi Febianto'],
        },
        {
          id: 'perempuan',
          title: 'Pemberdayaan Perempuan dan Anak',
          koor: 'Nila Nurmala Dewi, S.I.Kom',
          anggota: ['Asih Herawati', 'Chyntia Permatasari', 'Devi Olivia', 'Alita', 'Faridzatul Aini', 'Levi Gustiana', 'Nauraa Lafa Ayu'],
        },
        {
          id: 'media',
          title: 'Media, Data, dan Informasi',
          koor: 'Dodi',
          anggota: ['Sahrul Tamam', 'Mufallih Arrosyid', 'Ardika Aji Setiawan', 'Didi Ardiansyah', 'Ali Rafiudin'],
        },
        {
          id: 'seni',
          title: 'Seni, Budaya, dan Olahraga',
          koor: 'Nafis Setiyadi',
          anggota: ['Yuda Andika', 'Dede Sapta Kurniawan', 'Muhlis', 'Saiful Anwar', 'Agus Hairil Anam', 'Muhammad Farhan Dzulqisthi'],
        },
        {
          id: 'ekonomi',
          title: 'Kemandirian Organisasi dan Ekonomi Kreatif',
          koor: 'Imron Rosyadi',
          anggota: ['Ade Rizki Ramadhan', 'Asep Saefulloh', 'Insan Effendi', 'Santi Dewi Nurjanah'],
        },
        {
          id: 'pendidikan',
          title: 'Pendidikan dan Keagamaan',
          koor: 'Dewi Kurnia, S.Sos',
          anggota: ['Syafina Yunia Rahma', 'Raihan Muliya', 'Juwita Sari', 'Siti Auliya Istiqomah'],
        },
        {
          id: 'sosial',
          title: 'Sosial, Kemanusiaan, dan Mitigasi Bencana',
          koor: 'Suhebi',
          anggota: ['Haris', 'Ponco Joko Susilo', 'Muhammad Rizki Salsabil', 'Agung Setiawan', 'Sulaiman Hadi', 'Riyan Kurniawan'],
        },
      ];

      bidangRaw.forEach(b => {
        seedPengurus.push({
          name: b.koor,
          role: 'Koordinator Bidang',
          category: 'bidang',
          level: 3,
          bidangId: b.id,
          bidangTitle: b.title,
          isKoordinator: true
        });

        b.anggota.forEach(name => {
          seedPengurus.push({
            name: name,
            role: 'Anggota',
            category: 'bidang',
            level: 3,
            bidangId: b.id,
            bidangTitle: b.title,
            isKoordinator: false
          });
        });
      });

      await Pengurus.insertMany(seedPengurus);
      console.log('Pengurus seeded successfully.');
    }

    // --------------- Seed SiteSettings ---------------
    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      console.log('Seeding default SiteSettings...');
      await SiteSettings.create({
        heroTitle: 'KARANG TARUNA KELURAHAN RAWA ARUM',
        heroSubtitle: 'Muda, Beda, Berkarya untuk Kemajuan Rawa Arum',
        heroDescription: 'Wadah pengembangan generasi muda Kelurahan Rawa Arum yang berkesadaran sosial, kreatif, inovatif, dan berdaya saing.',
        visiText: 'Terwujudnya Pemuda Rawa Arum yang Mandiri, Berkarakter, Kreatif, dan Berjiwa Sosial tinggi dalam membangun Kelurahan Rawa Arum yang Sejahtera.',
        misiList: [
          'Mewujudkan pemuda yang bertakwa, berakhlak mulia, dan berpengetahuan luas.',
          'Meningkatkan jiwa kewirausahaan dan kemandirian ekonomi pemuda kelurahan.',
          'Mendorong aksi tanggap sosial, pelestarian lingkungan, dan kemanusiaan.',
          'Mempererat tali silaturahmi dan solidaritas antar pemuda se-Kelurahan Rawa Arum.'
        ],
        address: 'Jl. Raya Merak No. 12, Kel. Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436',
        phone: '0812-3456-7890',
        whatsapp: '6281234567890',
        email: 'kontak@karangtarunarawaarum.id',
        socialInstagram: 'https://instagram.com/kartar_rawaarum',
        socialFacebook: 'https://facebook.com/kartar.rawaarum',
        socialYoutube: 'https://youtube.com/@kartarrawaarum'
      });
      console.log('SiteSettings seeded successfully.');
    }

    // --------------- Seed Programs ---------------
    const programCount = await Program.countDocuments();
    if (programCount === 0) {
      console.log('Seeding initial Programs...');
      const defaultPrograms = [
        { title: 'Pelatihan Kewirausahaan Pemuda', category: 'Ekonomi Kreatif', description: 'Workshop digital marketing, packaging UMKM, dan pendampingan legalitas NIB gratis untuk wirausaha muda.', icon: 'fa-lightbulb', target: 'Pemuda Pelaku Usaha', status: 'Berjalan' },
        { title: 'Turnamen Olahraga Pemuda Kelurahan', category: 'Olahraga & Seni', description: 'Kompetisi sepak bola, futsal, dan bulu tangkis antar RW se-Kelurahan Rawa Arum.', icon: 'fa-trophy', target: 'Pemuda & Warga', status: 'Berjalan' },
        { title: 'Pengajian & Kajian Rutin Remaja Masjid', category: 'Keagamaan', description: 'Kegiatan pembinaan mental, spiritual, dan kajian tematik kepemudaan setiap bulan.', icon: 'fa-hands-praying', target: 'Remaja Masjid & Warga', status: 'Berjalan' },
        { title: 'Aksi Bersih Lingkungan & Tanggap Bencana', category: 'Sosial & Lingkungan', description: 'Kerja bakti pembersihan drainase, penanaman pohon, dan kesiapsiagaan mitigasi banjir.', icon: 'fa-tree', target: 'Masyarakat Rawa Arum', status: 'Berjalan' },
        { title: 'Bantuan Hukum & Advokasi Hak Pemuda', category: 'Advokasi & HAM', description: 'Konsultasi hukum gratis dan pendampingan advokasi tenaga kerja lokal ke industri sekitar.', icon: 'fa-scale-balanced', target: 'Pencari Kerja & Pemuda', status: 'Berjalan' },
      ];
      await Program.insertMany(defaultPrograms);
      console.log('Programs seeded successfully.');
    }

    // --------------- Seed Partners ---------------
    const partnerCount = await Partner.countDocuments();
    if (partnerCount === 0) {
      console.log('Seeding initial Partners...');
      const defaultPartners = [
        { name: 'Pemerintah Kelurahan Rawa Arum', category: 'Pemerintahan', description: 'Mitra utama dalam pembinaan kemasyarakatan dan fasilitas kantor sekretariat.', logoUrl: '', websiteUrl: '#' },
        { name: 'Kecamatan Grogol Kota Cilegon', category: 'Pemerintahan', description: 'Instansi pembina program kepemudaan tingkat kecamatan.', logoUrl: '', websiteUrl: '#' },
        { name: 'Kemitraan Industri Kawasan Cilegon', category: 'Industri & Swasta', description: 'Sinergi penyaluran tenaga kerja lokal dan program Tanggung Jawab Sosial Lingkungan (TJSL).', logoUrl: '', websiteUrl: '#' },
      ];
      await Partner.insertMany(defaultPartners);
      console.log('Partners seeded successfully.');
    }

  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;

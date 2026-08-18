/**
 * Legal documents content & sections for Privacy Policy & Terms of Service
 * Compliant with Indonesian Law (UU PDP No. 27 Tahun 2022) & Permensos No. 25 Tahun 2019
 */

export const PRIVACY_POLICY_DATA = {
  lastUpdated: '18 Agustus 2026',
  effectiveDate: '1 Januari 2026',
  version: '2.4 (Revisi UU PDP 2026)',
  sections: [
    {
      id: 'pendahuluan',
      title: '1. Pendahuluan & Komitmen Kelembagaan',
      content: `Selamat datang di Website Resmi Karang Taruna Kelurahan Rawa Arum, Kecamatan Grogol, Kota Cilegon, Banten (selanjutnya disebut sebagai "Kami", "Pengurus", atau "Karang Taruna Rawa Arum"). 
      
Kami memegang teguh komitmen integritas, transparansi, dan tanggung jawab penuh dalam melindungi serta menjaga kerahasiaan data pribadi seluruh warga, anggota, mitra pemuda, dan pelaku UMKM yang memanfaatkan portal web ini. Kebijakan Privasi ini disusun sebagai bentuk kepatuhan kami terhadap Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) serta peraturan perundang-undangan terkait lainnya di wilayah Negara Kesatuan Republik Indonesia.`,
    },
    {
      id: 'pengumpulan-data',
      title: '2. Data Pribadi yang Kami Kumpulkan',
      content: `Kami hanya mengumpulkan data pribadi yang relevan, proporsional, dan benar-benar diperlukan untuk mendukung program pembinaan kepemudaan, keterbukaan informasi publik, dan pemberdayaan ekonomi masyarakat:
      
a. Formulir Pendaftaran Anggota Pemuda: Nama lengkap, Nomor Induk Kependudukan (NIK) untuk verifikasi domisili kelurahan, alamat tempat tinggal (RT/RW), nomor telepon/WhatsApp aktif, alamat email, minat bidang kepemudaan, serta motivasi bergabung.
b. Direktori & Etalase UMKM: Nama pemilik usaha, nama brand/unit usaha, nomor WhatsApp transaksi pedagang, alamat fisik lokasi gerai/toko, titik tautan Google Maps, foto dokumentasi produk, serta dokumen legalitas pendukung (NIB, sertifikat halal/P-IRT).
c. Formulir Kontak & Pengaduan Aspirasi: Nama, alamat email, nomor telepon, subjek pertanyaan, dan isi pesan/aspirasi warga.
d. Layanan Newsletter Digital: Alamat email aktif pengunjung yang secara sukarela mendaftar untuk menerima buletin agenda kepemudaan dan lowongan kerja.
e. Akun Portal Pengurus & Panel Admin: Username, nama lengkap pengurus, alamat email resmi, foto profil, dan kata sandi yang telah dienkripsi secara satu arah (*one-way hashing*).
f. Data Teknis & Log Perangkat: Alamat Protokol Internet (IP Address), tipe peramban (*browser*), sistem operasi, waktu akses, dan riwayat klik interaksi untuk keperluan keamanan infrastruktur serta analisis analitik internal.`,
    },
    {
      id: 'dasar-hukum',
      title: '3. Dasar Hukum & Tujuan Pemrosesan Data',
      content: `Pemrosesan data pribadi Anda dilakukan berdasarkan persetujuan eksplisit (*explicit consent*), pemenuhan kewajiban sosial kelembagaan berdasarkan Permensos No. 25 Tahun 2019, serta kepentingan yang sah (*legitimate interests*) organisasi:

1. Memvalidasi dan memproses pendaftaran keanggotaan pemuda di tingkat kelurahan.
2. Memfasilitasi promosi produk/jasa UMKM lokal Rawa Arum agar dapat diakses oleh masyarakat luas dan calon pembeli secara langsung tanpa potongan komisi.
3. Menyalurkan informasi agenda kegiatan sosial, lowongan pekerjaan dari mitra industri Cilegon, bakti lingkungan, dan turnamen olahraga.
4. Menanggapi pesan, pertanyaan, saran, serta permohonan kemitraan yang diajukan oleh masyarakat.
5. Mencegah tindakan penipuan siber (*fraud*), serangan *Brute-Force*, serta menjaga integritas keamanan basis data server kami.`,
    },
    {
      id: 'berbagi-data',
      title: '4. Pengungkapan & Pembagian Data kepada Pihak Ketiga',
      content: `Karang Taruna Kelurahan Rawa Arum MENJAMIN DENGAN TEGAS bahwa Kami TIDAK AKAN PERNAH menjual, menyewakan, memperdagangkan, atau mengalihkan data pribadi Anda kepada pihak komersial atau agensi periklanan pihak ketiga manapun.
      
Pengungkapan data hanya dapat terjadi dalam kondisi terbatas berikut:
- Integrasi Navigasi Langsung: Data nomor kontak pedagang UMKM dan lokasi gerai yang secara sadar dipublikasikan oleh pemilik usaha di etalase web agar pembeli dapat langsung terhubung via WhatsApp resmi pedagang atau Google Maps.
- Kepatuhan Hukum & Aparat Penegak Hukum: Apabila terdapat perintah pengadilan yang sah, proses investigasi kepolisian, atau kewajiban hukum resmi dari otoritas Pemerintah Kota Cilegon yang berwenang.
- Penyedia Infrastruktur Resmi: Layanan server cloud dan pengiriman email transaksional tepercaya yang terikat secara kontraktual untuk menjaga keamanan data.`,
    },
    {
      id: 'keamanan-data',
      title: '5. Langkah Keamanan & Perlindungan Siber',
      content: `Kami menerapkan standar keamanan teknis dan organisasi yang ketat untuk mengamankan data Anda dari akses tanpa hak, perusakan, atau manipulasi:
      
- Enkripsi Kata Sandi: Seluruh kata sandi akun dienkripsi menggunakan algoritma *Bcrypt* dengan *salt rounds* tinggi, sehingga tidak dapat dibaca bahkan oleh pengurus sistem.
- Protokol Komunikasi Aman: Seluruh transmisi data dienkripsi menggunakan sertifikat *Transport Layer Security* (HTTPS / TLS 1.3) dan *Strict-Transport-Security* (HSTS).
- Perlindungan Injeksi & Rate Limiting: Menerapkan mekanisme firewall aplikasi untuk menangkal injeksi NoSQL, Cross-Site Scripting (XSS), dan pembatasan frekuensi permintaan (*Rate Limiting*) untuk mencegah serangan DDoS.
- Audit Trail Forensik Keuangan: Seluruh pencatatan dan perubahan transaksi keuangan kas organisasi diarsipkan secara permanen dalam database forensik audit untuk mencegah korupsi dan manipulasi.`,
    },
    {
      id: 'hak-pemilik-data',
      title: '6. Hak-Hak Pemilik Data Pribadi',
      content: `Sesuai dengan amanat UU Pelindungan Data Pribadi (UU PDP), Anda memiliki hak-hak berikut:

1. Hak Memperoleh Informasi: Mengetahui kejelasan identitas, dasar kepentingan, dan tujuan pemrosesan data Anda.
2. Hak Akses & Perbaikan Data: Meminta salinan data pribadi Anda atau memperbarui data yang sudah tidak akurat melalui sekretariat kami.
3. Hak Penghapusan (*Right to Erasure*): Meminta penghapusan data pendaftaran anggota atau etalase UMKM Anda dari sistem kami sewaktu-waktu.
4. Hak Menarik Persetujuan (*Withdrawal of Consent*): Berhenti berlangganan buletin newsletter melalui tautan berhenti langganan atau konfirmasi pengurus.
5. Hak Mengajukan Keberatan: Mengajukan komplain terhadap pemrosesan data yang dianggap tidak sesuai dengan ketentuan regulasi.`,
    },
    {
      id: 'kebijakan-cookie',
      title: '7. Kebijakan Cookie & Sesi Peramban',
      content: `Website Kami menggunakan cookie dan penyimpanan lokal peramban (*LocalStorage*) yang bersifat esensial:
- Cookie Sesi & Token Otentikasi: Digunakan untuk memverifikasi status login pengurus dan menjaga sesi tetap aman selama beraktivitas di panel admin.
- Preferensi Pengguna: Menyimpan preferensi tampilan antarmuka (seperti status filter pencarian katalog UMKM).
Kami tidak menggunakan *Third-Party Tracking Cookies* untuk pelacakan perilaku lintas situs. Anda dapat mengatur atau menonaktifkan cookie melalui pengaturan peramban Anda.`,
    },
    {
      id: 'perubahan-kebijakan',
      title: '8. Pembaruan Kebijakan Privasi',
      content: `Kami berhak melakukan penyesuaian atau pembaruan terhadap Kebijakan Privasi ini sewaktu-waktu guna menyelaraskan dengan perkembangan teknologi, regulasi perundang-undangan baru, atau penambahan fitur layanan Karang Taruna. Setiap pembaruan material akan diumumkan melalui portal web ini dengan mencantumkan tanggal revisi terbaru di bagian atas dokumen.`,
    },
    {
      id: 'kontak-dpo',
      title: '9. Kontak & Pejabat Pengelola Data (DPO)',
      content: `Jika Anda memiliki pertanyaan, saran, permohonan akses data, atau keluhan terkait penerapan Kebijakan Privasi ini, silakan hubungi Tim Kesekretariatan & Pengelola Data Karang Taruna Kelurahan Rawa Arum melalui saluran resmi:
      
- Sekretariat: Kantor Kelurahan Rawa Arum, Jl. Rawa Arum No. 12, Kec. Grogol, Kota Cilegon, Banten 42436
- Email Resmi: sekretariat@kttunasarum.com / kontak@kttunasarum.com
- Layanan Hotline WhatsApp: 0812-3456-7890 (Hari Kerja: 08.00 - 17.00 WIB)`,
    },
  ],
};

export const TERMS_CONDITION_DATA = {
  lastUpdated: '18 Agustus 2026',
  effectiveDate: '1 Januari 2026',
  version: '2.3',
  sections: [
    {
      id: 'penerimaan',
      title: '1. Penerimaan Syarat & Ketentuan',
      content: `Dengan mengakses, menjelajahi, atau memanfaatkan layanan pada Website Resmi Karang Taruna Kelurahan Rawa Arum (https://kttunasarum.com), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Syarat dan Ketentuan ini. Apabila Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan portal website ini.`,
    },
    {
      id: 'definisi-layanan',
      title: '2. Definisi & Ruang Lingkup Layanan',
      content: `Portal web ini merupakan media informasi digital nirlaba yang dikelola oleh Pengurus Karang Taruna Kelurahan Rawa Arum masa bakti berjalan, yang berfungsi untuk:
      
1. Mempublikasikan struktur organisasi, visi misi, dan program kerja kepemudaan.
2. Menyajikan berita kegiatan sosial kemasyarakatan, keagamaan, olahraga, dan lingkungan hidup.
3. Menyediakan etalase direktori promosi Usaha Mikro, Kecil, dan Menengah (UMKM) warga Rawa Arum.
4. Membagikan informasi lowongan kerja (*job vacancy*) dan pelatihan keterampilan untuk pemuda.
5. Memfasilitasi pendaftaran anggota baru dan saluran pengaduan aspirasi warga.
6. Menyajikan laporan transparansi keuangan kas organisasi secara akuntabel dan terbuka kepada masyarakat.`,
    },
    {
      id: 'keanggotaan',
      title: '3. Ketentuan Pendaftaran Anggota Pemuda',
      content: `Pendaftaran anggota Karang Taruna melalui portal web ini tunduk pada kriteria:
- Pemuda/pemudi yang berdomisili atau beraktivitas di wilayah Kelurahan Rawa Arum, berusia antara 13 hingga 45 tahun (sesuai Pedoman Dasar Karang Taruna).
- Memberikan data identitas asli, valid, dan dapat dipertanggungjawabkan saat mengisi formulir pendaftaran.
- Bersedia menjunjung tinggi nama baik organisasi, menghormati nilai-nilai Pancasila, dan aktif berpartisipasi dalam kegiatan sosial kepemudaan.
- Pengurus berhak melakukan verifikasi administratif dan menolak atau menonaktifkan pendaftaran yang memuat informasi palsu.`,
    },
    {
      id: 'katalog-umkm',
      title: '4. Ketentuan Publikasi Katalog & Etalase UMKM',
      content: `Bagi pelaku usaha yang mendaftarkan atau tercantum pada etalase direktori UMKM:
- Legalitas & Kepatuhan Produk: Pelaku usaha wajib memastikan bahwa produk makanan, minuman, barang, atau jasa yang dipromosikan adalah halal (bagi produk pangan wajib), higienis, aman, serta tidak melanggar hukum RI (bebas miras, narkoba, judi, penipuan, atau barang selundupan).
- Kebenaran Informasi: Pelaku usaha bertanggung jawab penuh atas kebenaran harga, deskripsi produk, alamat gerai, dan foto dokumentasi yang diserahkan kepada pengurus.
- Transaksi Independen: Karang Taruna Rawa Arum bertindak sebagai media fasilitator promosi gratis dan BUKAN merupakan pihak perantara transaksi (*payment gateway*). Segala kesepakatan jual beli, pembayaran, pengiriman, dan garansi merupakan hubungan hukum langsung antara pembeli dan pemilik UMKM.`,
    },
    {
      id: 'info-loker',
      title: '5. Ketentuan Informasi Lowongan Kerja',
      content: `Informasi lowongan pekerjaan yang ditampilkan pada halaman portal dikumpulkan dari mitra industri, instansi pemerintahan, dan perusahaan swasta di kawasan Cilegon dan sekitarnya:
- Larangan Pungutan Liar: Karang Taruna Rawa Arum dan seluruh mitra perusahaan TIDAK PERNAH memungut biaya apapun (biaya tes, seragam, atau administrasi) dalam proses rekrutmen kerja.
- Kewaspadaan Pelamar: Pelamar kerja diimbau untuk selalu berhati-hati terhadap oknum yang mengatasnamakan perusahaan mitra. Laporkan ke kontak resmi kami jika menemukan kejanggalan dalam lowongan yang tertera.`,
    },
    {
      id: 'hak-cipta',
      title: '6. Hak Kekayaan Intelektual (Hak Cipta)',
      content: `Seluruh konten, desain antarmuka, logo resmi Karang Taruna, maskot, artikel berita resmi, dokumentasi foto/video kegiatan, dan kode pemrograman pada website ini dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.
      
Pengunjung diizinkan untuk membagikan tautan artikel atau foto kegiatan untuk keperluan edukasi dan sosial non-komersial dengan wajib mencantumkan atribusi sumber jelas kepada "Karang Taruna Kelurahan Rawa Arum". Dilarang keras menyalin, memodifikasi, atau memanfaatkan aset grafis web ini untuk kepentingan komersial tanpa izin tertulis dari Pengurus.`,
    },
    {
      id: 'larangan-pengguna',
      title: '7. Perilaku Pengguna yang Dilarang',
      content: `Dalam menggunakan website ini, setiap pengguna dilarang keras untuk:
1. Melakukan tindakan peretasan (*hacking*), injeksi skrip berbahaya (SQL/NoSQL injection, XSS), atau mencoba membobol sistem otentikasi admin.
2. Memanfaatkan formulir kontak atau pendaftaran untuk mengirimkan spam, tautan judi online, konten pornografi, ujaran kebencian, fitnah, atau hoaks (SARA).
3. Melakukan upaya serangan Distributed Denial of Service (DDoS) atau manipulasi frekuensi permintaan (*request flooding*) yang dapat merusak ketersediaan layanan server.
4. Meniru identitas (*impersonation*) pengurus resmi Karang Taruna untuk tujuan penipuan masyarakat.`,
    },
    {
      id: 'batasan-tanggung-jawab',
      title: '8. Batasan Tanggung Jawab (Disclaimer)',
      content: `Website ini disediakan atas dasar "sebagaimana adanya" (*as is*) dan "sebagaimana tersedia" (*as available*). Pengurus berupaya maksimal menjaga keakuratan data dan kelancaran akses sistem 24/7. Namun demikian, Karang Taruna Rawa Arum tidak bertanggung jawab atas:
- Kerugian tidak langsung akibat gangguan jaringan internet publik atau kendala pada penyedia hosting pihak ketiga.
- Ketidaksesuaian transaksi jual-beli antara konsumen dengan pemilik UMKM binaan.
- Keputusan penerimaan atau penolakan lamaran kerja yang sepenuhnya menjadi hak prerogatif perusahaan pemberi kerja.`,
    },
    {
      id: 'hukum-berlaku',
      title: '9. Hukum yang Berlaku & Penyelesaian Sengketa',
      content: `Syarat dan Ketentuan ini diatur dan ditafsirkan semata-mata berdasarkan hukum dan peraturan perundang-undangan yang berlaku di Negara Kesatuan Republik Indonesia.
      
Segala perselisihan atau kesalahpahaman yang timbul sehubungan dengan penggunaan website ini akan diselesaikan secara musyawarah untuk mufakat melalui semangat kekeluargaan dan gotong royong kepemudaan. Apabila musyawarah tidak mencapai mufakat, perselisihan akan diselesaikan melalui yurisdiksi Pengadilan Negeri Serang / Cilegon yang berwenang.`,
    },
    {
      id: 'penutup',
      title: '10. Hubungi Kami',
      content: `Untuk pertanyaan, permohonan klarifikasi, atau laporan pelanggaran terkait Syarat & Ketentuan ini, Anda dapat menghubungi:
      
- Kantor Sekretariat: Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436
- Email Legal: legal@kttunasarum.com / kontak@kttunasarum.com
- Telepon/WhatsApp: 0812-3456-7890`,
    },
  ],
};

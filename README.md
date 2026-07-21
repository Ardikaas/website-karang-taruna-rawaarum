# Karang Taruna Kelurahan Rawa Arum

**Platform digital resmi** Karang Taruna Kelurahan Rawa Arum, Kecamatan Grogol, Kota Cilegon, Banten.
Dibangun sebagai monorepo fullstack dengan React (frontend) dan Express.js (backend).

---

## Tentang Proyek

Website ini berfungsi sebagai pusat informasi dan layanan digital bagi Karang Taruna Kelurahan Rawa Arum, meliputi:

- **Portal Informasi** -- Lowongan kerja, kegiatan, pengumuman, dan UMKM binaan
- **Profil Organisasi** -- Visi-misi, pilar kerja, roadmap program, dan struktur organisasi lengkap
- **Kemitraan** -- Paket sponsorship dan informasi kolaborasi dengan industri
- **Pendaftaran Anggota** -- Formulir pendaftaran anggota baru secara online
- **Admin Portal** -- Halaman administrasi sederhana untuk mengelola konten informasi
- **Newsletter** -- Sistem berlangganan email untuk update berita terbaru

---

## Arsitektur Monorepo

```
karangtaruna-rawaarum/
├── client/                  # Frontend (React + Vite)
│   └── src/
│       ├── components/      # Komponen UI yang reusable
│       ├── constants/       # Data statis dan konfigurasi konstan
│       ├── pages/           # Halaman-halaman utama (satu file per route)
│       ├── services/        # API service layer (abstraksi HTTP)
│       ├── App.jsx          # Root layout dan routing
│       └── main.jsx         # Entry point aplikasi
├── server/                  # Backend (Express.js + MongoDB)
│   ├── config/              # Konfigurasi database
│   ├── controllers/         # Business logic handler per resource
│   ├── models/              # Mongoose schema dan model
│   ├── routes/              # Definisi endpoint routing
│   └── utils/               # Utilitas (seeder, helper)
├── .agents/                 # Panduan SOP untuk AI Agents
│   └── AGENTS.md
├── package.json             # Root workspace config (npm workspaces)
└── README.md                # Dokumentasi ini
```

### Tech Stack

| Layer     | Teknologi                             |
| --------- | ------------------------------------- |
| Frontend  | React 19, React Router 7, Vite 8     |
| Backend   | Express 5, Mongoose 9                |
| Database  | MongoDB (lokal atau Atlas)            |
| Tooling   | npm Workspaces, Concurrently, oxlint  |

---

## Prasyarat

Pastikan perangkat Anda sudah memiliki:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (lokal) atau koneksi ke MongoDB Atlas

---

## Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd karangtaruna-rawaarum

# 2. Install seluruh dependensi (client + server sekaligus)
npm install

# 3. Konfigurasi environment variable server
# Salin lalu sesuaikan file .env di folder server/
cp server/.env.example server/.env
```

---

## Menjalankan Development Server

```bash
# Jalankan frontend dan backend secara bersamaan
npm run dev

# Atau jalankan masing-masing secara terpisah:
npm run dev:client    # Frontend di http://localhost:5173
npm run dev:server    # Backend  di http://localhost:5000
```

---

## Build Produksi

```bash
# Build frontend untuk deployment
npm run build:client

# Jalankan server produksi
npm run start:server
```

---

## Variabel Lingkungan

Buat file `server/.env` dengan konfigurasi berikut:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/karangtaruna
```

---

## API Endpoints

| Method | Endpoint            | Deskripsi                          |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/api/info`         | Ambil semua item informasi         |
| GET    | `/api/info?type=X`  | Filter berdasarkan tipe            |
| POST   | `/api/info`         | Tambahkan item informasi baru      |
| GET    | `/api/register`     | Daftar pendaftaran anggota         |
| POST   | `/api/register`     | Kirim pendaftaran anggota baru     |
| GET    | `/api/newsletter`   | Daftar subscriber newsletter       |
| POST   | `/api/newsletter`   | Daftarkan email ke newsletter      |
| GET    | `/api/health`       | Health check status server         |

---

## Kontribusi

1. Buat branch baru dari `main`
2. Ikuti panduan penulisan kode di [.agents/AGENTS.md](.agents/AGENTS.md)
3. Commit dengan pesan deskriptif (bahasa Indonesia atau Inggris)
4. Buat Pull Request dengan penjelasan perubahan

---

## Lisensi

Proyek ini dibuat untuk keperluan internal organisasi Karang Taruna Kelurahan Rawa Arum.
Hak cipta dilindungi.

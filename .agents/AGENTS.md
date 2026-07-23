# AGENTS.md -- Panduan SOP Pengembangan Kode

> [!CAUTION]
> **ATURAN SANGAT KETAT (STRICT RULE):** File ini (`.agents/AGENTS.md`) bersifat **READ-ONLY** untuk AI Agent. AI Agent **DILARANG KERAS** mengubah, menambah, atau menghapus isi dokumen ini secara mandiri tanpa instruksi langsung dan spesifik dari User (Developer Manusia).

Dokumen ini adalah **Standard Operating Procedure (SOP)** yang WAJIB dipatuhi oleh setiap AI Agent maupun developer manusia yang bekerja pada codebase ini. Tidak ada pengecualian.

---

## Konteks Proyek

- **Nama**: Website Karang Taruna Kelurahan Rawa Arum
- **Tipe**: Monorepo Fullstack (npm Workspaces)
- **Frontend**: React 19 + Vite 8 (folder `client/`)
- **Backend**: Express 5 + Mongoose 9 (folder `server/`)
- **Database**: MongoDB

---

## Aturan Umum

1. **Bahasa kode**: Semua nama variabel, fungsi, komentar teknis, dan commit message ditulis dalam **bahasa Inggris**. Konten yang ditampilkan kepada pengguna (label UI, pesan error di frontend) boleh menggunakan bahasa Indonesia.
2. **Tidak ada `any` type abuse**: Meskipun project ini menggunakan JavaScript (bukan TypeScript), tetap hindari pola yang ambigu.
3. **Tidak ada `console.log` di production code**: Gunakan `console.warn` atau `console.error` hanya untuk penanganan error. Semua `console.log` debugging harus dihapus sebelum commit.
4. **Tidak ada inline style berlebihan**: Gunakan CSS class dari `index.css`. Inline style hanya diperbolehkan untuk nilai yang benar-benar dinamis (misalnya `style={{ borderColor: pkg.color }}`).
5. **Tidak ada magic number/string**: Konstanta harus didefinisikan di file terpisah dalam folder `constants/` (frontend) atau sebagai konfigurasi (backend).

---

## Struktur Folder

### Root Monorepo

```
karangtaruna-rawaarum/
├── client/               # Frontend workspace
├── server/               # Backend workspace
├── .agents/
│   └── AGENTS.md         # Dokumen ini (SOP wajib)
├── package.json          # Root workspace config
└── README.md             # Dokumentasi proyek
```

### Frontend (`client/src/`)

```
src/
├── components/           # Komponen UI reusable (Navbar, Footer, Modal, dll.)
├── constants/            # Data statis, mock data, konfigurasi konstan
├── pages/                # Satu file per halaman/route
├── services/             # API service layer (abstraksi fetch/HTTP)
├── App.jsx               # Root component (layout + routing)
├── App.css               # Style khusus App layout (jika ada)
├── index.css             # Design system global (variabel, utilitas, komponen CSS)
└── main.jsx              # Entry point (mount React ke DOM)
```

### Backend (`server/`)

```
server/
├── config/               # Konfigurasi (database, environment)
│   └── db.js
├── controllers/          # Business logic per resource (menerima req, mengembalikan res)
│   ├── info.controller.js
│   ├── register.controller.js
│   └── newsletter.controller.js
├── models/               # Mongoose schema dan model
│   ├── InfoItem.js
│   ├── Registration.js
│   └── Subscriber.js
├── routes/               # Deklarasi endpoint (hanya routing, tanpa logika)
│   ├── info.routes.js
│   ├── register.routes.js
│   └── newsletter.routes.js
├── utils/                # Utilitas (seeder, helper)
│   └── seed.js
├── server.js             # Entry point Express
└── .env                  # Environment variables (TIDAK di-commit)
```

---

## Konvensi Penamaan File

| Lokasi         | Pola Penamaan                 | Contoh                     |
| -------------- | ----------------------------- | -------------------------- |
| `components/`  | PascalCase `.jsx`             | `Navbar.jsx`, `Footer.jsx` |
| `pages/`       | PascalCase + `Page` suffix    | `LokerPage.jsx`            |
| `constants/`   | camelCase `.js`               | `mockData.js`              |
| `services/`    | camelCase `.js`               | `api.js`                   |
| `controllers/` | kebab-case + `.controller.js` | `info.controller.js`       |
| `routes/`      | kebab-case + `.routes.js`     | `info.routes.js`           |
| `models/`      | PascalCase `.js`              | `InfoItem.js`              |

---

## Konvensi Penulisan Kode

### Frontend (React)

1. **Functional components only** -- Tidak ada class component.
2. **Satu komponen utama per file** -- File `LokerPage.jsx` hanya boleh mengekspor `LokerPage`. Komponen pembantu kecil boleh didefinisikan di file yang sama selama tidak di-export.
3. **Destructure props** -- Selalu destructure props di parameter fungsi: `const Navbar = ({ scrolled, onOpenRegModal }) => { ... }`.
4. **Hooks di atas** -- Semua `useState`, `useEffect`, `useRef` harus dideklarasikan di bagian paling atas fungsi komponen, sebelum logika apapun.
5. **API calls melalui service layer** -- Semua HTTP request HARUS menggunakan fungsi dari `services/api.js`. Dilarang menulis `fetch()` langsung di komponen.
6. **Data statis di `constants/`** -- Data statis seperti mock fallback, struktur organisasi, daftar partner, dsb. harus disimpan di folder `constants/`, bukan di dalam komponen.

### Backend (Express)

1. **Route-Controller-Model pattern** -- Route hanya mendefinisikan path dan HTTP method, lalu memetakannya ke fungsi di controller. Controller menangani logika bisnis. Model hanya mendefinisikan schema.
2. **Async/await** -- Selalu gunakan `async/await` dengan blok `try/catch` untuk operasi asynchronous.
3. **Error response konsisten** -- Format error response: `{ error: "Pesan error" }`. Status code harus sesuai (400, 404, 500).
4. **CommonJS modules** -- Backend menggunakan `require()` / `module.exports` (bukan ES modules).
5. **Tidak ada logika bisnis di route files** -- Route file hanya boleh berisi `router.get()`, `router.post()`, dst. yang memanggil fungsi controller.

---

## Aturan CSS / Styling

1. **Vanilla CSS** -- Tidak menggunakan Tailwind, SASS, atau CSS-in-JS.
2. **CSS Variables** -- Semua warna, spacing, border-radius, dan shadow harus menggunakan CSS custom properties yang sudah didefinisikan di `index.css`.
3. **BEM-like naming** -- Gunakan konvensi penamaan yang deskriptif: `.info-card`, `.info-card-title`, `.info-tag-badge`.
4. **Responsive design** -- Semua layout harus responsive. Gunakan media query yang sudah ada di `index.css`.
5. **Tidak ada `!important`** -- Kecuali dalam kasus yang benar-benar kritis dan terdokumentasi.

---

## Aturan Git

1. **Jangan commit** `node_modules/`, `dist/`, `.env`, atau file backup (`.bak`).
2. **Pesan commit** harus deskriptif: `feat: add newsletter controller` atau `fix: handle offline fallback on LokerPage`.
3. **Satu fitur per commit** -- Hindari commit raksasa yang mencampur banyak perubahan tidak terkait.

---

## Menambah Fitur Baru

### Menambah Halaman Frontend Baru

1. Buat file di `client/src/pages/NamaPage.jsx`
2. Jika butuh data dari API, tambahkan fungsi di `client/src/services/api.js`
3. Jika butuh data fallback, tambahkan di `client/src/constants/mockData.js`
4. Daftarkan route baru di `client/src/App.jsx`

### Menambah Endpoint Backend Baru

1. Buat model di `server/models/NamaModel.js` (jika schema baru)
2. Buat controller di `server/controllers/nama.controller.js`
3. Buat route di `server/routes/nama.routes.js`
4. Daftarkan route di `server/server.js`

---

## Sistem Otomatisasi Git & Linter

Proyek ini menggunakan sistem otomatisasi Git Hook untuk menjaga kerapian dan validitas kode sebelum masuk ke repositori GitHub:

1. **Prettier (Code Formatter)**: Konfigurasi formatting diatur di `.prettierrc` di root. Semua spasi, tab, tanda kutip, dan titik koma akan dirapikan otomatis saat commit.
2. **Husky & lint-staged**: Git Hook diatur di `.husky/pre-commit` yang memicu `npx lint-staged` sebelum proses commit diselesaikan.
3. **Oxlint (Linter)**:
   - Menggunakan konfigurasi `client/.oxlintrc.json` dan `server/.oxlintrc.json`.
   - Mengaktifkan aturan `"no-console": "error"`. Setiap `console.log` yang tertinggal akan dideteksi sebagai error, dan proses commit otomatis dibatalkan (_aborted_).
   - Untuk debugging, gunakan `console.warn()` atau `console.error()`, atau hapus print out sebelum melakukan commit.
4. **API Testing**: Gunakan file `api-test.http` di root untuk melakukan uji coba endpoint server lokal langsung dari editor dengan ekstensi _REST Client_ (tanpa memerlukan Postman).

---

## Larangan Keras

- Jangan pernah hardcode URL API (`http://localhost:5000`) di banyak tempat. Gunakan konstanta terpusat.
- Jangan duplikasi mock data di setiap halaman. Gunakan `constants/mockData.js`.
- Jangan menulis komponen monolitik yang lebih dari 300 baris. Pecah menjadi sub-komponen.
- Jangan mengabaikan error handling. Setiap `fetch` atau operasi database harus memiliki `catch`.
- Jangan mengubah struktur folder tanpa memperbarui dokumen ini.

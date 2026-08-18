# AGENTS.md -- Panduan SOP Pengembangan Kode

> [!CAUTION]
> **ATURAN SANGAT KETAT (STRICT RULE):** File ini (`.agents/AGENTS.md`) bersifat **READ-ONLY** untuk AI Agent. AI Agent **DILARANG KERAS** mengubah, menambah, atau menghapus isi dokumen ini secara mandiri tanpa instruksi langsung dan spesifik dari saya (Ardikaas).

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
├── components/           # Komponen UI reusable (Navbar, Footer, SEO, ErrorBoundary, dll.)
├── constants/            # Data statis, mock data, seoData, legalData, konfigurasi konstan
├── context/              # React Context (AuthContext, ToastContext)
├── pages/                # Satu file per halaman/route (PascalCase + Page suffix)
│   ├── admin/            # Halaman admin portal
│   └── pengurus/         # Halaman profil & portal pengurus
├── services/             # API service layer (abstraksi fetch/HTTP)
├── utils/                # Helper utilitas client (sanitizeHtml.js, dll.)
├── App.jsx               # Root component (layout + routing + ErrorBoundary)
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
│   ├── achievement.controller.js
│   ├── auth.controller.js
│   ├── finance.controller.js
│   ├── holiday.controller.js
│   ├── info.controller.js
│   ├── message.controller.js
│   ├── newsletter.controller.js
│   ├── partner.controller.js
│   ├── pengurus.controller.js
│   ├── program.controller.js
│   ├── register.controller.js
│   ├── seo.controller.js
│   ├── settings.controller.js
│   ├── umkm.controller.js
│   └── weather.controller.js
├── middleware/           # Auth, RBAC, dan Rate Limiting
│   ├── auth.middleware.js
│   └── rateLimiter.js
├── models/               # Mongoose schema dan model
├── routes/               # Deklarasi endpoint (hanya routing, tanpa logika)
├── utils/                # Utilitas (security.js, seeder, helper)
│   └── security.js
├── server.js             # Entry point Express + Security Headers + Error Handler
└── .env                  # Environment variables (TIDAK di-commit)
```

---

## Konvensi Penamaan File

| Lokasi         | Pola Penamaan                 | Contoh                                      |
| -------------- | ----------------------------- | ------------------------------------------- |
| `components/`  | PascalCase `.jsx`             | `Navbar.jsx`, `SEO.jsx`, `Footer.jsx`       |
| `pages/`       | PascalCase + `Page` suffix    | `LokerPage.jsx`, `PrivacyPolicyPage.jsx`    |
| `constants/`   | camelCase `.js`               | `mockData.js`, `seoData.js`, `legalData.js` |
| `services/`    | camelCase `.js`               | `api.js`                                    |
| `utils/`       | camelCase `.js`               | `security.js`, `sanitizeHtml.js`            |
| `controllers/` | kebab-case + `.controller.js` | `info.controller.js`, `seo.controller.js`   |
| `routes/`      | kebab-case + `.routes.js`     | `info.routes.js`, `seo.routes.js`           |
| `models/`      | PascalCase `.js`              | `InfoItem.js`, `Registration.js`            |

---

## Konvensi Penulisan Kode

### Frontend (React)

1. **Functional components only** -- Tidak ada class component (kecuali `ErrorBoundary.jsx` yang memang memerlukan class component lifecycle).
2. **Satu komponen utama per file** -- File `LokerPage.jsx` hanya boleh mengekspor `LokerPage`. Komponen pembantu kecil boleh didefinisikan di file yang sama selama tidak di-export.
3. **Destructure props** -- Selalu destructure props di parameter fungsi: `const Navbar = ({ scrolled, onOpenRegModal }) => { ... }`.
4. **Hooks di atas** -- Semua `useState`, `useEffect`, `useRef` harus dideklarasikan di bagian paling atas fungsi komponen, sebelum logika apapun.
5. **API calls melalui service layer** -- Semua HTTP request HARUS menggunakan fungsi dari `services/api.js`. Dilarang menulis `fetch()` langsung di komponen.
6. **Data statis di `constants/`** -- Data statis seperti mock fallback, struktur organisasi, daftar partner, data legalitas, dsb. harus disimpan di folder `constants/`, bukan di dalam komponen.
7. **React Error Boundary** -- Seluruh rute `<Routes>` wajib dibungkus oleh `<ErrorBoundary>` agar runtime crash tidak menyebabkan _blank screen_.

### Backend (Express)

1. **Route-Controller-Model pattern** -- Route hanya mendefinisikan path dan HTTP method, lalu memetakannya ke fungsi di controller. Controller menangani logika bisnis. Model hanya mendefinisikan schema.
2. **Async/await** -- Selalu gunakan `async/await` dengan blok `try/catch` untuk operasi asynchronous.
3. **Error response konsisten** -- Format error response: `{ error: "Pesan error" }`. Status code harus sesuai (400, 401, 403, 404, 500).
4. **CommonJS modules** -- Backend menggunakan `require()` / `module.exports` (bukan ES modules).
5. **Tidak ada logika bisnis di route files** -- Route file hanya boleh berisi `router.get()`, `router.post()`, dst. yang memanggil fungsi controller.

---

## Standar Keamanan & Vulnerability Hardening (STRICT)

1. **Validasi MongoDB ObjectId**:
   - Setiap endpoint yang menerima parameter ID (seperti `req.params.id` pada `/api/info/:id`, `/api/umkm/:id`, `/api/finance/:id`, dll.) **WAJIB** divalidasi menggunakan `isValidObjectId(id)` dari `server/utils/security.js` sebelum query Mongoose dieksekusi.
   - Jika ID tidak valid, kembalikan HTTP 400 `{ error: "ID ... tidak valid." }`. Dilarang membiarkan Mongoose melempar uncaught `CastError`.

2. **Pencegahan Injeksi & Sanitasi Input (Backend)**:
   - Sanitasi seluruh payload mutasi `req.body` menggunakan `sanitizeInput(str)` atau `sanitizeObject(obj)` dari `server/utils/security.js` untuk membersihkan tag berbahaya, atribut event `onerror=`, `onload=`, dan pseudo-protocol `javascript:`.

3. **Pencegahan Stored XSS (Frontend)**:
   - Setiap render konten HTML kaya (_rich text_) yang menggunakan `dangerouslySetInnerHTML` **WAJIB** dibungkus dengan `sanitizeHtml(html)` dari `client/src/utils/sanitizeHtml.js`.

4. **Role-Based Access Control (RBAC) & Proteksi Rute**:
   - Seluruh endpoint mutasi (`POST`, `PUT`, `DELETE`) pada entitas sistem (Program Kerja, Mitra/Kemitraan, Pengurus, Pengaturan, dll.) WAJIB dilindungi middleware `requireAdmin` atau `requireRole(...)`.
   - Endpoint upload berkas (`/api/upload`) WAJIB memerlukan otentikasi login serta validasi tipe MIME/ekstensi file yang ketat (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).

5. **Rate Limiting & Anti-DoS**:
   - Terapkan `viewClickLimiter` pada endpoint publik yang melakukan _counter increment_ database (`/view`, `/click`).
   - Terapkan `uploadLimiter` pada endpoint unggah berkas `/api/upload`.
   - Terapkan `globalApiLimiter` pada seluruh endpoint `/api/*`.

6. **Pencegahan Kebocoran Informasi (Information Leakage)**:
   - Gunakan `safeErrorMessage(err, fallbackMessage)` dalam blok `catch` controller untuk mencegah kebocoran stack trace database atau credential string koneksi MongoDB ke publik.
   - Konfigurasikan Helmet security headers pada `server.js` (HSTS `max-age: 31536000`, `xContentTypeOptions: true`, `xFrameOptions: SAMEORIGIN`, `referrerPolicy`).

---

## Standar Optimasi Mesin Pencari (SEO SOP)

1. **Komponen `<SEO />` di Setiap Halaman**:
   - Setiap halaman publik di `client/src/pages/` WAJIB mengimpor dan menyematkan komponen `<SEO />` dari `client/src/components/SEO.jsx`.
   - Props yang wajib diisi: `title`, `description`, `canonicalUrl`, serta `schema` terstruktur.
   - Untuk halaman detail dinamis (`InfoDetailPage.jsx`, `UmkmDetailPage.jsx`), generate metadata dinamis berdasarkan judul artikel/nama UMKM, deskripsi kutipan, dan foto cover.

2. **Schema.org Structured Data (JSON-LD)**:
   - Gunakan helper generator dari `client/src/constants/seoData.js` (`buildBreadcrumbSchema`, `buildOrganizationSchema`, `buildWebSiteSchema`, `buildArticleSchema`).
   - Selalu sertakan geo-koordinat Kelurahan Rawa Arum (`-5.9863, 106.0125`) dan entitas `Organization` resmi.

3. **Kebijakan `noIndex` pada Halaman Non-Publik / Error**:
   - Halaman error (404, 500, 403, 400, 503) dan halaman internal portal admin WAJIB menyematkan `<SEO noIndex={true} />` agar mesin pencari Google/Bing tidak mengindeks halaman tersebut sebagai konten publik.

4. **Dynamic XML Sitemap & Robots.txt**:
   - Endpoint sitemap publik dihasilkan secara dinamis melalui `GET /sitemap.xml` di `server/controllers/seo.controller.js`.
   - Setiap penambahan rute halaman publik baru WAJIB didaftarkan ke dalam array `staticPages` di `seo.controller.js` dan file fallback `client/public/sitemap.xml`.
   - Robots.txt dikonfigurasi melalui `GET /robots.txt` dengan tautan langsung ke `https://kttunasarum.com/sitemap.xml` dan disallow terhadap `/admin`, `/pengurus`, dan `/api/`.

5. **Open Graph, Twitter Cards, & Mobile Manifest**:
   - Pertahankan meta tag Open Graph (`og:title`, `og:image`, `og:url`, `og:type`) dan Twitter Card di `client/index.html` dan `SEO.jsx`.
   - Pastikan berkas `site.webmanifest` dan favicon selalu valid dan dapat diakses publik.

---

## Aturan CSS / Styling

1. **Vanilla CSS** -- Tidak menggunakan Tailwind, SASS, atau CSS-in-JS.
2. **CSS Variables** -- Semua warna, spacing, border-radius, dan shadow harus menggunakan CSS custom properties yang sudah didefinisikan di `index.css`.
3. **BEM-like naming** -- Gunakan konvensi penamaan yang deskriptif: `.info-card`, `.info-card-title`, `.info-tag-badge`.
4. **Fully Responsive Design (STRICT)** -- Seluruh halaman, komponen, modal, form, tabel, dan admin portal WAJIB bersifat _fully responsive_ dan nyaman digunakan dari resolusi terluar/terkecil (HP mini 320px, mobile, tablet) hingga terbesar (desktop ultra-wide, Smart TV 4K). Dilarang keras membuat komponen yang patah, teks terpotong, overflow tidak rapi, atau fungsi UI yang rusak di layar kecil.
5. **Tidak ada `!important`** -- Kecuali dalam kasus yang benar-benar kritis dan terdokumentasi (misalnya CSS overrides responsif untuk komponen admin atau `@media print`).

---

## Aturan Git

1. **Jangan commit** `node_modules/`, `dist/`, `.env`, atau file backup (`.bak`).
2. **Pesan commit** harus deskriptif: `feat: add newsletter controller` atau `fix: handle offline fallback on LokerPage`.
3. **Satu fitur per commit** -- Hindari commit raksasa yang mencampur banyak perubahan tidak terkait.

---

## Menambah Fitur Baru

### Menambah Halaman Frontend Baru

1. Buat file di `client/src/pages/NamaPage.jsx`.
2. Pasang komponen `<SEO />` dengan schema breadcrumb dan metadata relevan.
3. Jika butuh data dari API, tambahkan fungsi di `client/src/services/api.js`.
4. Jika butuh data fallback, tambahkan di `client/src/constants/mockData.js`.
5. Daftarkan route baru di `client/src/App.jsx`.
6. Jika halaman publik, daftarkan URL di `server/controllers/seo.controller.js` dan `client/public/sitemap.xml`.

### Menambah Endpoint Backend Baru

1. Buat model di `server/models/NamaModel.js` (jika schema baru).
2. Buat controller di `server/controllers/nama.controller.js` (dengan `isValidObjectId`, `sanitizeObject`, dan `safeErrorMessage`).
3. Buat route di `server/routes/nama.routes.js` (dengan middleware RBAC & rate limiter jika relevan).
4. Daftarkan route di `server/server.js`.

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
- Jangan pernah merender rich text HTML dari user/database tanpa melalui `sanitizeHtml()`.
- Jangan pernah menerima parameter `:id` MongoDB tanpa verifikasi `isValidObjectId()`.
- Jangan mengubah struktur folder tanpa memperbarui dokumen ini.

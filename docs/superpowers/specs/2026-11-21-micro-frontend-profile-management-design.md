# Micro Frontend: Host + Remote `profile-management`

**Tanggal:** 2026-11-21
**Status:** Disetujui untuk implementasi
**Repo terlibat:**

- `ivendor-superapps-host` (sudah ada)
- `ivendor-superapps-profile-management` (repo baru, terpisah)

---

## 1. Tujuan

Mengubah `ivendor-superapps-host` menjadi **host micro frontend** dan membuat
remote pertama `ivendor-superapps-profile-management` yang mengelola profil
vendor end-to-end (paritas dengan alur registrasi): profil vendor, PIC,
rekening bank, identifikasi pajak + dokumen, dan surat domisili.

Kartu **"Vendor Profile Management"** di home sudah ada tetapi hanya memunculkan
toast _coming soon_ (`src/app/pages/home/home.page.ts`). Setelah pekerjaan ini,
kartu tersebut membuka fitur nyata yang dimuat dari remote.

**Non-goal:** tidak menambah backend/API sungguhan, tidak menambah auth guard
baru, tidak mengubah `baseHref`, tidak mengubah `SessionService`.

---

## 2. Keputusan yang sudah dikunci

| #   | Topik              | Keputusan                                                                               |
| --- | ------------------ | --------------------------------------------------------------------------------------- |
| 1   | Deployment remote  | **B** — deploy terpisah, satu domain, beda path (`/remotes/profile-management/`)        |
| 2   | Struktur repo      | **Multi-repo** — dua repository Git terpisah, tanpa workspace bersama                   |
| 3   | Integrasi layout   | **A** — remote tampil di dalam shell host (sidebar/topbar/footer/tema tetap milik host) |
| 4   | Cakupan fitur      | **A** — paritas registrasi penuh + status verifikasi per section                        |
| 5   | Sumber data        | **A** — seed dari draft registrasi, fallback mock; persist `localStorage`               |
| 6   | Kontrak konteks    | **A** — input eksplisit dari host, reaktif (fungsi pembaca signal)                      |
| 7   | Mekanisme federasi | **A** — `@angular-architects/native-federation@22.2.5` + `@angular/build:application`   |
| 8   | Banner update      | **A** — satu banner agregat di host, membaca `version.json` host + remote               |
| 9   | Dev lokal          | **A** — dua terminal; manifest dev menunjuk `http://localhost:4201`                     |
| 10  | Shared UI          | **A** — remote menyalin komponen minimum + token tema (dokumentasi sinkronisasi)        |

---

## 3. Arsitektur

### 3.1 Peta repo

```
ivendor-superapps-host/
  public/federation.manifest.json           # daftar remote (varian per environment)
  public/federation.manifest.production.json
  public/federation.manifest.staging.json
  src/app/core/federation/
    federation.contract.ts                  # tipe + token string kontrak (disalin ke remote)
    remote-loader.ts                        # loadRemoteModule wrapper + error/retry
    federated-route.ts                      # definisi route profile-management
  src/app/core/update/app-update.service.ts # diperluas: multi version.json
  src/app/pages/profile-error/              # error state bila remote gagal dimuat

ivendor-superapps-profile-management/       # repo baru
  federation.config.mjs                     # name: 'profile-management'
  angular.json                              # builder @angular/build:application
  scripts/write-version.mjs                 # salinan, versi & commit repo remote
  scripts/sync-icons.mjs                    # salinan, ikon yang dipakai saja
  src/app/profile-management/
    routes.ts                               # diekspos sebagai './Routes'
    pages/{overview,vendor,pic,bank,tax,domicile}/
    state/profile.store.ts
    data/profile.seed.ts
    core/{storage.ts,asset-url.ts,profile-context.ts}
    i18n/profile.texts.ts                   # id/en/ja
  src/app/shared/ui/                        # salinan komponen minimum
  src/styles.css                            # token tema + class komponen yang dipakai
  AGENTS.md                                 # aturan kualitas disalin dari host
```

### 3.2 Alur runtime

1. User klik kartu di home atau item sidebar → router host menavigasi ke
   `#/profile-management`.
2. Route host memuat `./Routes` dari remote via `loadRemoteModule` (lazy).
3. Remote mengekspos array `Routes`; host memakai router, guard, dan layout
   miliknya sendiri — tidak ada dependensi melingkar.
4. Remote merender halaman di dalam `<router-outlet>` milik `AppShell`.

### 3.3 Shared singleton federasi

`@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`,
`rxjs`, `tslib`.

- Versi Angular dikunci sama di kedua repo (`22.2.x`).
- `@angular/cdk` **tidak** di-share; remote menghindari CDK bila memungkinkan.
- Host tidak meng-expose apa pun.

---

## 4. Routing & navigasi

### 4.1 Route host

```ts
// src/app/app.routes.ts — di dalam AppShell
{
  path: 'profile-management',
  title: 'Vendor Profile · iVendor Superapps',
  data: { page: 'profileManagement' },
  providers: [profileContextProvider()],
  loadChildren: () =>
    loadRemoteModule({ remoteName: 'profile-management', exposedModule: './Routes' }).then(
      (m) => m.PROFILE_MANAGEMENT_ROUTES,
    ),
}
```

### 4.2 Sub-route remote

| Path                           | Halaman                                             |
| ------------------------------ | --------------------------------------------------- |
| `/profile-management`          | Overview: ringkasan status verifikasi semua section |
| `/profile-management/vendor`   | Profil vendor                                       |
| `/profile-management/pic`      | Informasi PIC                                       |
| `/profile-management/bank`     | Rekening bank + permintaan bank baru                |
| `/profile-management/tax`      | KTP/NPWP/SPPKP/SKB                                  |
| `/profile-management/domicile` | Surat keterangan domisili                           |

- URL tetap hash: `/ivendor/#/profile-management/bank`.
- `?` redirect ke overview untuk path tidak dikenal: remote mendefinisikan
  wildcard child yang redirect ke overview (bukan halaman 404 host).

### 4.3 Navigasi

- `src/app/core/nav.ts`: tambah item **Profil Vendor** (`path: '/profile-management'`)
  dengan `children` per section.
- Home: kartu pertama menjadi `routerLink`; empat kartu lain tetap toast.
- Teks baru masuk `src/app/core/i18n/layout.texts.ts` untuk `id`, `en`, `ja`;
  `data.page` dipetakan di `topbar.ts` mengikuti pola yang ada.

---

## 5. Kontrak host ↔ remote

File `federation.contract.ts` **disalin** ke kedua repo (tidak di-import
lintas repo). Token memakai string agar identitasnya stabil lintas bundle.

```ts
export const PROFILE_CONTEXT = 'IVENDOR_PROFILE_CONTEXT';

export type Lang = 'id' | 'en' | 'ja';
export type ThemeMode = 'light' | 'dark';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface ProfileContext {
  lang: () => Lang;
  theme: () => ThemeMode;
  user: () => SessionUser | null;
  assetBase: string;
}
```

- Host menyediakan nilai lewat route `providers` (factory yang meng-inject
  `TranslationService`, `ThemeService`, `SessionService`).
- `lang`/`theme`/`user` berupa **fungsi pembaca signal**, sehingga perubahan
  bahasa/tema di host langsung membuat `computed` remote ikut berubah tanpa
  reload dan tanpa `CustomEvent`.
- Remote mengakses lewat helper `injectProfileContext()`; bila token tidak ada
  (remote dijalankan mandiri), helper mengembalikan default
  (`lang: 'id'`, `theme` dari `prefers-color-scheme`, `user: null`,
  `assetBase: ''`).
- Nilai `assetBase` berasal dari environment host: development
  `http://localhost:4201/`, staging
  `/ivendor-staging/remotes/profile-management/`, production
  `/remotes/profile-management/`. Helper `assetUrl(path)` di remote
  menggabungkan `assetBase` + path relatif.
- Perubahan bentuk kontrak wajib mengubah **kedua** salinan file dan
  mencatat versi kontrak di komentar header.

---

## 6. Data & persistensi

### 6.1 Model

```ts
type SectionId = 'vendor' | 'pic' | 'bank' | 'tax' | 'domicile';
type VerifyStatus = 'draft' | 'pending' | 'verified' | 'rejected';

interface FileRef {
  name: string;
  size: number;
  type: string;
  previewUrl: string | null; // object URL, hanya selama sesi
}

interface TaxDoc {
  name: string;
  address: string;
  file: FileRef | null;
}

interface ProfileRecord {
  version: 1;
  updatedAt: string;
  vendor: {
    name: string;
    type: 'CORPORATE' | 'INDIVIDUAL' | 'GOVERNMENT';
    category: string;
    countryIso: string;
    address: string;
    email: string;
  };
  pic: { name: string; email: string; phone: string; phoneCountryIso: string };
  bank: {
    bankId: string | null;
    bankName: string;
    country: string;
    branch: string;
    accountName: string;
    accountNumber: string;
    currency: string;
    recipientType: string;
    statement: FileRef | null;
    request: BankRequest | null;
  };
  tax: {
    entityType: 'national' | 'international' | 'government';
    ktp: TaxDoc;
    npwp: TaxDoc;
    sppkp: TaxDoc | null;
    skb: TaxDoc | null;
  };
  domicile: { file: FileRef | null };
  verifications: Record<SectionId, { status: VerifyStatus; note?: string; updatedAt: string }>;
}
```

`BankRequest` mengikuti bentuk yang sudah dipakai di
`src/app/pages/auth/bank-request-dialog.ts` (nama, negara, wilayah, alamat,
cabang, kota, SWIFT).

### 6.2 Seed & key

- Key: `appKey('profile.management.v1')` → `ivendor-profile.management.v1`.
- Draft registrasi ditulis host ke **`sessionStorage`** (bukan `localStorage`)
  dengan key `ivendor.register.draft.v1`; remote membacanya dari
  `sessionStorage` lebih dulu, lalu `localStorage` sebagai cadangan.
- Bila draft ada → konversi draft menjadi
  `ProfileRecord`; semua section berstatus `pending`.
- Bila tidak ada → `profile.seed.ts` (status campuran `verified`/`pending`/
  `rejected` agar semua tampilan status bisa diuji).
- Baca selalu deep-merge dengan default agar field baru tidak membuat crash.
- `FileRef.previewUrl` tidak dipersist; setelah reload tampil nama & ukuran
  dengan placeholder "buka ulang file".

### 6.3 State

`ProfileStore` (`providedIn: 'root'`) di remote:

- `profile = signal<ProfileRecord>`
- `isDirty()`
- `save(section, values)`
- `discard(section)`
- `requestVerification(section)`
- `resetDemo()`

Aturan: menyimpan section berstatus `verified`/`rejected` mengubah statusnya
menjadi `pending` dan memperbarui `updatedAt`.

---

## 7. UI

- Setiap halaman punya mode **view** (read-only + badge status) dan **edit**
  (form). Draft form disimpan lokal di komponen sampai user menekan Simpan.
- Validasi menyalin aturan registrasi: email valid, alamat ≤ 250 karakter,
  SWIFT 8/11 alfanumerik, file JPG/PNG/PDF ≤ 5 MB.
- Overview menampilkan jumlah section per status dan daftar section yang belum
  lengkap.
- Semua komponen memakai salinan `shared/ui`; tidak ada component library baru.
- Responsif diuji minimal pada 390×844 dan desktop; dark mode mengikuti host.
- Aksesibilitas: label/`aria-label` jelas, `ui-tooltip` untuk help text,
  fokus terlihat, navigasi keyboard berfungsi.

### 7.1 Komponen yang disalin

`button`, `badge`, `icon`, `spinner`, `dialog`, `alert-dialog`, `toast`,
`select`, `autocomplete`, `attachment`, `tabs`, `tooltip`, `switch`,
`page-header`.

### 7.2 Styling

- `src/styles.css` remote disalin **utuh** dari host (token light/dark,
  `--primary`, `--radius`, dan seluruh class `@layer components`). Menyalin
  sebagian berisiko menghilangkan class yang dipakai komponen hasil salinan,
  dan biaya tambahannya kecil setelah gzip. Class untuk komponen yang tidak
  dipakai dipangkas hanya bila reviewer meminta.
- Header file mencatat versi sumber: `/* tokens synced from host v2.0.0 */`.
- Ikon digenerate oleh `scripts/sync-icons.mjs` salinan; hanya ikon terpakai.
- **Font tidak disalin.** `@fontsource-variable/jetbrains-mono` tetap hanya di
  host; remote mewarisi `font-family` dari `<body>` host karena dirender di
  dalam shell. Remote meng-import `tailwindcss` sendiri untuk utilitas, tetapi
  tidak mendefinisikan ulang `--font-sans`.
- Widget remote tidak boleh memakai selector global (`body`, `:root` selain
  salinan token) agar tidak menimpa host.

---

## 8. i18n

- `src/app/profile-management/i18n/profile.texts.ts` dengan `id`, `en`, `ja`.
- Semua teks user-facing berasal dari kamus: judul, label, tombol, placeholder,
  pesan validasi, aria-label, tooltip, toast, dialog, empty state, label status.
- Bahasa mengikuti `context.lang()` dari host; default `id`.
- Test paritas key antar bahasa.

---

## 9. Update banner & versioning

### 9.1 Banner

- Satu banner di host (`AppUpdateBanner` tidak berubah tampilan).
- `AppUpdateService` mem-`fetch` `version.json` host **dan** `version.json`
  setiap remote yang tercantum di `federation.manifest.json`.
- Baseline per aplikasi pada pengecekan pertama.
- Banner muncul bila **salah satu** `buildId` berubah; dismiss menyimpan
  kombinasi build id yang sudah di-dismiss.
- Reload tetap manual (`?v=<buildId>` + hash route dipertahankan).
- Kegagalan fetch satu sumber tidak menampilkan error dan tidak memblokir
  sumber lain.
- Remote yang terdaftar di manifest tetapi `version.json`-nya tidak dapat
  dibaca dianggap "tidak diketahui"; banner tetap mengandalkan sumber lain.

### 9.2 Environment

| Env         | Host baseHref       | Remote URL di manifest                                         |
| ----------- | ------------------- | -------------------------------------------------------------- |
| development | `/ivendor/`         | `http://localhost:4201/remoteEntry.json`                       |
| staging     | `/ivendor-staging/` | `/ivendor-staging/remotes/profile-management/remoteEntry.json` |
| production  | `/`                 | `/remotes/profile-management/remoteEntry.json`                 |

- Manifest **digenerate** oleh `scripts/write-federation-manifest.mjs` sebelum
  build/serve (pola sama dengan `write-version.mjs`), karena `fileReplacements`
  tidak berlaku untuk aset di `public/`.
  - development → `http://localhost:4201/remoteEntry.json`
  - staging & production → `remotes/profile-management/remoteEntry.json`
    (relatif terhadap baseHref host, sehingga staging otomatis menjadi
    `/ivendor-staging/remotes/...` dan production `/remotes/...`).
- `public/federation.manifest.json` gitignored, seperti `version.json`.
- Remote punya `write-version.mjs` sendiri → `remotes/profile-management/version.json`.

### 9.3 Cache header

- `index.html` & `federation.manifest.json`: no-store.
- `remoteEntry.json`: no-cache.
- Chunk ber-hash: immutable.
- `deploy/nginx.conf.example` dan `public/.htaccess` di **kedua** repo
  diperbarui, plus `deploy/README.md`.

---

## 10. Error handling

- Remote belum termuat: skeleton di area konten, shell tetap tampil.
- Gagal memuat remote (network/CORS/versi tidak cocok): kartu error di area
  konten dengan tombol **Coba lagi** + toast; teks dari i18n host `id/en/ja`.
- Tidak ada reload paksa; sidebar dan home tetap berfungsi.
- Remote gagal dimuat tidak boleh membuat `AppShell` crash.
- Remote tidak tercantum di manifest → route menampilkan error card yang sama
  (bukan `console.error` diam-diam).
- Bila `context.user()` bernilai `null` (mis. sesi dibersihkan), remote tetap
  menampilkan data dan form; tidak melakukan redirect. Identitas user hanya
  dipakai untuk sapaan di overview.

### 10.1 Development lokal

- Remote: `ng serve --port 4201` (CORS dev-server diizinkan hanya pada
  konfigurasi development).
- Host: `npm start` (`:1933`), manifest dev menunjuk `localhost:4201`.
- Dokumentasi langkah ada di README kedua repo.

---

## 11. Testing

**Repo remote**

- `ProfileStore`: save/dirty/discard, re-verification, reset.
- Konversi draft registrasi → `ProfileRecord` (lengkap, parsial, tidak valid).
- `assetUrl` dan `injectProfileContext` (ada token / fallback).
- Validasi form per section + edge case (file besar/format salah, field kosong).
- Page component: mode view/edit, badge status, bahasa id/en/ja.
- Coverage threshold 80% (statements/branches/functions/lines).

**Repo host**

- Route lazy memuat `./Routes`; provider kontrak mengirim reader signal.
- `AppUpdateService`: host berubah, remote berubah, keduanya, salah satu gagal.
- Error state remote gagal dimuat + retry.
- Nav, home card, teks i18n baru (paritas id/en/ja).
- E2E: home → remote termuat → edit bank → simpan → badge berubah;
  skenario remote gagal → error card, shell tetap hidup.

E2E host membutuhkan remote tersedia di `:4201`. Pipeline E2E menjalankan
`ng serve` remote sebagai proses latar (atau menyajikan hasil build remote
secara statis) sebelum Playwright mulai; langkah ini didokumentasikan di
`e2e/README` dan `package.json` host.

**Definition of Done kedua repo:** `npm run format:check`, build, seluruh unit
test, coverage ≥ 80%, dan E2E untuk host. Tidak boleh ada test yang di-skip
atau coverage yang diturunkan.

---

## 12. Risiko & mitigasi

| Risiko                                      | Mitigasi                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Drift komponen/token antara host dan remote | Daftar komponen minimum, header versi token, catatan sinkronisasi di AGENTS.md remote |
| Versi Angular tidak sinkron                 | Kunci versi di kedua `package.json`; cek versi saat build/review                      |
| Aset remote 404 karena `document.baseURI`   | Semua aset lewat `assetUrl()` yang memakai `context.assetBase`; fallback import       |
| Remote deploy rusak membuat fitur mati      | Error card + retry; shell tidak ikut mati                                             |
| Cache `remoteEntry.json` membuat versi lama | Header no-cache + `version.json` remote dipantau banner                               |
| CORS di dev                                 | Diizinkan hanya di konfigurasi development                                            |

---

## 13. Kriteria penerimaan

1. `ivendor-superapps-host` berjalan sebagai host Native Federation dan tetap
   berfungsi seperti sekarang untuk login, registrasi, home, dan 404.
2. Repo remote berdiri sendiri, bisa di-build dan di-serve di `:4201`.
3. Dari home dan sidebar, `/profile-management` terbuka di dalam shell host.
4. Enam halaman remote berfungsi: view, edit, simpan, discard, dan status
   verifikasi berubah menjadi `pending` setelah section terverifikasi diedit.
5. Data bertahan setelah reload; seed berasal dari draft registrasi bila ada.
6. Bahasa (id/en/ja) dan tema mengikuti host secara langsung tanpa reload.
7. Banner update muncul saat versi host atau remote berubah.
8. Build dev/staging/production memakai manifest dan baseHref yang benar.
9. Semua gate Definition of Done lulus di kedua repo.

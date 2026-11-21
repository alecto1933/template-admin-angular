# iVendor Superapps

Template admin modern bergaya **shadcn**, tetapi seluruh komponennya ditulis
sendiri di dalam repo — tidak ada library UI pihak ketiga yang di-install.
Dibangun dengan **Angular 22** (standalone + signals + zoneless) dan
**Tailwind CSS 4**.

![Angular](https://img.shields.io/badge/Angular-22.2-DD0031?logo=angular&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-6366f1)

## Isi template

- **Layout admin**: sidebar (collapsible + drawer mobile), topbar dan footer
  yang tetap terlihat saat konten di-scroll, pencarian ⌘K, notifikasi, user
  menu, serta tema terang/gelap.
- **Dashboard**: kartu statistik + sparkline, area chart & donut chart SVG tanpa
  dependency, tabel pesanan terbaru, dan timeline aktivitas.
- **Pesanan**: pencarian, filter status, sorting, pagination, multi-select,
  aksi baris, dialog tambah pesanan, dan tampilan kartu khusus mobile.
- **Form**: reactive form dengan validasi, state error, switch, textarea,
  upload avatar, serta dialog konfirmasi hapus akun.
- **Komponen**: 60 komponen UI dengan halaman dokumentasi di submenu
  Komponen — dasar, form controls, overlay, date/calendar, carousel, code
  block, command, combobox, dan lainnya.
- **Sidebar bernested**: grup Komponen memiliki submenu berisi seluruh halaman
  komponen (60); daftar dapat di-scroll.
- **Pengaturan**: tab Umum / Notifikasi / Keamanan / Tagihan.
- **Auth**: halaman login dua kolom dengan validasi dan akun demo.
- **404** dan layout responsif dari 360px sampai desktop lebar.

## Mulai

Butuh Node.js 22.22+ atau 24.15+ (sesuai requirement Angular 22).

```bash
npm install
npm start          # http://localhost:4200/ivendor/
npm run build      # build produksi ke dist/
npm test           # unit + integration test (Vitest)
npm run test:coverage
npm run e2e        # E2E (Playwright, Chromium)
```

Akun demo login: `raka@alecto.id` / `alecto123` (atau email & password apa pun
yang valid — autentikasi hanya simulasi).

## Environment

Konfigurasi ada di `src/environments/` dan dipilih saat build lewat
`fileReplacements` di `angular.json`:

| Environment | Perintah                                    | Output                             |
| ----------- | ------------------------------------------- | ---------------------------------- |
| development | `npm run build:dev`                         | `dist/template-admin-development/` |
| staging     | `npm run build:staging`                     | `dist/template-admin-staging/`     |
| production  | `npm run build:prod` (atau `npm run build`) | `dist/template-admin/`             |

- `npm start` / `ng serve` memakai `development` secara default dan berjalan di
  `http://localhost:4200/ivendor/`.
- `npm start -- --configuration staging` untuk menjalankan build staging.
- Field environment: `name`, `production`, `apiUrl`, `supportEmail`,
  `appVersion` (dipakai footer).
- `src/environments/environment.ts` adalah fallback untuk unit test; build
  menggantinya dengan file environment yang dipilih.

**Base path** diatur per environment di `angular.json` (`baseHref`):

| Environment | Base href           |
| ----------- | ------------------- |
| development | `/ivendor/`         |
| staging     | `/ivendor-staging/` |
| production  | `/`                 |

Untuk mengganti path (mis. staging ke `/vendor/`), ubah `baseHref` lalu
sesuaikan folder deploy & konfigurasi web server. Panduan lengkap ada di
[`deploy/README.md`](deploy/README.md).

## Micro frontend `profile-management`

Host memuat modul profil vendor dari repo terpisah
`ivendor-superapps-profile-management` lewat Native Federation
(`initFederation('federation.manifest.json')` di `src/main.ts`). Route host
`/profile-management` memasang `PROFILE_MANAGEMENT_ROUTES` milik remote dan
menampilkan halaman error bila remote gagal dimuat.

Manifest dibuat otomatis oleh `scripts/write-federation-manifest.mjs` saat
`start`/`build` dan **tidak di-commit**:

| Environment | Manifest berisi                               |
| ----------- | --------------------------------------------- |
| development | `http://localhost:4201/remoteEntry.json`      |
| staging     | `remotes/profile-management/remoteEntry.json` |
| production  | `remotes/profile-management/remoteEntry.json` |

Path staging/production relatif terhadap base href host, sehingga remote
disajikan same-origin di `<base host>/remotes/profile-management/`. Urutan
rilis: deploy remote lebih dulu, lalu host hanya bila manifest berubah.
Detail ada di [`deploy/README.md`](deploy/README.md).

## Update & cache

Agar user tidak tertinggal di versi lama:

- Saat `start`/`build`, `scripts/write-version.mjs` membuat
  `public/version.json` berisi `version`, `buildId` unik (git hash + timestamp),
  dan `builtAt`.
- `AppUpdateService` mengecek file itu saat aplikasi mulai, setiap 2 menit,
  dan saat tab kembali aktif (`focus`/`visibilitychange`).
- `AppUpdateService` juga membaca `federation.manifest.json` dan menambahkan
  `version.json` di samping setiap `remoteEntry.json`, sehingga versi remote
  ikut terpantau.
- Jika `buildId` berbeda, muncul banner **“Versi baru tersedia”** dengan tombol
  **Muat ulang** / **Nanti saja**.
- Tombol muat ulang menambahkan `?v=<buildId>` pada URL agar `index.html`
  tidak diambil dari cache, lalu hash route tetap dipertahankan.

**Wajib diatur di server/hosting:**

| Path                                    | Header                                               |
| --------------------------------------- | ---------------------------------------------------- |
| `index.html`                            | `Cache-Control: no-cache`                            |
| `version.json`                          | `Cache-Control: no-store`                            |
| `federation.manifest.json`              | `Cache-Control: no-store`                            |
| `remoteEntry.json`                      | `Cache-Control: no-cache`                            |
| aset ber-hash (`*.js`, `*.css`, gambar) | `Cache-Control: public, max-age=31536000, immutable` |

`public/version.json` dan `public/federation.manifest.json` di-generate saat
build dan tidak di-commit. Aturan header untuk artefak remote (di bawah
`remotes/profile-management/`) didokumentasikan di repo remote dan
[`deploy/README.md`](deploy/README.md).

## Testing

| Level              | Tool                                | Lokasi             | Perintah                |
| ------------------ | ----------------------------------- | ------------------ | ----------------------- |
| Unit + integration | Vitest (`@angular/build:unit-test`) | `src/**/*.spec.ts` | `npm test`              |
| Coverage           | Vitest v8                           | `coverage/`        | `npm run test:coverage` |
| E2E                | Playwright                          | `e2e/*.spec.ts`    | `npm run e2e`           |

- E2E memakai **Google Chrome terpasang** (`channel: 'chrome'`), jadi
  `--headed`/`--ui` tidak butuh Chromium bundled. Bila tidak ada Chrome,
  ganti ke `channel: 'msedge'`.
- `npm run e2e:headed` / `npm run e2e:ui` untuk mode debug.
- Konfigurasi E2E: `playwright.config.ts` (baseURL `http://localhost:4205`,
  `webServer` otomatis menjalankan `ng serve`).
- Setup global test (polyfill `<dialog>` untuk jsdom): `src/test-setup.ts`.
- Coverage saat ini: **95.4% statements, 91.9% branches, 92.1% functions,
  96.4% lines**.
- Template (`src/app/**/*.html`), `app.routes.ts`, dan `test-setup.ts`
  dikecualikan dari coverage karena hanya berisi markup/lazy-loader.
- `npm run test:coverage` **gagal otomatis** jika salah satu metrik turun di
  bawah **80%** (`coverageThresholds` di `angular.json`).
- Pola penamaan: `*.spec.ts` di samping file yang diuji; E2E per alur
  (`auth`, `language`, `home`, `register`, `responsive`, `not-found`).

## Struktur

```
src/app/
├── core/                 # layanan & data lintas fitur
│   ├── format.ts         # format Rupiah, tanggal, angka
│   ├── mock-data.ts      # data contoh (pesanan, statistik, trafik, aktivitas)
│   ├── nav.ts            # definisi menu sidebar + notifikasi
│   └── theme/            # ThemeService (light/dark + localStorage)
├── layout/               # shell aplikasi
│   ├── app-shell.ts      # sidebar + topbar + main + footer
│   ├── sidebar.ts
│   ├── topbar.ts
│   └── footer.ts
├── pages/
│   ├── auth/login.page.*
│   ├── components/
│   ├── dashboard/
│   ├── forms/
│   ├── not-found/
│   ├── orders/
│   └── settings/
└── shared/ui/            # komponen UI milik sendiri
    ├── accordion/        # accordion + accordion item
    ├── alert-dialog/     # dialog konfirmasi (role alertdialog)
    ├── aspect-ratio/     # wadah media dengan rasio tetap
    ├── attachment/       # baris lampiran file + grup
    ├── autocomplete/     # combobox + filter, grup, async, CVA
    ├── badge/            # span[uiBadge]
    ├── breadcrumb/       # breadcrumb berbasis atribut (nav/ol/li)
    ├── calendar/         # calendar single/multiple/range
    ├── carousel/         # carousel scroll-snap
    ├── code-block/       # penampil kode + highlight/diff
    ├── collapsible/      # panel tunggal animasi
    ├── command/          # command palette
    ├── date-picker/      # date picker popover + form
    ├── drawer/           # drawer empat arah
    ├── hover-card/       # kartu hover/focus
    ├── input-otp/        # input kode OTP
    ├── multi-combobox/   # combobox multiple + chips
    ├── button/           # button[uiButton]
    ├── charts/           # area-chart, donut-chart, sparkline
    ├── dialog/           # dialog native <dialog>
    ├── icon/             # 82 ikon Lucide yang di-generate ke repo
    ├── page-header/
    ├── switch/
    ├── tabs/
    └── toast/            # ToastService + <ui-toaster>
```

## Cara memakai komponen

Styling komponen hidup di `src/styles.css` dalam `@layer components`, sehingga
utility Tailwind di template selalu bisa menimpanya.

```html
<!-- Button -->
<button uiButton>Simpan</button>
<button uiButton variant="outline" size="sm">Batal</button>
<button uiButton [loading]="saving()">Kirim</button>
<button uiButton size="icon" aria-label="Tambah">
  <ui-icon name="plus" class="size-4" />
</button>

<!-- Badge -->
<span uiBadge variant="success">Lunas</span>

<!-- Card -->
<div uiCard>
  <div uiCardHeader>
    <h2 uiCardTitle>Judul</h2>
    <p uiCardDescription>Deskripsi singkat.</p>
  </div>
  <div uiCardContent>...</div>
  <div uiCardFooter class="justify-end">...</div>
</div>

<!-- Form -->
<label uiLabel for="nama">Nama</label>
<input uiInput id="nama" type="text" aria-invalid="true" />
<select uiSelect>
  ...
</select>
<textarea uiTextarea></textarea>
<input uiCheckbox type="checkbox" />
<ui-switch [(checked)]="aktif" label="Aktif" />

<!-- Accordion -->
<ui-accordion type="multiple">
  <ui-accordion-item title="Judul panel" [open]="true"> Konten panel. </ui-accordion-item>
  <ui-accordion-item title="Panel lain">Konten lain.</ui-accordion-item>
</ui-accordion>

<!-- Toast -->
this.toast.success('Tersimpan', 'Perubahan berhasil disimpan.');

<!-- Dialog -->
<ui-dialog #dialog title="Judul" description="Deskripsi">
  <div dialogFooter>
    <button uiButton variant="outline" (click)="dialog.close()">Batal</button>
    <button uiButton (click)="dialog.close()">Simpan</button>
  </div>
</ui-dialog>
```

Pola markup tabel memakai atribut: `uiTable` di `<table>`, dengan pembungkus
`.ui-scroll-x` agar tabel lebar tetap bisa digeser di layar kecil.

## Tema

Semua warna, radius, dan font adalah CSS variable di `src/styles.css`.

- Mode gelap memakai class `.dark` di `<html>` dan disimpan di `localStorage`
  (`alecto-theme`) lewat `PreferencesService`/`ThemeService`.
- Default saat pertama kali dibuka adalah **terang** (tidak mengikuti
  `prefers-color-scheme` OS). Setelah user mengganti tema, pilihan diingat.
- Ganti warna utama lewat `--primary` / `--primary-foreground` pada `:root`
  dan `.dark`.
- Ganti sudut lewat `--radius` (0.5rem saat ini; kartu, tombol, dan dialog
  memakai skala turunan yang otomatis ikut berubah).
- Token warna otomatis menjadi utility Tailwind (`bg-card`, `text-muted-foreground`,
  `border-border`, `bg-sidebar`, `text-chart-2`, dan seterusnya).

## Menambah halaman

1. Buat komponen di `src/app/pages/<nama>/`.
2. Tambahkan route lazy-load di `src/app/app.routes.ts` beserta `data.page`
   (dipakai judul topbar).
3. Tambahkan item menu di `src/app/core/nav.ts`.

## Ikon

Ikon disalin dari `lucide-static` ke `src/app/shared/ui/icon/icons.ts`, jadi
tidak ada dependency ikon saat runtime. Untuk menambah ikon:

```bash
# tambahkan nama ikon ke array ICONS di scripts/sync-icons.mjs
npm run icons:sync
```

Pakai sebagai `<ui-icon name="nama-ikon" class="size-4" />`.

## Catatan teknis

- **Hash routing**: `provideRouter(..., withHashLocation())` dipakai agar build
  bisa di-host statis tanpa konfigurasi rewrite server. URL berbentuk
  `/#/home`, `/#/login`, dst.
- **Zoneless & signals**: semua state memakai `signal`, `computed`, `input`,
  `model`, dan `output`.
- **Aksesibilitas**: skip link, fokus terlihat, aria pada dialog/menu/tab,
  navigasi keyboard pada tab dan CDK Menu, serta `prefers-reduced-motion`.
- **Dialog** memakai elemen native `<dialog>` — fokus, ESC, dan inert background
  ditangani browser.
- **Menu dropdown** memakai `@angular/cdk/menu`.
- **Chart** adalah SVG buatan sendiri; tidak ada Chart.js/D3.
- **Font** di-self-host lewat `@fontsource-variable` (JetBrains Mono), jadi
  build tidak butuh akses internet.

## Lisensi

MIT — silakan pakai, ubah, dan jual kembali sebagai bagian dari produk Anda.

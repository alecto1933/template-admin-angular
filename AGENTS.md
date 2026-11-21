# AGENTS.md — Aturan Wajib untuk Agent AI

> **Status: BINDING.** Semua aturan di file ini wajib diikuti saat menambah,
> mengubah, atau menghapus kode di project ini. Tidak boleh dilewati, diringkas,
> atau “disesuaikan sendiri”.
>
> Jika sebuah aturan tidak bisa dipenuhi, **berhenti dan tanyakan** ke human
> partner. Jangan diam-diam melewati aturan, menurunkan standar, atau menghapus
> test agar pekerjaan terlihat selesai.

---

## 0. Sumber kebenaran

- **Kode sumber adalah sumber kebenaran**, bukan README. README berisi bagian
  lama (dashboard/orders/forms/settings, daftar komponen lama) yang **sudah
  tidak ada**.
- Sebelum mengubah apa pun, baca file terkait, spec terdekat, kamus i18n, dan
  komponen `shared/ui` yang akan dipakai.
- Jangan mengarang route, halaman, service, komponen, atau konfigurasi yang
  tidak ada. Cek `src/app/app.routes.ts`, `src/app/core/nav.ts`, dan struktur
  folder terlebih dahulu.

---

## 1. Snapshot project (verifikasi ulang bila berubah)

- **Stack:** Angular 22 standalone, zoneless, signals; Tailwind CSS 4;
  TypeScript 6; Vitest; Playwright.
- **Tidak ada component library.** UI ditulis sendiri di
  `src/app/shared/ui/` (31 folder). Angular CDK hanya untuk menu
  (`@angular/cdk/menu`).
- **Route aktual:** `login`, `public/registration`, `home`, dan wildcard `**`
  (di dalam `AppShell`). Routing memakai **hash location**:
  `/#/login`, `/#/home`, `/#/public/registration`.
- **Halaman:** `src/app/pages/{auth,home,not-found}/`.
- **Layout:** `src/app/layout/{app-shell,sidebar,topbar,footer,update-banner}.ts`.
- **State global:** `src/app/core/state/{preferences,session}.service.ts`;
  `ThemeService` dan `LanguageService` adalah facade tipis.
- **i18n:** `src/app/core/i18n/*.texts.ts` (`home`, `login`, `register`,
  `layout`, `not-found`) dengan bahasa `id | en | ja`. Default `id`.
- **Environment:** `src/environments/`; build memilih lewat `fileReplacements`
  - `baseHref` di `angular.json`.
- **Versi:** package `2.0.0` (iVendor revamp). `appVersion` ada di tiap
  environment; footer menampilkannya.
- **Update deploy:** `scripts/write-version.mjs` membuat
  `public/version.json` (gitignored, berisi `version` + `buildId` unik);
  `AppUpdateService` + `AppUpdateBanner` menampilkan banner update.
- **Baseline test:** 56 spec file, ~322 unit/integration test, 19 E2E test.
  Coverage saat ini ≥95% statements / ≥91% branches / ≥91% functions.
  Angka ini adalah baseline, bukan alasan untuk menurunkan standar.

---

## 2. Aturan non-negotiable

### 2.1 Sebelum menulis kode

WAJIB:

1. Baca `AGENTS.md` ini.
2. Baca file yang akan diubah + spec-nya (jika ada).
3. Baca komponen `shared/ui` dan token style yang relevan; **jangan membuat
   komponen/varian baru jika yang ada bisa dipakai**.
4. Identifikasi semua teks yang terlihat user (termasuk `aria-label`,
   `placeholder`, tooltip, toast, dialog, empty state, error state).
5. Tentukan test yang akan ditambah/diubah (unit/integration dan E2E).
6. Jika mengubah konfigurasi/deploy/versi, baca `deploy/README.md` dan bagian
   terkait di `README.md`.

Jika langkah ini dilewati, pekerjaan dianggap belum selesai.

### 2.2 Bahasa & terjemahan (WAJIB)

- **Semua teks yang dilihat user harus berasal dari kamus i18n**, bukan string
  literal di template/TS. Ini termasuk: judul, label, tombol, placeholder,
  pesan validasi, aria-label, tooltip, toast, dialog, dan status kosong.
- Setiap key baru **wajib ditambahkan ke `id`, `en`, dan `ja`** dengan makna
  yang setara. Jangan biarkan bahasa lain fallback ke Indonesia/Inggris kecuali
  human partner memintanya secara eksplisit.
- Tempatkan teks di file yang sesuai:
  - layout global/topbar/sidebar/banner → `layout.texts.ts`
  - home → `home.texts.ts`
  - login → `login.texts.ts`
  - registrasi → `register.texts.ts`
  - 404 → `not-found.texts.ts`
  - fitur baru → buat `*.texts.ts` baru di `src/app/core/i18n/` **dan**
    daftarkan di `src/app/core/i18n/texts.spec.ts`.
- Akses teks lewat `TranslationService` (`layout`, `lang`) atau import kamus
  area masing-masing; jangan menyimpan kamus duplikat di komponen.
- State bahasa WAJIB memakai `LanguageService`/`PreferencesService` (persist
  `ivendor-language`); jangan membuat `signal` bahasa lokal baru.
- Route `title` di `app.routes.ts` masih statis (brand). Jika judul tab perlu
  diterjemahkan, ikuti pola yang ada dan jangan menambah string hardcoded baru
  di komponen.

### 2.3 UI, styling, dan komponen (WAJIB)

- **Reuse dulu:** pakai komponen yang ada (`uiButton`, `uiBadge`, `uiCard`,
  `uiDialog`, `uiAlertDialog`, `uiTooltip`, `uiSwitch`, `uiTabs`, dll).
- Jika butuh komponen baru:
  - taruh di `src/app/shared/ui/<nama>/<nama>.ts`;
  - selector berprefix `ui-`;
  - `ChangeDetectionStrategy.OnPush`;
  - input/output berbasis signal (`input`, `model`, `output`);
  - sediakan JSDoc contoh pemakaian;
  - tambahkan `*.spec.ts`.
- **Jangan menambah component library / UI kit baru.**
- Styling:
  - gunakan utility Tailwind + token semantik (`bg-card`, `text-muted-foreground`,
    `border-border`, `bg-primary`, `text-destructive`, dst.);
  - **jangan hardcode warna hex/oklch** di template;
  - style komponen bersama ditulis di `src/styles.css` dalam `@layer components`;
    jangan menambah `styles:` di komponen kecuali benar-benar perlu;
  - hormati dark mode (`.dark`) dan token `--primary`, `--radius`, dll.
- Aksesibilitas WAJIB:
  - elemen interaktif punya `aria-label`/teks yang jelas;
  - ikon dekoratif `aria-hidden="true"` atau dibungkus teks;
  - tooltip memakai `ui-tooltip` + wrapper `.group` (bukan atribut `title`);
  - fokus terlihat (`focus-visible`), keyboard bisa dipakai.
- Responsif WAJIB diuji minimal pada mobile (`390×844`) dan desktop.
- Jangan memakai emoji sebagai ikon; gunakan `ui-icon`.
- Jangan mengedit `src/app/shared/ui/icon/icons.ts` manual — file generated.
  Tambah nama Lucide ke `ICONS` di `scripts/sync-icons.mjs`, lalu
  `npm run icons:sync`.
- **Kepemilikan stylesheet remote (WAJIB):** host adalah pemilik stylesheet
  untuk halaman remote `profile-management`. Remote hanya boleh memakai kelas
  yang ada di sumber host atau di safelist `@source inline(...)` pada
  `src/styles.css`. Menambah kelas baru di remote wajib disertai penambahan
  kelas tersebut ke safelist host; jangan bergantung pada file dokumentasi atau
  auto-scan yang kebetulan memuat nama kelas.

### 2.4 State, data, dan penyimpanan (WAJIB)

- Gunakan `signal`, `computed`, `input`, `model`, `output`, `effect` seperlunya.
- **Jangan menambah NgRx/Akita/Elf** atau library state lain.
- State lintas halaman → service `providedIn: 'root'` di `src/app/core/state/`.
- State lokal satu komponen (dialog, hover, form draft) tetap di komponen.
- Persistensi WAJIB lewat `src/app/core/storage.ts`:
  - key prefix `ivendor-` lewat `appKey()`;
  - satu-satunya pengecualian: key tema legacy `alecto-theme`, yang juga
    dibaca inline script `src/index.html` dan E2E `seedPreferences`. Jaga
    ketiganya tetap sinkron.
- Jangan menyimpan token/rahasia di `localStorage` pada demo ini.
- Jangan hardcode `apiUrl`, `supportEmail`, versi, atau base path di komponen.
  Gunakan `@env/environment`.

### 2.5 Routing & navigasi (WAJIB)

- Routing memakai hash; URL berbentuk `/ivendor/#/...` (dev) atau sesuai
  `baseHref` environment.
- Halaman baru:
  1. buat di `src/app/pages/<nama>/`;
  2. tambah lazy route di `src/app/app.routes.ts`;
  3. isi `data.page` (dipakai topbar) dan tambahkan terjemahannya di
     `layout.texts.ts` serta mapping judul di `topbar.ts` bila perlu;
  4. jika tampil di sidebar, tambah ke `src/app/core/nav.ts` dengan
     `labelKey` bertipe `LayoutTextKey`.
- **Jangan mengubah** `baseHref`, `withHashLocation`, nama route `login` /
  `public/registration`, atau key storage tanpa memperbarui dokumentasi,
  `.htaccess`, Nginx, E2E, dan test terkait.
- Route lazy harus memakai path alias `@/...`.

### 2.6 Testing (WAJIB — tidak boleh di-skip)

- **Setiap perubahan perilaku wajib punya test.**
  - Service/utility/komponen: `*.spec.ts` di samping file.
  - Halaman/flow: integration test (`TestBed`) dan E2E bila menyentuh alur
    user.
- Test WAJIB menguji perilaku nyata (bukan hanya “component created”).
  Sertakan edge case: error, empty, disabled, bahasa, dark mode bila relevan.
- Jangan menghapus, men-skip (`.skip`/`only`), atau melemahkan test yang ada
  hanya agar suite lulus.
- Jangan menurunkan `coverageThresholds`, menambah `coverageExclude`, atau
  menghapus file dari coverage tanpa persetujuan human partner.
- Vitest:
  - globals aktif; **jangan import** `describe/it/expect/vi`.
  - `--include` relatif ke `src/`, contoh:
    `npx ng test --watch=false --include=app/core/storage.spec.ts`.
  - gunakan `TestBed` untuk komponen; `src/test-setup.ts` menyediakan polyfill
    `<dialog>` jsdom — jangan dihapus.
  - test harus deterministik: bersihkan `localStorage`/DOM, hindari urutan
    antar-file, gunakan fake timers bila perlu.
- E2E (Playwright):
  - file di `e2e/`, memakai Chrome terpasang (`channel: 'chrome'`) dan URL hash
    `/ivendor/#/...`;
  - gunakan selector aksesibel (`getByRole`, `getByLabel`);
  - jangan menambah `data-testid` ke source bila selector aksesibel bisa
    dipakai;
  - jangan melemahkan assertion untuk menghindari flaky; perbaiki akar masalah.
- Setiap kamus i18n baru wajib masuk `texts.spec.ts` (paritas key id/en/ja).

### 2.7 Build, versi, dan deploy (WAJIB)

- Build/deploy HANYA lewat script npm (`start`, `build`, `build:dev`,
  `build:staging`, `build:prod`) agar `public/version.json` di-generate.
- **Jangan hardcode/commit** `public/version.json`; file itu gitignored.
- Jangan mengubah `buildId` manual. Build ID dibuat oleh
  `scripts/write-version.mjs`.
- Banner update tidak boleh auto-reload paksa; reload hanya atas persetujuan
  user (tombol).
- Base href per environment: dev `/ivendor/`, staging `/ivendor-staging/`,
  production `/`. Jika berubah, update `angular.json`, `deploy/README.md`,
  `deploy/nginx.conf.example`, `public/.htaccess`, dan E2E.
- Cache header server wajib didokumentasikan/dipertahankan:
  `index.html` no-cache, `version.json` no-store, aset ber-hash immutable.
- Semua aset di template memakai path **relatif** (`images/...`), bukan absolut
  (`/images/...`), agar base href subfolder bekerja.

### 2.8 Format & kualitas (WAJIB)

- Format memakai Prettier (`printWidth: 100`, single quote). Jalankan
  `npm run format:check` (atau `npm run format`).
- Tidak ada script lint/typecheck terpisah; **`ng build` adalah typecheck**.
  Build wajib lulus tanpa error.
- Gunakan path alias `@/...` dan `@env/...`; jangan membuat rantai import
  relatif panjang (`../../../`).
- Hindari `any`, `@ts-ignore`, dan menonaktifkan pengecekan tanpa alasan kuat.
- Jangan meninggalkan `console.log`, kode mati, atau komentar TODO.
- Jangan commit ke git kecuali human partner meminta secara eksplisit.

---

## 3. Checklist wajib untuk fitur/perubahan baru

Ikuti urutan ini dan jangan lompat:

1. **Pahami konteks**: baca kode terkait, spec, i18n, shared UI, `AGENTS.md`.
2. **Rancang perubahan**: data/state, route, komponen, teks, test.
3. **i18n**: tambah key ke `id`, `en`, `ja` di file kamus yang tepat;
   daftarkan kamus baru di `texts.spec.ts`.
4. **Implementasi UI**: pakai shared UI + token; responsive; aksesibel;
   dark mode; path aset relatif.
5. **State**: signal/service/storage sesuai aturan; jangan duplikasi state.
6. **Test**:
   - unit/integration untuk logika dan komponen;
   - E2E untuk alur user baru/berubah;
   - update test lama yang memang berubah perilakunya.
7. **Verifikasi** (lihat Definition of Done).
8. **Dokumentasi**: update `README.md`/`deploy/README.md` bila perilaku,
   konfigurasi, base path, environment, atau deployment berubah.

### Contoh: menambah fitur “Laporan”

Minimal harus ada:

- route `/#/reports` (lazy, `data.page`, judul diterjemahkan, masuk `nav.ts`
  bila ditampilkan);
- `reports.texts.ts` untuk id/en/ja + paritas di `texts.spec.ts`;
- komponen memakai `uiButton`, `uiBadge`, `uiCard`, token warna yang ada;
- service state bila data dipakai lintas komponen;
- `reports.page.spec.ts` + test service (jika ada);
- `e2e/reports.spec.ts` untuk alur utama;
- aset relatif, responsive, a11y, dark mode.

---

## 4. Definition of Done (wajib dijalankan)

```bash
npm run format:check
npm run build:dev
npx ng test --watch=false
npm run test:coverage
npm run e2e
```

Semua harus lulus:

- build tanpa error/type error;
- seluruh unit/integration test lulus;
- coverage memenuhi threshold 80% (jangan diturunkan);
- seluruh E2E lulus;
- tidak ada warning baru yang mengotori output test (mis. NG0955/NG0912).

Pekerjaan **tidak boleh** dilaporkan selesai jika salah satu gagal. Untuk
perubahan dokumentasi saja, gate fungsional boleh dilewati, tetapi harus
dinyatakan alasannya.

---

## 5. Dilarang (hard NO)

- Hardcode teks user-facing di template/TS.
- Menambah teks hanya untuk satu bahasa.
- Memakai `title` native untuk tooltip UI (gunakan `ui-tooltip`).
- Hardcode warna/radius/font di luar token.
- Menambah library UI/state baru.
- Mengedit file generated: `shared/ui/icon/icons.ts`, `public/version.json`.
- Mengubah key `alecto-theme` / prefix `ivendor-` tanpa sinkronisasi.
- Mengubah base href/route/hash tanpa update server config + E2E + docs.
- Menurunkan coverage, menghapus/men-skip test, atau melemahkan assertion.
- Auto-reload paksa saat update tersedia.
- Path aset absolut (`/images/...`) pada build subfolder.
- Commit tanpa diminta.
- Melewati aturan di file ini tanpa persetujuan.

---

## 6. Referensi file penting

| Area           | File                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| Routes         | `src/app/app.routes.ts`                                                                 |
| Navigasi       | `src/app/core/nav.ts`                                                                   |
| i18n           | `src/app/core/i18n/*.texts.ts`, `translation.service.ts`                                |
| State          | `src/app/core/state/*`, `core/storage.ts`, `core/theme/theme.service.ts`                |
| Layout         | `src/app/layout/*`                                                                      |
| Shared UI      | `src/app/shared/ui/<nama>/<nama>.ts` + `*.spec.ts`                                      |
| Styling/token  | `src/styles.css`, `.prettierrc`                                                         |
| Update/version | `src/app/core/update/*`, `src/app/layout/update-banner.ts`, `scripts/write-version.mjs` |
| Environment    | `src/environments/*`, `angular.json`                                                    |
| Test setup     | `src/test-setup.ts`, `playwright.config.ts`, `e2e/support.ts`                           |
| Deploy/cache   | `deploy/README.md`, `deploy/nginx.conf.example`, `public/.htaccess`                     |
| Docs           | `docs/superpowers/specs/`, `docs/superpowers/plans/`                                    |

# Micro Frontend Host + Remote `profile-management` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan `ivendor-superapps-host` sebagai host Native Federation dan membangun remote terpisah `ivendor-superapps-profile-management` yang mengelola profil vendor (paritas registrasi) di dalam shell host.

**Architecture:** Dua repo Angular 22 standalone. Host memakai `@angular-architects/native-federation@22.2.5` dengan `--type dynamic-host`; remote memakai `--type remote` dan mengekspos `./Routes`. Konteks (bahasa, tema, user, assetBase) dikirim host lewat route `providers` dengan token string.

**Tech Stack:** Angular 22 (zoneless, signals), `@angular/build:application`, Tailwind CSS 4, Vitest, Playwright, Native Federation 22.2.5.

## Global Constraints

- Versi Angular di kedua repo: `22.2.x`. Jangan menaikkan/menurunkan salah satu saja.
- Semua teks user-facing berasal dari kamus `id`/`en`/`ja`; tidak ada string literal di template.
- Tidak menambah component library atau state library baru.
- Prefix storage `ivendor-`; key baru memakai `appKey()`.
- Path aset remote selalu lewat `assetUrl()`; jangan memakai path absolut di template.
- `@angular/build` adalah typecheck; build wajib lulus.
- Coverage threshold 80% (statements/branches/functions/lines); tidak boleh diturunkan.
- **Jangan commit** tanpa persetujuan human partner (aturan `AGENTS.md` host). Setiap task berakhir dengan verifikasi, bukan commit.
- Spec: `docs/superpowers/specs/2026-11-21-micro-frontend-profile-management-design.md`.
- Vitest globals aktif: jangan import `describe/it/expect/vi`. Import hanya fungsi/kelas yang diuji.
- Saat memanggil `inject()` di luar constructor/field initializer (mis. di dalam test), bungkus dengan `TestBed.runInInjectionContext(() => inject(...))`.
- `stage()` menerima `Record<string, unknown>`; selalu kirim objek literal (`{ ...form.getRawValue() }`) agar lolos typecheck.
- Tipe section di `profile.model.ts` memakai `type` alias (bukan `interface`) supaya kompatibel dengan index signature.

## Peta file

**Repo remote (`../ivendor-superapps-profile-management/`)**

| File                                                  | Tanggung jawab                              |
| ----------------------------------------------------- | ------------------------------------------- |
| `federation.config.mjs`                               | expose `./Routes`, shared Angular singleton |
| `scripts/write-version.mjs`                           | generate `public/version.json`              |
| `src/app/core/federation.contract.ts`                 | tipe + token kontrak (salinan)              |
| `src/app/core/federation/profile-context.ts`          | `injectProfileContext()`                    |
| `src/app/core/storage.ts`                             | salinan helper storage                      |
| `src/app/core/asset-url.ts`                           | `assetUrl()`                                |
| `src/app/profile-management/model/profile.model.ts`   | `ProfileRecord`, `SectionId`, default       |
| `src/app/profile-management/data/banks.ts`            | daftar bank & negara (salinan registrasi)   |
| `src/app/profile-management/data/profile.seed.ts`     | seed demo                                   |
| `src/app/profile-management/data/draft-to-profile.ts` | konversi draft registrasi                   |
| `src/app/profile-management/state/profile.store.ts`   | signal store + persist                      |
| `src/app/profile-management/i18n/profile.texts.ts`    | kamus id/en/ja                              |
| `src/app/profile-management/pages/**`                 | overview + 5 section                        |
| `src/app/profile-management/routes.ts`                | `PROFILE_MANAGEMENT_ROUTES`                 |

**Repo host**

| File                                                               | Perubahan                         |
| ------------------------------------------------------------------ | --------------------------------- |
| `angular.json`, `main.ts`, `bootstrap.ts`, `federation.config.mjs` | hasil schematic Native Federation |
| `scripts/write-federation-manifest.mjs`                            | manifest per environment          |
| `src/environments/*`                                               | `remoteAssetBase`                 |
| `src/app/core/federation/federation.contract.ts`                   | salinan kontrak                   |
| `src/app/core/federation/profile-context.provider.ts`              | provider kontrak                  |
| `src/app/core/federation/remote-loader.ts`                         | `loadProfileManagementRoutes()`   |
| `src/app/core/federation/federated-route.ts`                       | route `profile-management`        |
| `src/app/pages/remote-error/remote-error.page.ts`                  | error card + retry                |
| `src/app/core/update/app-update.service.ts`                        | multi `version.json`              |
| `src/app/layout/topbar.ts`                                         | mapping `profileManagement`       |
| `src/app/core/nav.ts`, `src/app/layout/sidebar.ts`                 | nav item + `labelKey`             |
| `src/app/pages/home/home.page.ts/.html`                            | kartu pertama navigasi            |
| `src/app/core/i18n/layout.texts.ts`                                | teks baru                         |
| `e2e/profile-management.spec.ts`                                   | smoke test MFE                    |

---

# FASE A — Repo remote

### Task 1: Scaffold repo remote + Native Federation

**Files:**

- Create: `../ivendor-superapps-profile-management/` (seluruh repo)
- Modify: `federation.config.mjs`, `angular.json`, `package.json`
- Create: `scripts/write-version.mjs`
- Create: `src/app/profile-management/routes.ts` (placeholder, diisi Task 6)

**Interfaces:**

- Produces: remote federation bernama `profile-management`, exposed module `./Routes`, dev server `:4201`.

- [ ] **Step 1: Buat aplikasi Angular**

```bash
cd "D:/MUHAMAD REZA - MSP002/PROJECT/SUPERAPPS/IVENDOR-SUPERAPPS/V2"
npx @angular/cli@22 new profile-management \
  --directory ivendor-superapps-profile-management \
  --style=css --routing=false --ssr=false --package-manager=npm --defaults
```

- [ ] **Step 2: Install adapter dan inisialisasi remote**

```bash
cd "D:/MUHAMAD REZA - MSP002/PROJECT/SUPERAPPS/IVENDOR-SUPERAPPS/V2/ivendor-superapps-profile-management"
npm i -D @angular-architects/native-federation@22.2.5
npx ng g @angular-architects/native-federation:init \
  --project profile-management --port 4201 --type remote
```

Expected: `federation.config.mjs`, `tsconfig.federation.json`, `src/bootstrap.ts` dibuat; `angular.json` mendapat target `esbuild`, `build`, `serve`, `serve-original`; `src/main.ts` menjadi stub `initFederation`.

- [ ] **Step 3: Definisikan expose `./Routes`**

Ganti isi `exposes` di `federation.config.mjs`:

```js
exposes: {
  './Routes': './src/app/profile-management/routes.ts',
},
```

Buat `src/app/profile-management/routes.ts` sementara:

```ts
import { Routes } from '@angular/router';

export const PROFILE_MANAGEMENT_ROUTES: Routes = [];
```

- [ ] **Step 4: Set baseHref remote per konfigurasi**

Di `angular.json`, target `esbuild` (bukan `build`):

```json
"development": { "baseHref": "/" },
"staging": { "baseHref": "/ivendor-staging/remotes/profile-management/" },
"production": { "baseHref": "/remotes/profile-management/" }
```

Pertahankan `outputPath` yang sudah ada.

- [ ] **Step 5: Izinkan CORS untuk dev server**

Di `angular.json` → `architect["serve-original"].options`, tambahkan:

```json
"headers": { "Access-Control-Allow-Origin": "*" }
```

Hanya pada konfigurasi dev (bukan production).

- [ ] **Step 6: Tambahkan `write-version.mjs` dan script npm**

Salin `../ivendor-superapps-host/scripts/write-version.mjs` ke `scripts/write-version.mjs` (tanpa perubahan). Ubah `package.json`:

```json
"scripts": {
  "start": "node scripts/write-version.mjs && ng serve",
  "build": "node scripts/write-version.mjs && ng build",
  "build:dev": "node scripts/write-version.mjs && ng build --configuration development",
  "build:staging": "node scripts/write-version.mjs && ng build --configuration staging",
  "build:prod": "node scripts/write-version.mjs && ng build --configuration production",
  "test": "ng test",
  "test:coverage": "ng test --watch=false --coverage",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

Tambahkan `public/version.json` ke `.gitignore`.

- [ ] **Step 7: Verifikasi build dan remoteEntry**

```bash
npm run build:dev
ls dist/profile-management/browser/remoteEntry.json
ls dist/profile-management/browser/version.json
```

Expected: kedua file ada.

- [ ] **Step 8: Verifikasi dev server**

```bash
npx ng serve --port 4201
```

Buka `http://localhost:4201/remoteEntry.json` → JSON valid.

### Task 2: Salin token style dan komponen `shared/ui`

**Files:**

- Create: `src/styles.css` (ganti hasil `ng new`)
- Create: `src/app/shared/ui/**`
- Create: `scripts/sync-icons.mjs`
- Modify: `package.json`, `angular.json` (styles/asset sudah menunjuk `src/styles.css`)

**Interfaces:**

- Produces: komponen `button[uiButton]`, `[uiBadge]`, `ui-icon`, `ui-spinner`, `ui-dialog`, `ui-alert-dialog`, `ui-toast`, `ui-select`, `ui-autocomplete`, `ui-attachment`, `ui-tabs`, `ui-tooltip`, `ui-switch`, `ui-page-header` tersedia di remote.

- [ ] **Step 1: Salin styles dan aset UI**

```bash
cd "D:/MUHAMAD REZA - MSP002/PROJECT/SUPERAPPS/IVENDOR-SUPERAPPS/V2/ivendor-superapps-profile-management"
cp ../ivendor-superapps-host/src/styles.css src/styles.css
cp -r ../ivendor-superapps-host/src/app/shared src/app/shared
cp ../ivendor-superapps-host/scripts/sync-icons.mjs scripts/sync-icons.mjs
```

Tambahkan komentar di baris pertama `src/styles.css`:

```css
/* tokens synced from host v2.0.0 — jangan edit manual tanpa update host */
```

- [ ] **Step 2: Pangkas komponen yang tidak dipakai**

Hapus folder di `src/app/shared/ui/` yang tidak ada pada daftar Interfaces Task 2. Setelah dihapus, jalankan build; bila ada import yang hilang, pulihkan folder tersebut dari host.

- [ ] **Step 3: Sinkronkan ikon**

**Jangan memangkas** array `ICONS` pada salinan `scripts/sync-icons.mjs`. Komponen hasil salinan memakai banyak ikon internal (chevron, check, search, paperclip, dll.); memangkas daftar akan membuat build gagal. Jalankan apa adanya:

```bash
npm i -D lucide-static@^1.71.0
npm run icons:sync
```

Pemangkasan ikon (bila diinginkan) hanya boleh dilakukan setelah `npm run build:prod` lulus dan daftar `ICONS` diverifikasi terhadap seluruh template.

- [ ] **Step 4: Tambahkan dependency ikon & font**

```bash
npm i -D lucide-static@^1.71.0
npm i @fontsource-variable/jetbrains-mono@^5.3.0
```

(`@fontsource` tidak di-import di remote; dependency dicatat agar versi selaras bila nanti dibutuhkan.)

- [ ] **Step 5: Verifikasi**

```bash
npm run build:dev
npx ng test --watch=false
```

Expected: build lulus, test bawaan lulus.

### Task 3: Kontrak, storage, asset URL, dan context helper

**Files:**

- Create: `src/app/core/federation.contract.ts`
- Create: `src/app/core/federation/profile-context.ts`
- Create: `src/app/core/storage.ts`
- Create: `src/app/core/asset-url.ts`
- Test: `src/app/core/federation/profile-context.spec.ts`, `src/app/core/asset-url.spec.ts`

**Interfaces:**

- Produces:
  - `PROFILE_CONTEXT = 'IVENDOR_PROFILE_CONTEXT'`
  - `interface ProfileContext { lang: () => Lang; theme: () => ThemeMode; user: () => SessionUser \| null; assetBase: string }`
  - `injectProfileContext(): ProfileContext`
  - `assetUrl(context: ProfileContext, path: string): string`
  - `appKey`, `readJson`, `writeJson`, `readString`, `writeString`, `remove`

- [ ] **Step 1: Tulis test yang gagal**

`src/app/core/asset-url.spec.ts`:

```ts
const context = (assetBase: string) => ({
  lang: () => 'id' as const,
  theme: () => 'light' as const,
  user: () => null,
  assetBase,
});

describe('assetUrl', () => {
  it('joins base and path', () => {
    expect(assetUrl(context('/remotes/profile-management/'), 'images/logo.webp')).toBe(
      '/remotes/profile-management/images/logo.webp',
    );
  });

  it('handles empty base and leading slash', () => {
    expect(assetUrl(context(''), '/images/logo.webp')).toBe('images/logo.webp');
  });
});
```

`src/app/core/federation/profile-context.spec.ts`:

```ts
describe('injectProfileContext', () => {
  it('returns provided context', () => {
    const provided = {
      lang: () => 'ja' as const,
      theme: () => 'dark' as const,
      user: () => null,
      assetBase: '/x/',
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PROFILE_CONTEXT, useValue: provided }],
    });
    expect(injectProfileContext()).toBe(provided);
  });

  it('falls back to defaults when host context is missing', () => {
    TestBed.configureTestingModule({});
    const context = injectProfileContext();
    expect(context.lang()).toBe('id');
    expect(context.user()).toBeNull();
    expect(context.assetBase).toBe('');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

```bash
npx ng test --watch=false --include=app/core/asset-url.spec.ts
```

Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi**

`src/app/core/federation.contract.ts` — salin **verbatim** isi yang sama ke host di Task 12:

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

`src/app/core/federation/profile-context.ts`:

```ts
import { inject } from '@angular/core';
import { PROFILE_CONTEXT, ProfileContext } from '@/core/federation.contract';

const prefersDark = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

export const DEFAULT_PROFILE_CONTEXT: ProfileContext = {
  lang: () => 'id',
  theme: () => (prefersDark() ? 'dark' : 'light'),
  user: () => null,
  assetBase: '',
};

export function injectProfileContext(): ProfileContext {
  return (
    (inject(PROFILE_CONTEXT, { optional: true }) as ProfileContext | null) ??
    DEFAULT_PROFILE_CONTEXT
  );
}
```

`src/app/core/asset-url.ts`:

```ts
import { ProfileContext } from '@/core/federation.contract';

export function assetUrl(context: ProfileContext, path: string): string {
  const base = context.assetBase.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  return base ? `${base}/${clean}` : clean;
}
```

`src/app/core/storage.ts`: salin utuh dari `../ivendor-superapps-host/src/app/core/storage.ts`.

- [ ] **Step 4: Jalankan test**

```bash
npx ng test --watch=false --include=app/core/asset-url.spec.ts
npx ng test --watch=false --include=app/core/federation/profile-context.spec.ts
```

Expected: PASS.

### Task 4: Model, seed, konversi draft, dan `ProfileStore`

**Files:**

- Create: `src/app/profile-management/model/profile.model.ts`
- Create: `src/app/profile-management/data/banks.ts`
- Create: `src/app/profile-management/data/profile.seed.ts`
- Create: `src/app/profile-management/data/draft-to-profile.ts`
- Create: `src/app/profile-management/state/profile.store.ts`
- Test: `src/app/profile-management/state/profile.store.spec.ts`
- Test: `src/app/profile-management/data/draft-to-profile.spec.ts`

**Interfaces:**

- Produces:
  - `SectionId = 'vendor' | 'pic' | 'bank' | 'tax' | 'domicile'`
  - `VerifyStatus = 'draft' | 'pending' | 'verified' | 'rejected'`
  - `ProfileRecord`
  - `EMPTY_PROFILE: ProfileRecord`
  - `draftToProfile(draft: RegistrationDraft, now: string): ProfileRecord`
  - `loadInitialProfile(): ProfileRecord`
  - `ProfileStore`: `profile: Signal<ProfileRecord>`, `stage(section, values)`, `save()`, `discard()`, `requestVerification(section)`, `resetDemo()`, `isDirty: Signal<boolean>`

- [ ] **Step 1: Tulis test store yang gagal**

```ts
describe('ProfileStore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts from the seeded record', () => {
    const store = TestBed.inject(ProfileStore);
    expect(store.profile().vendor.name).toBeTruthy();
  });

  it('saves staged values and marks a verified section pending again', () => {
    const store = TestBed.inject(ProfileStore);
    const before = store.profile().verifications.vendor.status;
    store.stage('vendor', { ...store.profile().vendor, name: 'PT Baru' });
    store.save();

    expect(store.profile().vendor.name).toBe('PT Baru');
    expect(store.profile().verifications.vendor.status).toBe(
      before === 'draft' ? 'draft' : 'pending',
    );
    expect(store.isDirty()).toBe(false);
  });

  it('persists to localStorage', () => {
    const store = TestBed.inject(ProfileStore);
    store.stage('pic', { ...store.profile().pic, name: 'Siti' });
    store.save();
    expect(localStorage.getItem('ivendor-profile.management.v1')).toContain('Siti');
  });

  it('discards a staged change', () => {
    const store = TestBed.inject(ProfileStore);
    const original = store.profile().vendor.name;
    store.stage('vendor', { ...store.profile().vendor, name: 'Berubah' });
    expect(store.isDirty()).toBe(true);
    store.discard();
    expect(store.isDirty()).toBe(false);
    expect(store.profile().vendor.name).toBe(original);
  });
});
```

- [ ] **Step 2: Tulis test konversi draft yang gagal**

```ts
describe('draftToProfile', () => {
  const now = '2026-11-21T00:00:00.000Z';

  it('maps registration values into the profile record', () => {
    const record = draftToProfile(
      {
        version: 1,
        entityType: 'national',
        phoneCountryIso: 'id',
        useVendorName: true,
        hasSkb: false,
        bankRequest: null,
        values: {
          name: 'PT Contoh',
          type: 'CORPORATE',
          category: 'Farmasi',
          vendorCountry: 'id',
          address: 'Jl. Contoh 1',
          email: 'vendor@contoh.id',
          picName: 'Raka',
          picEmail: 'raka@contoh.id',
          phone: '8123',
          bankName: 'mandiri-id-jkt',
          bankAccountName: 'PT Contoh',
          bankAccountNumber: '123',
          currency: 'IDR - Rupiah Indonesia',
          recipientType: 'CORPORATE',
          taxName: 'PT Contoh',
          taxAddress: 'Jl. Pajak 1',
        },
      },
      now,
    );

    expect(record.vendor.name).toBe('PT Contoh');
    expect(record.pic.email).toBe('raka@contoh.id');
    expect(record.bank.bankId).toBe('mandiri-id-jkt');
    expect(record.tax.ktp.name).toBe('PT Contoh');
    expect(record.verifications.vendor.status).toBe('pending');
  });

  it('falls back to the seed when values are missing', () => {
    const record = draftToProfile(
      {
        version: 1,
        entityType: 'national',
        phoneCountryIso: 'id',
        useVendorName: false,
        hasSkb: false,
        bankRequest: null,
        values: {},
      },
      now,
    );
    expect(record.vendor.name).toBe('');
    expect(record.verifications.bank.status).toBe('pending');
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

```bash
npx ng test --watch=false --include=app/profile-management/state/profile.store.spec.ts
```

Expected: FAIL — `ProfileStore` belum ada.

- [ ] **Step 4: Implementasi model**

`model/profile.model.ts` berisi tipe `SectionId`, `VerifyStatus`, `FileRef`, `TaxDoc`, `BankRequest`, `VendorSection`, `PicSection`, `BankSection`, `TaxSection`, `DomicileSection`, `ProfileRecord`, dan:

```ts
export type BankRequest = {
  name: string;
  country: string;
  region: string;
  address: string;
  branch: string;
  city: string;
  swift: string;
};
```

`PROFILE_STORAGE_KEY` memakai `appKey` dari `@/core/storage`.

```ts
export const EMPTY_PROFILE: ProfileRecord = {
  version: 1,
  updatedAt: '',
  vendor: { name: '', type: 'CORPORATE', category: '', countryIso: 'id', address: '', email: '' },
  pic: { name: '', email: '', phone: '', phoneCountryIso: 'id' },
  bank: {
    bankId: null,
    bankName: '',
    country: 'ID',
    branch: '',
    accountName: '',
    accountNumber: '',
    currency: 'IDR - Rupiah Indonesia',
    recipientType: 'CORPORATE',
    statement: null,
    request: null,
  },
  tax: {
    entityType: 'national',
    ktp: { name: '', address: '', file: null },
    npwp: { name: '', address: '', file: null },
    sppkp: null,
    skb: null,
  },
  domicile: { file: null },
  verifications: {
    vendor: { status: 'draft', updatedAt: '' },
    pic: { status: 'draft', updatedAt: '' },
    bank: { status: 'draft', updatedAt: '' },
    tax: { status: 'draft', updatedAt: '' },
    domicile: { status: 'draft', updatedAt: '' },
  },
};

export const PROFILE_STORAGE_KEY = appKey('profile.management.v1');
```

- [ ] **Step 5: Implementasi seed, banks, dan konversi**

`data/banks.ts`: salin `COUNTRIES`, `CATEGORIES`, `BANKS`, `CURRENCIES`, `RECIPIENT_TYPES` dari `../ivendor-superapps-host/src/app/pages/auth/register.page.ts` (baris 61–155) apa adanya, ubah `const` menjadi `export const`.

`data/profile.seed.ts` mengekspor `PROFILE_SEED: ProfileRecord` dengan data demo non-kosong: nama `PT Alecto Nusantara`, PIC `Raka Pratama`, bank BCA `bca-id-jkt` dengan `accountName: 'PT Alecto Nusantara'` dan `accountNumber: '1234567890'`, status `vendor: verified`, `pic: verified`, `bank: pending`, `tax: rejected` (note: "NPWP tidak terbaca"), `domicile: draft`. Nilai ini dipakai oleh test halaman, jadi jangan diubah tanpa memperbarui test.

`data/draft-to-profile.ts`:

```ts
import { EMPTY_PROFILE, ProfileRecord } from '@/profile-management/model/profile.model';

export interface RegistrationDraft {
  version: 1;
  entityType: 'national' | 'international' | 'government';
  values: Record<string, unknown>;
  phoneCountryIso: string;
  useVendorName: boolean;
  hasSkb: boolean;
  bankRequest: BankRequest | null;
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

export function draftToProfile(draft: RegistrationDraft, now: string): ProfileRecord {
  const values = draft.values;
  return {
    ...EMPTY_PROFILE,
    updatedAt: now,
    vendor: {
      ...EMPTY_PROFILE.vendor,
      name: text(values['name']),
      type: (text(values['type']) || 'CORPORATE') as ProfileRecord['vendor']['type'],
      category: text(values['category']),
      countryIso: text(values['vendorCountry']) || 'id',
      address: text(values['address']),
      email: text(values['email']),
    },
    pic: {
      ...EMPTY_PROFILE.pic,
      name: text(values['picName']),
      email: text(values['picEmail']),
      phone: text(values['phone']),
      phoneCountryIso: draft.phoneCountryIso || 'id',
    },
    bank: {
      ...EMPTY_PROFILE.bank,
      bankId: text(values['bankName']) || null,
      accountName: text(values['bankAccountName']),
      accountNumber: text(values['bankAccountNumber']),
      currency: text(values['currency']) || EMPTY_PROFILE.bank.currency,
      recipientType: text(values['recipientType']) || 'CORPORATE',
      request: draft.bankRequest,
    },
    tax: {
      entityType: draft.entityType,
      ktp: { name: text(values['taxName']), address: text(values['taxAddress']), file: null },
      npwp: { name: text(values['taxName']), address: text(values['taxAddress']), file: null },
      sppkp: text(values['sppkp'])
        ? { name: text(values['sppkp']), address: '', file: null }
        : null,
      skb: draft.hasSkb ? { name: text(values['skbAttachment']), address: '', file: null } : null,
    },
    verifications: {
      vendor: { status: 'pending', updatedAt: now },
      pic: { status: 'pending', updatedAt: now },
      bank: { status: 'pending', updatedAt: now },
      tax: { status: 'pending', updatedAt: now },
      domicile: { status: 'pending', updatedAt: now },
    },
  };
}
```

`loadInitialProfile()` ditempatkan di `state/profile.store.ts`:

```ts
function readDraft(): RegistrationDraft | null {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const raw = storage.getItem('ivendor.register.draft.v1');
      if (raw) {
        const draft = JSON.parse(raw) as RegistrationDraft;
        if (draft?.version === 1) return draft;
      }
    } catch {
      // ignore malformed drafts
    }
  }
  return null;
}

export function loadInitialProfile(): ProfileRecord {
  const saved = readJson<ProfileRecord>(PROFILE_STORAGE_KEY);
  if (saved?.version === 1) {
    return {
      ...EMPTY_PROFILE,
      ...saved,
      vendor: { ...EMPTY_PROFILE.vendor, ...saved.vendor },
      pic: { ...EMPTY_PROFILE.pic, ...saved.pic },
      bank: { ...EMPTY_PROFILE.bank, ...saved.bank },
      tax: { ...EMPTY_PROFILE.tax, ...saved.tax },
      domicile: { ...EMPTY_PROFILE.domicile, ...saved.domicile },
      verifications: { ...EMPTY_PROFILE.verifications, ...saved.verifications },
    };
  }
  const draft = readDraft();
  return draft ? draftToProfile(draft, new Date().toISOString()) : PROFILE_SEED;
}
```

- [ ] **Step 6: Implementasi store**

```ts
interface Staged {
  section: SectionId;
  values: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly _profile = signal<ProfileRecord>(loadInitialProfile());
  private readonly _staged = signal<Staged | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly isDirty = computed(() => this._staged() !== null);

  stage(section: SectionId, values: Record<string, unknown>): void {
    this._staged.set({ section, values });
  }

  discard(): void {
    this._staged.set(null);
  }

  save(): void {
    const staged = this._staged();
    if (!staged) return;

    const now = new Date().toISOString();
    this._profile.update((record) => {
      const next: ProfileRecord = {
        ...record,
        updatedAt: now,
        verifications: { ...record.verifications },
      };
      switch (staged.section) {
        case 'vendor':
          next.vendor = { ...record.vendor, ...staged.values } as ProfileRecord['vendor'];
          break;
        case 'pic':
          next.pic = { ...record.pic, ...staged.values } as ProfileRecord['pic'];
          break;
        case 'bank':
          next.bank = { ...record.bank, ...staged.values } as ProfileRecord['bank'];
          break;
        case 'tax':
          next.tax = { ...record.tax, ...staged.values } as ProfileRecord['tax'];
          break;
        case 'domicile':
          next.domicile = { ...record.domicile, ...staged.values } as ProfileRecord['domicile'];
          break;
      }
      const current = record.verifications[staged.section];
      next.verifications[staged.section] = {
        status: current.status === 'draft' ? 'draft' : 'pending',
        updatedAt: now,
      };
      return next;
    });

    writeJson(PROFILE_STORAGE_KEY, this._profile());
    this._staged.set(null);
  }

  requestVerification(section: SectionId): void {
    this._profile.update((record) => ({
      ...record,
      verifications: {
        ...record.verifications,
        [section]: { status: 'pending', updatedAt: new Date().toISOString() },
      },
    }));
    writeJson(PROFILE_STORAGE_KEY, this._profile());
  }

  resetDemo(): void {
    writeJson(PROFILE_STORAGE_KEY, PROFILE_SEED);
    this._profile.set(PROFILE_SEED);
    this._staged.set(null);
  }
}
```

- [ ] **Step 7: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/state/profile.store.spec.ts
npx ng test --watch=false --include=app/profile-management/data/draft-to-profile.spec.ts
```

Expected: PASS.

### Task 5: Kamus i18n remote

**Files:**

- Create: `src/app/profile-management/i18n/profile.texts.ts`
- Test: `src/app/profile-management/i18n/profile.texts.spec.ts`

**Interfaces:**

- Produces: `PROFILE_TEXTS: Record<Lang, ProfileTexts>`, tipe `ProfileTextKey`.

- [ ] **Step 1: Tulis test paritas yang gagal**

```ts
describe('PROFILE_TEXTS', () => {
  it('has identical keys for id, en, ja', () => {
    const idKeys = Object.keys(PROFILE_TEXTS.id).sort();
    expect(Object.keys(PROFILE_TEXTS.en).sort()).toEqual(idKeys);
    expect(Object.keys(PROFILE_TEXTS.ja).sort()).toEqual(idKeys);
  });

  it('has no empty values', () => {
    for (const lang of ['id', 'en', 'ja'] as const) {
      for (const [key, value] of Object.entries(PROFILE_TEXTS[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/profile-management/i18n/profile.texts.spec.ts
```

- [ ] **Step 3: Implementasi kamus**

Key minimum (semua wajib ada di ketiga bahasa):

```ts
export const PROFILE_TEXTS = {
  id: {
    pageTitle: 'Profil Vendor',
    pageSubtitle: 'Kelola data profil, rekening, dan dokumen vendor.',
    overview: 'Ringkasan',
    navVendor: 'Profil Vendor',
    navPic: 'Informasi PIC',
    navBank: 'Rekening Bank',
    navTax: 'Identifikasi Pajak',
    navDomicile: 'Surat Domisili',
    edit: 'Ubah',
    save: 'Simpan',
    cancel: 'Batal',
    saving: 'Menyimpan…',
    requestVerify: 'Ajukan Verifikasi',
    statusDraft: 'Draf',
    statusPending: 'Menunggu verifikasi',
    statusVerified: 'Terverifikasi',
    statusRejected: 'Ditolak',
    updatedAt: 'Diperbarui',
    lastNote: 'Catatan',
    notFilled: 'Belum diisi',
    vendorName: 'Nama vendor',
    vendorType: 'Tipe',
    category: 'Kategori',
    country: 'Negara',
    address: 'Alamat',
    email: 'Email',
    picName: 'Nama PIC',
    picEmail: 'Email PIC',
    phone: 'Nomor telepon',
    bankName: 'Nama bank',
    bankCountry: 'Negara bank',
    bankBranch: 'Cabang',
    accountName: 'Atas nama',
    accountNumber: 'Nomor rekening',
    currency: 'Mata uang',
    recipientType: 'Tipe penerima',
    statement: 'Halaman pertama rekening',
    uploadHint: 'Klik untuk mengunggah berkas',
    uploadFormat: 'JPG, PNG, atau PDF. Maksimal 5 MB.',
    removeFile: 'Hapus berkas',
    previewFile: 'Pratinjau',
    taxEntityType: 'Tipe entitas',
    taxKtp: 'KTP',
    taxNpwp: 'NPWP',
    taxSppkp: 'SPPKP',
    taxSkb: 'SKB',
    taxName: 'Nama',
    taxAddress: 'Alamat',
    domicileFile: 'Surat keterangan domisili',
    domicileTemplate: 'Unduh template',
    overviewComplete: 'Lengkap',
    overviewNeedAttention: 'Perlu perhatian',
    overviewSections: 'Section',
    emptyValue: '—',
    validationRequired: 'Wajib diisi.',
    validationEmail: 'Masukkan email yang valid.',
    validationMaxAddress: 'Maksimal 250 karakter.',
    validationFileType: 'Format berkas harus JPG, PNG, atau PDF.',
    validationFileSize: 'Ukuran berkas maksimal 5 MB.',
    savedTitle: 'Tersimpan',
    savedMessage: 'Perubahan berhasil disimpan.',
    verifyTitle: 'Verifikasi diajukan',
    verifyMessage: 'Perubahan akan diverifikasi oleh tim kami.',
    resetDemo: 'Muat ulang data demo',
    errorTitle: 'Data tidak bisa dimuat',
  },
  en: {
    pageTitle: 'Vendor Profile',
    pageSubtitle: 'Manage vendor profile, bank account, and documents.',
    overview: 'Overview',
    navVendor: 'Vendor Profile',
    navPic: 'PIC Information',
    navBank: 'Bank Account',
    navTax: 'Tax Identification',
    navDomicile: 'Domicile Letter',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving…',
    requestVerify: 'Request verification',
    statusDraft: 'Draft',
    statusPending: 'Pending verification',
    statusVerified: 'Verified',
    statusRejected: 'Rejected',
    updatedAt: 'Updated',
    lastNote: 'Note',
    notFilled: 'Not filled',
    vendorName: 'Vendor name',
    vendorType: 'Type',
    category: 'Category',
    country: 'Country',
    address: 'Address',
    email: 'Email',
    picName: 'PIC name',
    picEmail: 'PIC email',
    phone: 'Phone number',
    bankName: 'Bank name',
    bankCountry: 'Bank country',
    bankBranch: 'Branch',
    accountName: 'Account name',
    accountNumber: 'Account number',
    currency: 'Currency',
    recipientType: 'Recipient type',
    statement: 'First page of bank statement',
    uploadHint: 'Click to upload a file',
    uploadFormat: 'JPG, PNG, or PDF. Maximum 5 MB.',
    removeFile: 'Remove file',
    previewFile: 'Preview',
    taxEntityType: 'Entity type',
    taxKtp: 'ID card',
    taxNpwp: 'Tax ID',
    taxSppkp: 'VAT registration',
    taxSkb: 'Tax exemption',
    taxName: 'Name',
    taxAddress: 'Address',
    domicileFile: 'Domicile letter',
    domicileTemplate: 'Download template',
    overviewComplete: 'Complete',
    overviewNeedAttention: 'Needs attention',
    overviewSections: 'Section',
    emptyValue: '—',
    validationRequired: 'Required.',
    validationEmail: 'Enter a valid email.',
    validationMaxAddress: 'Maximum 250 characters.',
    validationFileType: 'File must be JPG, PNG, or PDF.',
    validationFileSize: 'Maximum file size is 5 MB.',
    savedTitle: 'Saved',
    savedMessage: 'Your changes have been saved.',
    verifyTitle: 'Verification requested',
    verifyMessage: 'Your changes will be reviewed by our team.',
    resetDemo: 'Reload demo data',
    errorTitle: 'Data could not be loaded',
  },
  ja: {
    pageTitle: 'ベンダープロフィール',
    pageSubtitle: 'ベンダー情報、銀行口座、書類を管理します。',
    overview: '概要',
    navVendor: 'ベンダープロフィール',
    navPic: '担当者情報',
    navBank: '銀行口座',
    navTax: '税務情報',
    navDomicile: '所在地証明書',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    saving: '保存中…',
    requestVerify: '確認を依頼',
    statusDraft: '下書き',
    statusPending: '確認待ち',
    statusVerified: '確認済み',
    statusRejected: '却下',
    updatedAt: '更新日',
    lastNote: 'メモ',
    notFilled: '未入力',
    vendorName: 'ベンダー名',
    vendorType: '種別',
    category: 'カテゴリ',
    country: '国',
    address: '住所',
    email: 'メール',
    picName: '担当者名',
    picEmail: '担当者メール',
    phone: '電話番号',
    bankName: '銀行名',
    bankCountry: '銀行の国',
    bankBranch: '支店',
    accountName: '口座名義',
    accountNumber: '口座番号',
    currency: '通貨',
    recipientType: '受取種別',
    statement: '通帳の最初のページ',
    uploadHint: 'クリックしてファイルをアップロード',
    uploadFormat: 'JPG、PNG、PDF。最大 5 MB。',
    removeFile: 'ファイルを削除',
    previewFile: 'プレビュー',
    taxEntityType: ' entity type',
    taxKtp: '身分証明書',
    taxNpwp: '納税者番号',
    taxSppkp: '課税事業者登録',
    taxSkb: '免税証明',
    taxName: '名称',
    taxAddress: '住所',
    domicileFile: '所在地証明書',
    domicileTemplate: 'テンプレートをダウンロード',
    overviewComplete: '完了',
    overviewNeedAttention: '要確認',
    overviewSections: 'セクション',
    emptyValue: '—',
    validationRequired: '必須です。',
    validationEmail: '有効なメールアドレスを入力してください。',
    validationMaxAddress: '最大 250 文字です。',
    validationFileType: 'ファイルは JPG、PNG、PDF のいずれかです。',
    validationFileSize: 'ファイルサイズは最大 5 MB です。',
    savedTitle: '保存しました',
    savedMessage: '変更を保存しました。',
    verifyTitle: '確認を依頼しました',
    verifyMessage: '変更は担当チームが確認します。',
    resetDemo: 'デモデータを再読み込み',
    errorTitle: 'データを読み込めません',
  },
} as const;

export type ProfileTexts = (typeof PROFILE_TEXTS)['id'];
export type ProfileTextKey = keyof ProfileTexts;
```

Perbaiki nilai `taxEntityType` Jepang menjadi `'エンティティ種別'` sebelum test dijalankan.

- [ ] **Step 4: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/i18n/profile.texts.spec.ts
```

### Task 6: Routes, halaman overview, dan badge status

**Files:**

- Create: `src/app/profile-management/routes.ts`
- Create: `src/app/profile-management/pages/overview/overview.page.ts` + `.html` + `.spec.ts`
- Create: `src/app/profile-management/pages/section-status.ts` (helper label warna)

**Interfaces:**

- Produces: `PROFILE_MANAGEMENT_ROUTES` dengan `''` (overview), `vendor`, `pic`, `bank`, `tax`, `domicile`, dan `**` → `''`. Setiap route memakai `data: { page: 'profileManagement' }`.

- [ ] **Step 1: Tulis test overview yang gagal**

```ts
describe('OverviewPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [OverviewPage],
      providers: [provideRouter([])],
    });
  });

  it('lists all five sections with their status', () => {
    const fixture = TestBed.createComponent(OverviewPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Profil Vendor');
    expect(text).toContain('Rekening Bank');
    expect(text).toContain('Terverifikasi');
  });

  it('links each section to its route', () => {
    const fixture = TestBed.createComponent(OverviewPage);
    fixture.detectChanges();
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a[routerLink]'),
    ).map((link) => link.getAttribute('routerLink'));
    expect(links).toEqual(['vendor', 'pic', 'bank', 'tax', 'domicile']);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/profile-management/pages/overview/overview.page.spec.ts
```

- [ ] **Step 3: Implementasi routes**

```ts
import { Routes } from '@angular/router';

const page = { page: 'profileManagement' };

export const PROFILE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: page,
    loadComponent: () => import('./pages/overview/overview.page').then((m) => m.OverviewPage),
  },
  {
    path: 'vendor',
    data: page,
    loadComponent: () => import('./pages/vendor/vendor.page').then((m) => m.VendorPage),
  },
  {
    path: 'pic',
    data: page,
    loadComponent: () => import('./pages/pic/pic.page').then((m) => m.PicPage),
  },
  {
    path: 'bank',
    data: page,
    loadComponent: () => import('./pages/bank/bank.page').then((m) => m.BankPage),
  },
  {
    path: 'tax',
    data: page,
    loadComponent: () => import('./pages/tax/tax.page').then((m) => m.TaxPage),
  },
  {
    path: 'domicile',
    data: page,
    loadComponent: () => import('./pages/domicile/domicile.page').then((m) => m.DomicilePage),
  },
  { path: '**', redirectTo: '' },
];
```

Buat file halaman lain sebagai stub sementara agar build lulus:

```ts
import { Component } from '@angular/core';

@Component({ selector: 'app-profile-vendor', template: '' })
export class VendorPage {}
```

(ulangi untuk `PicPage`, `BankPage`, `TaxPage`, `DomicilePage`; diganti pada task berikutnya).

- [ ] **Step 4: Implementasi helper status bersama**

`src/app/profile-management/pages/section-status.ts`:

```ts
import { ProfileTexts } from '@/profile-management/i18n/profile.texts';
import { VerifyStatus } from '@/profile-management/model/profile.model';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'outline';

export function statusTone(status: VerifyStatus): StatusBadgeVariant {
  return { draft: 'outline', pending: 'warning', verified: 'success', rejected: 'danger' }[status];
}

export function statusLabel(texts: ProfileTexts, status: VerifyStatus): string {
  return {
    draft: texts.statusDraft,
    pending: texts.statusPending,
    verified: texts.statusVerified,
    rejected: texts.statusRejected,
  }[status];
}
```

- [ ] **Step 5: Implementasi overview**

`overview.page.ts`:

```ts
@Component({
  selector: 'app-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiBadge],
  templateUrl: './overview.page.html',
})
export class OverviewPage {
  private readonly store = inject(ProfileStore);
  private readonly ctx = injectProfileContext();
  protected readonly t = computed(() => PROFILE_TEXTS[this.ctx.lang()]);
  protected readonly profile = this.store.profile;
  protected readonly sections: Array<{ id: SectionId; labelKey: ProfileTextKey; route: string }> = [
    { id: 'vendor', labelKey: 'navVendor', route: 'vendor' },
    { id: 'pic', labelKey: 'navPic', route: 'pic' },
    { id: 'bank', labelKey: 'navBank', route: 'bank' },
    { id: 'tax', labelKey: 'navTax', route: 'tax' },
    { id: 'domicile', labelKey: 'navDomicile', route: 'domicile' },
  ];

  protected readonly verifiedCount = computed(
    () =>
      this.sections.filter(
        (section) => this.profile().verifications[section.id].status === 'verified',
      ).length,
  );
  protected readonly needsAttentionCount = computed(
    () =>
      this.sections.filter(
        (section) => this.profile().verifications[section.id].status !== 'verified',
      ).length,
  );

  protected statusLabel(status: VerifyStatus): string {
    return statusLabel(this.t(), status);
  }

  protected statusTone(status: VerifyStatus): StatusBadgeVariant {
    return statusTone(status);
  }
}
```

Import yang dibutuhkan: `RouterLink`, `UiBadge`, `ProfileStore`, `injectProfileContext`, `PROFILE_TEXTS`, `ProfileTextKey`, `SectionId`, `VerifyStatus`, `statusLabel`, `statusTone`, `StatusBadgeVariant`.

`overview.page.html` (struktur wajib):

```html
<section class="space-y-6">
  <header>
    <h1 class="font-display text-2xl font-semibold tracking-tight">{{ t().pageTitle }}</h1>
    <p class="mt-1 text-sm text-muted-foreground">{{ t().pageSubtitle }}</p>
  </header>

  <dl class="grid gap-4 sm:grid-cols-2">
    <div class="rounded-2xl border border-border bg-card p-5">
      <dt class="text-xs text-muted-foreground">{{ t().overviewComplete }}</dt>
      <dd class="mt-1 font-display text-2xl font-semibold">
        {{ verifiedCount() }} / {{ sections.length }}
      </dd>
    </div>
    <div class="rounded-2xl border border-border bg-card p-5">
      <dt class="text-xs text-muted-foreground">{{ t().overviewNeedAttention }}</dt>
      <dd class="mt-1 font-display text-2xl font-semibold">{{ needsAttentionCount() }}</dd>
    </div>
  </dl>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    @for (section of sections; track section.id) {
    <a
      [routerLink]="section.route"
      class="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="font-display text-base font-semibold">{{ t()[section.labelKey] }}</span>
        <span uiBadge [variant]="statusTone(profile().verifications[section.id].status)">
          {{ statusLabel(profile().verifications[section.id].status) }}
        </span>
      </div>
      <p class="mt-2 text-xs text-muted-foreground">
        {{ t().updatedAt }}: {{ profile().verifications[section.id].updatedAt || t().emptyValue }}
      </p>
      @if (profile().verifications[section.id].note) {
      <p class="mt-2 text-xs text-destructive">
        {{ t().lastNote }}: {{ profile().verifications[section.id].note }}
      </p>
      }
    </a>
    }
  </div>
</section>
```

- [ ] **Step 6: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/pages/overview/overview.page.spec.ts
```

### Task 7: Halaman Vendor dan PIC

**Files:**

- Create: `src/app/profile-management/pages/vendor/vendor.page.ts` + `.html` + `.spec.ts`
- Create: `src/app/profile-management/pages/pic/pic.page.ts` + `.html` + `.spec.ts`

**Interfaces:**

- Consumes: `ProfileStore.stage/save/discard`, `injectProfileContext`, `PROFILE_TEXTS`.
- Produces: dua halaman yang memakai pola view ↔ edit dan menandai status `pending` setelah menyimpan.

- [ ] **Step 1: Tulis test vendor yang gagal**

```ts
describe('VendorPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [VendorPage] });
  });

  it('starts in view mode and shows the saved vendor name', () => {
    const fixture = TestBed.createComponent(VendorPage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('PT Alecto Nusantara');
  });

  it('saves edited values and marks the section pending', () => {
    const fixture = TestBed.createComponent(VendorPage);
    fixture.detectChanges();
    const page = fixture.componentInstance as unknown as { startEdit(): void };
    page.startEdit();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#vendor-name',
    );
    expect(input).not.toBeNull();
    input!.value = 'PT Baru';
    input!.dispatchEvent(new Event('input'));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[data-action="save"]')!
      .click();
    fixture.detectChanges();

    expect(TestBed.inject(ProfileStore).profile().vendor.name).toBe('PT Baru');
    expect(TestBed.inject(ProfileStore).profile().verifications.vendor.status).toBe('pending');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/profile-management/pages/vendor/vendor.page.spec.ts
```

- [ ] **Step 3: Implementasi vendor page**

`vendor.page.ts`:

```ts
@Component({
  selector: 'app-profile-vendor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiBadge, UiButton, UiSelect],
  templateUrl: './vendor.page.html',
})
export class VendorPage {
  protected readonly store = inject(ProfileStore);
  private readonly fb = inject(FormBuilder);
  private readonly ctx = injectProfileContext();
  protected readonly t = computed(() => PROFILE_TEXTS[this.ctx.lang()]);
  protected readonly editing = signal(false);
  protected readonly status = computed(() => this.store.profile().verifications.vendor.status);
  protected readonly statusText = computed(() => statusLabel(this.t(), this.status()));
  protected readonly statusTone = computed(() => statusTone(this.status()));

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    type: ['CORPORATE', [Validators.required]],
    category: ['', [Validators.required]],
    countryIso: ['id', [Validators.required]],
    address: ['', [Validators.required, Validators.maxLength(250)]],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly typeOptions: SelectOption[] = ['CORPORATE', 'INDIVIDUAL', 'GOVERNMENT'].map(
    (value) => ({ value, label: value }),
  );

  protected startEdit(): void {
    this.form.reset(this.store.profile().vendor);
    this.editing.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.stage('vendor', { ...this.form.getRawValue() });
    this.store.save();
    this.editing.set(false);
  }

  protected cancel(): void {
    this.store.discard();
    this.editing.set(false);
  }
}
```

Import tambahan: `SelectOption` dari `@/shared/ui/select/select`, `statusLabel`/`statusTone` dari `@/profile-management/pages/section-status`.

`vendor.page.html`:

```html
<section class="space-y-6">
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="font-display text-2xl font-semibold tracking-tight">{{ t().navVendor }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ t().pageSubtitle }}</p>
    </div>
    <span uiBadge [variant]="statusTone()">{{ statusText() }}</span>
  </header>

  @if (!editing()) {
  <dl class="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
    <div>
      <dt class="text-xs text-muted-foreground">{{ t().vendorName }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.name || t().emptyValue }}</dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">{{ t().vendorType }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.type }}</dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">{{ t().category }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.category || t().emptyValue }}</dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">{{ t().country }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.countryIso }}</dd>
    </div>
    <div class="sm:col-span-2">
      <dt class="text-xs text-muted-foreground">{{ t().address }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.address || t().emptyValue }}</dd>
    </div>
    <div class="sm:col-span-2">
      <dt class="text-xs text-muted-foreground">{{ t().email }}</dt>
      <dd class="text-sm font-medium">{{ store.profile().vendor.email || t().emptyValue }}</dd>
    </div>
  </dl>
  <button uiButton type="button" (click)="startEdit()">{{ t().edit }}</button>
  } @else {
  <form
    [formGroup]="form"
    class="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"
    (ngSubmit)="save()"
  >
    <label class="space-y-1.5"
      ><span class="text-xs font-medium">{{ t().vendorName }}</span>
      <input uiInput id="vendor-name" formControlName="name" class="ui-input"
    /></label>
    <label class="space-y-1.5"
      ><span class="text-xs font-medium">{{ t().vendorType }}</span>
      <ui-select formControlName="type" [options]="typeOptions"
    /></label>
    <label class="space-y-1.5"
      ><span class="text-xs font-medium">{{ t().category }}</span>
      <input uiInput id="vendor-category" formControlName="category" class="ui-input"
    /></label>
    <label class="space-y-1.5"
      ><span class="text-xs font-medium">{{ t().country }}</span>
      <input uiInput id="vendor-country" formControlName="countryIso" class="ui-input"
    /></label>
    <label class="space-y-1.5 sm:col-span-2"
      ><span class="text-xs font-medium">{{ t().address }}</span>
      <textarea uiTextarea formControlName="address" class="ui-textarea"></textarea>
    </label>
    <label class="space-y-1.5 sm:col-span-2"
      ><span class="text-xs font-medium">{{ t().email }}</span>
      <input uiInput id="vendor-email" type="email" formControlName="email" class="ui-input"
    /></label>
    <div class="flex gap-2 sm:col-span-2">
      <button uiButton type="submit" data-action="save">{{ t().save }}</button>
      <button uiButton type="button" variant="outline" (click)="cancel()">{{ t().cancel }}</button>
    </div>
  </form>
  }
</section>
```

Sesuaikan `data-action="save"` agar test stabil; jangan menambah `data-testid`.

- [ ] **Step 4: Implementasi PIC page**

Pola identik. Field: `picName` (id `pic-name`), `picEmail`, `phone`, `phoneCountryIso`.
`stage('pic', form.getRawValue())`; `status` dari `verifications.pic`.

- [ ] **Step 5: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/pages/vendor/vendor.page.spec.ts
npx ng test --watch=false --include=app/profile-management/pages/pic/pic.page.spec.ts
```

### Task 8: Halaman Rekening Bank + permintaan bank baru

**Files:**

- Create: `src/app/profile-management/pages/bank/bank.page.ts` + `.html` + `.spec.ts`
- Create: `src/app/profile-management/pages/bank/bank-request.dialog.ts` + `.spec.ts`
- Create: `src/app/profile-management/core/file-ref.ts` + `.spec.ts`

**Interfaces:**

- Consumes: `BANKS`, `CURRENCIES`, `RECIPIENT_TYPES`, `UiAttachment`, `UiDialog`.
- Produces: `toFileRef(file: File): FileRef`, `validateFile(file: File): string | null`, `BankRequestDialog`.

- [ ] **Step 1: Tulis test file util yang gagal**

```ts
describe('file utils', () => {
  it('accepts a small PNG', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    expect(validateFile(file)).toBeNull();
  });

  it('rejects a PDF larger than 5 MB', () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.pdf', {
      type: 'application/pdf',
    });
    expect(validateFile(file)).toBe('size');
  });

  it('rejects an unsupported type', () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    expect(validateFile(file)).toBe('type');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/profile-management/core/file-ref.spec.ts
```

- [ ] **Step 3: Implementasi util**

```ts
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

export function validateFile(file: File): 'type' | 'size' | null {
  if (!ALLOWED.includes(file.type)) return 'type';
  if (file.size > MAX_BYTES) return 'size';
  return null;
}

export function toFileRef(file: File): FileRef {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
  };
}
```

- [ ] **Step 4: Implementasi bank request dialog**

Salin `../ivendor-superapps-host/src/app/pages/auth/bank-request-dialog.ts` beserta `bank-request-dialog.spec.ts` sebagai dasar, lalu ganti import i18n dengan `PROFILE_TEXTS` (`bankRequest*` key belum ada — tambahkan key ini ke Task 5 sebelum menyalin: `bankRequestTitle`, `bankRequestName`, `bankRequestCountry`, `bankRequestRegion`, `bankRequestAddress`, `bankRequestBranch`, `bankRequestCity`, `bankRequestSwift`, `bankRequestSave`, `bankRequestCancel`, `bankRequestPhSwift`, `errSwift`).

- [ ] **Step 5: Tulis test bank page yang gagal**

```ts
describe('BankPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [BankPage] });
  });

  it('shows the account number in view mode', () => {
    const fixture = TestBed.createComponent(BankPage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1234567890');
  });

  it('rejects saving with an invalid account number', () => {
    const fixture = TestBed.createComponent(BankPage);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { startEdit(): void }).startEdit();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#bank-account-number',
    )!;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[data-action="save"]')!
      .click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Wajib diisi.');
  });
});
```

- [ ] **Step 6: Implementasi bank page**

Form controls: `bankId` (autocomplete dari `BANKS`), `accountName`, `accountNumber`, `currency` (select), `recipientType` (select), `statement` (file), `request` (dialog). Gunakan `UiAttachment` untuk berkas dan tombol "Permintaan Bank Baru" yang membuka `BankRequestDialog` bila `bankId` tidak ditemukan di `BANKS`. Pada `save()`:

```ts
const values = this.form.getRawValue();
this.store.stage('bank', {
  ...this.store.profile().bank,
  ...values,
  request: this.bankRequest(),
});
this.store.save();
```

- [ ] **Step 7: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/core/file-ref.spec.ts
npx ng test --watch=false --include=app/profile-management/pages/bank/bank.page.spec.ts
npx ng test --watch=false --include=app/profile-management/pages/bank/bank-request.dialog.spec.ts
```

### Task 9: Halaman Pajak dan Domisili

**Files:**

- Create: `src/app/profile-management/pages/tax/tax.page.ts` + `.html` + `.spec.ts`
- Create: `src/app/profile-management/pages/domicile/domicile.page.ts` + `.html` + `.spec.ts`

**Interfaces:**

- Consumes: `validateFile`, `toFileRef`, `ProfileStore`.
- Produces: halaman `tax` (KTP, NPWP, SPPKP, SKB) dan `domicile` (unggah + unduh template).

- [ ] **Step 1: Tulis test tax yang gagal**

```ts
describe('TaxPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TaxPage] });
  });

  it('shows the rejection note from the seed', () => {
    const fixture = TestBed.createComponent(TaxPage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('NPWP tidak terbaca');
  });

  it('saves the KTP name and marks tax pending', () => {
    const fixture = TestBed.createComponent(TaxPage);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { startEdit(): void }).startEdit();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#tax-ktp-name',
    )!;
    input.value = 'Nama KTP Baru';
    input.dispatchEvent(new Event('input'));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[data-action="save"]')!
      .click();
    fixture.detectChanges();
    expect(TestBed.inject(ProfileStore).profile().tax.ktp.name).toBe('Nama KTP Baru');
    expect(TestBed.inject(ProfileStore).profile().verifications.tax.status).toBe('pending');
  });
});
```

- [ ] **Step 2: Implementasi tax page**

Form: `entityType` (radio/select), `ktpName`, `ktpAddress`, `ktpFile`, `npwpName`, `npwpAddress`, `npwpFile`, `hasSppkp` + `sppkpFile`, `hasSkb` + `skbFile`. Validasi file memakai `validateFile` dan pesan `validationFileType` / `validationFileSize`. Saat simpan, bentuk `TaxSection` dan `stage('tax', section)`.

- [ ] **Step 3: Tulis test domicile yang gagal**

```ts
describe('DomicilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [DomicilePage] });
  });

  it('renders the upload control and template link', () => {
    const fixture = TestBed.createComponent(DomicilePage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Surat keterangan domisili');
    expect(element.querySelector('a[download]')).not.toBeNull();
  });
});
```

- [ ] **Step 4: Implementasi domicile page**

Gunakan `UiAttachment` untuk unggah, link `[href]="assetUrl(ctx, 'documents/domicile-template.pdf')"` + `download`, dan `stage('domicile', { file })` saat simpan. Tambahkan `public/documents/domicile-template.pdf` (salin dari host bila ada; bila tidak ada, buat PDF satu halaman dengan teks "Template Surat Keterangan Domisili").

- [ ] **Step 5: Jalankan test**

```bash
npx ng test --watch=false --include=app/profile-management/pages/tax/tax.page.spec.ts
npx ng test --watch=false --include=app/profile-management/pages/domicile/domicile.page.spec.ts
```

### Task 10: Dokumentasi + gate repo remote

**Files:**

- Create: `AGENTS.md`, `README.md`
- Modify: `package.json`

- [ ] **Step 1: Tulis `AGENTS.md` remote**

Salin aturan inti host (bagian 2.2–2.8) dan tambahkan:

```markdown
## Aturan khusus repo remote

- Repo ini adalah remote Native Federation bernama `profile-management`.
- Kontrak host ada di `src/app/core/federation.contract.ts`; **salinan** ada di
  repo host. Setiap perubahan wajib mengubah kedua repo dan menaikkan catatan
  versi kontrak.
- Jangan meng-import file dari repo host. Komponen `shared/ui` dan token style
  disalin manual (lihat header `src/styles.css`).
- Jangan mengubah `federation.config.mjs` tanpa memperbarui host.
- Semua aset lewat `assetUrl()`.
```

- [ ] **Step 2: Tulis `README.md`**

Berisi: cara menjalankan (`npm start` → `:4201`), cara host memuat remote, daftar route, cara deploy, dan peringatan CORS dev.

- [ ] **Step 3: Jalankan seluruh gate**

```bash
npm run format:check
npm run build:prod
npx ng test --watch=false
npm run test:coverage
```

Expected: semua lulus, coverage ≥ 80%.

---

# FASE B — Repo host

### Task 11: Inisialisasi Native Federation di host + manifest per environment

**Files:**

- Modify: `angular.json`, `src/main.ts`, `package.json`, `.gitignore`, `src/environments/*`
- Create: `src/bootstrap.ts`, `federation.config.mjs`, `tsconfig.federation.json`
- Create: `scripts/write-federation-manifest.mjs`
- Test: `src/environments/environment.spec.ts` (bila belum ada)

**Interfaces:**

- Produces: host `initFederation('federation.manifest.json')`, manifest berisi `{ "profile-management": "<url>" }`.

- [ ] **Step 1: Install dan inisialisasi host**

```bash
cd "D:/MUHAMAD REZA - MSP002/PROJECT/SUPERAPPS/IVENDOR-SUPERAPPS/V2/ivendor-superapps-host"
npm i -D @angular-architects/native-federation@22.2.5
npx ng g @angular-architects/native-federation:init \
  --project template-admin --port 1933 --type dynamic-host
```

Expected: `src/bootstrap.ts` berisi bootstrap lama; `src/main.ts` memanggil `initFederation('federation.manifest.json', ...)`; `angular.json` menambah `esbuild`, mengganti `build`/`serve` dengan `@angular-architects/native-federation:build`.

- [ ] **Step 2: Pastikan konfigurasi environment tetap utuh**

Periksa `angular.json`: konfigurasi `development`, `staging`, `production` (termasuk `fileReplacements`, `baseHref`, `budgets`, `outputPath`) harus berpindah ke target `esbuild`. Bila ada yang hilang, salin kembali dari riwayat git.

- [ ] **Step 3: Buat script manifest**

`scripts/write-federation-manifest.mjs`:

```js
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = process.argv[2] ?? 'development';
const remoteEntry =
  env === 'development'
    ? 'http://localhost:4201/remoteEntry.json'
    : 'remotes/profile-management/remoteEntry.json';

const manifest = { 'profile-management': remoteEntry };
writeFileSync(
  resolve(root, 'public/federation.manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
console.log(`federation.manifest.json (${env}) → ${remoteEntry}`);
```

- [ ] **Step 4: Hubungkan ke script npm**

```json
"start": "node scripts/write-version.mjs && node scripts/write-federation-manifest.mjs development && ng serve",
"build": "node scripts/write-version.mjs && node scripts/write-federation-manifest.mjs production && ng build",
"build:dev": "node scripts/write-version.mjs && node scripts/write-federation-manifest.mjs development && ng build --configuration development",
"build:staging": "node scripts/write-version.mjs && node scripts/write-federation-manifest.mjs staging && ng build --configuration staging",
"build:prod": "node scripts/write-version.mjs && node scripts/write-federation-manifest.mjs production && ng build --configuration production"
```

Tambahkan ke `.gitignore`:

```
/public/federation.manifest.json
```

- [ ] **Step 5: Tambahkan `remoteAssetBase` ke environment**

`src/environments/environment.model.ts`:

```ts
/** Base URL absolut/relatif untuk aset remote profile-management. */
remoteAssetBase: string;
```

Nilai per file:

| File                         | `remoteAssetBase`                                |
| ---------------------------- | ------------------------------------------------ |
| `environment.ts`             | `'http://localhost:4201/'`                       |
| `environment.development.ts` | `'http://localhost:4201/'`                       |
| `environment.staging.ts`     | `'/ivendor-staging/remotes/profile-management/'` |
| `environment.production.ts`  | `'/remotes/profile-management/'`                 |

- [ ] **Step 6: Verifikasi**

```bash
npm run build:dev
ls dist/template-admin-development/browser/federation.manifest.json
ls dist/template-admin-development/browser/remoteEntry.json
```

Expected: dua file ada (host tetap menghasilkan `remoteEntry.json` sendiri).

- [ ] **Step 7: Jalankan test host yang ada**

```bash
npx ng test --watch=false
```

Expected: seluruh test lama lulus (jika ada test yang meng-import `main.ts`, sesuaikan ke `bootstrap.ts`).

### Task 12: Kontrak host, loader remote, route, dan error page

**Files:**

- Create: `src/app/core/federation/federation.contract.ts` (salinan)
- Create: `src/app/core/federation/profile-context.provider.ts`
- Create: `src/app/core/federation/remote-loader.ts`
- Create: `src/app/core/federation/federated-route.ts`
- Create: `src/app/pages/remote-error/remote-error.page.ts` + `.spec.ts`
- Modify: `src/app/app.routes.ts`
- Test: `src/app/core/federation/profile-context.provider.spec.ts`, `src/app/core/federation/federated-route.spec.ts`

**Interfaces:**

- Produces: `profileManagementRoute(): Route`, `provideProfileContext(): Provider`, `loadProfileManagementRoutes(): Promise<Routes>`.

- [ ] **Step 1: Tulis test provider yang gagal**

```ts
describe('provideProfileContext', () => {
  it('exposes live language, theme and user readers', () => {
    TestBed.configureTestingModule({ providers: [provideProfileContext()] });
    const context = TestBed.runInInjectionContext(() => inject(PROFILE_CONTEXT) as ProfileContext);
    const i18n = TestBed.inject(TranslationService);

    i18n.setLanguage('ja');
    expect(context.lang()).toBe('ja');

    expect(context.user()).toBeNull();
    expect(context.assetBase).toBe(environment.remoteAssetBase);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/core/federation/profile-context.provider.spec.ts
```

- [ ] **Step 3: Implementasi kontrak + provider**

`federation.contract.ts` — isi **identik** dengan Task 3.

`profile-context.provider.ts`:

```ts
import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { SessionService } from '@/core/state/session.service';
import { PROFILE_CONTEXT, ProfileContext } from '@/core/federation/federation.contract';

export function provideProfileContext(): Provider {
  return {
    provide: PROFILE_CONTEXT,
    useFactory: (
      i18n: TranslationService,
      preferences: PreferencesService,
      session: SessionService,
    ): ProfileContext => ({
      lang: () => i18n.lang(),
      theme: () => preferences.theme(),
      user: () => session.user(),
      assetBase: environment.remoteAssetBase,
    }),
    deps: [TranslationService, PreferencesService, SessionService],
  };
}
```

- [ ] **Step 4: Implementasi loader, route, dan error page**

`remote-loader.ts`:

```ts
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export async function loadProfileManagementRoutes(): Promise<Routes> {
  const module = await loadRemoteModule({
    remoteName: 'profile-management',
    exposedModule: './Routes',
  });
  return module['PROFILE_MANAGEMENT_ROUTES'] as Routes;
}
```

`federated-route.ts`:

```ts
import { Route } from '@angular/router';
import { provideProfileContext } from '@/core/federation/profile-context.provider';
import { loadProfileManagementRoutes } from '@/core/federation/remote-loader';

export function profileManagementRoute(): Route {
  return {
    path: 'profile-management',
    title: 'Vendor Profile · iVendor Superapps',
    data: { page: 'profileManagement' },
    providers: [provideProfileContext()],
    loadChildren: () =>
      loadProfileManagementRoutes().catch(() => [
        {
          path: '**',
          loadComponent: () =>
            import('@/pages/remote-error/remote-error.page').then((m) => m.RemoteErrorPage),
        },
      ]),
  };
}
```

`remote-error.page.ts`:

```ts
@Component({
  selector: 'app-remote-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiIcon],
  template: `
    <section class="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 text-center">
      <ui-icon name="alert-triangle" class="mx-auto size-8 text-destructive" />
      <h1 class="mt-3 font-display text-lg font-semibold">{{ t().remoteErrorTitle }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ t().remoteErrorMessage }}</p>
      <button uiButton type="button" class="mt-4" (click)="retry()">{{ t().remoteRetry }}</button>
    </section>
  `,
})
export class RemoteErrorPage {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);
  protected readonly t = this.i18n.layout;

  protected retry(): void {
    void this.router.navigate(['/profile-management'], { queryParams: { retry: Date.now() } });
  }
}
```

`app.routes.ts` — tambahkan di dalam children `AppShell`, sebelum wildcard:

```ts
profileManagementRoute(),
```

(tambahkan `import { profileManagementRoute } from '@/core/federation/federated-route';` di bagian atas file).

Test error page:

```ts
describe('RemoteErrorPage', () => {
  it('retries with a cache-busting query param', () => {
    TestBed.configureTestingModule({
      imports: [RemoteErrorPage],
      providers: [provideRouter([])],
    });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(RemoteErrorPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();

    expect(navigate).toHaveBeenCalledWith(['/profile-management'], {
      queryParams: { retry: expect.any(Number) },
    });
  });
});
```

- [ ] **Step 5: Tulis test route yang gagal**

```ts
describe('profileManagementRoute', () => {
  it('declares the remote route with contract providers', () => {
    const route = profileManagementRoute();
    expect(route.path).toBe('profile-management');
    expect(route.data).toEqual({ page: 'profileManagement' });
    expect(route.providers).toHaveLength(1);
    expect(typeof route.loadChildren).toBe('function');
  });
});
```

- [ ] **Step 6: Jalankan test**

```bash
npx ng test --watch=false --include=app/core/federation/profile-context.provider.spec.ts
npx ng test --watch=false --include=app/core/federation/federated-route.spec.ts
npx ng test --watch=false --include=app/pages/remote-error/remote-error.page.spec.ts
```

- [ ] **Step 7: Verifikasi manual dua server**

Terminal 1: remote `npx ng serve --port 4201`.
Terminal 2: host `npm start`.
Buka `http://localhost:1933/ivendor/#/profile-management` → overview remote tampil.
Matikan remote, buka route yang sama → error card + tombol retry.

### Task 13: Nav, kartu home, i18n, dan judul topbar

**Files:**

- Modify: `src/app/core/nav.ts`, `src/app/layout/sidebar.ts`
- Modify: `src/app/core/i18n/layout.texts.ts`
- Modify: `src/app/layout/topbar.ts`
- Modify: `src/app/pages/home/home.page.ts`, `home.page.html`
- Test: `src/app/core/nav.spec.ts` (baru), `src/app/layout/topbar.spec.ts`, `src/app/pages/home/home.page.spec.ts`
- Modify: `src/app/core/i18n/texts.spec.ts`

**Interfaces:**

- Produces: `NavChild.labelKey: LayoutTextKey`; kartu home pertama punya `route: '/profile-management'`.

- [ ] **Step 1: Tambah teks layout**

Tambahkan key berikut ke `id`, `en`, `ja` di `LAYOUT_TEXTS`:

```ts
navProfileManagement: 'Profil Vendor',
navProfileOverview: 'Ringkasan',
navProfileVendor: 'Profil',
navProfilePic: 'PIC',
navProfileBank: 'Rekening Bank',
navProfileTax: 'Pajak',
navProfileDomicile: 'Domisili',
pageProfileManagement: 'Profil Vendor',
remoteErrorTitle: 'Modul profil tidak bisa dimuat',
remoteErrorMessage: 'Periksa koneksi Anda lalu coba lagi. Bagian lain aplikasi tetap bisa dipakai.',
remoteRetry: 'Coba lagi',
```

Terjemahan: `en` → `'Vendor Profile'`, `'Overview'`, `'Profile'`, `'PIC'`, `'Bank Account'`, `'Tax'`, `'Domicile'`, `'Vendor Profile'`, `'Profile module could not be loaded'`, `'Check your connection and try again. The rest of the app still works.'`, `'Try again'`. `ja` → `'ベンダープロフィール'`, `'概要'`, `'プロフィール'`, `'担当者'`, `'銀行口座'`, `'税務'`, `'所在地'`, `'ベンダープロフィール'`, `'プロフィールを読み込めません'`, `'接続を確認して再試行してください。他の機能は利用できます。'`, `'再試行'`.

- [ ] **Step 2: Ubah `NavChild` agar memakai key**

`core/nav.ts`:

```ts
export interface NavChild {
  labelKey: LayoutTextKey;
  path: string;
  exact?: boolean;
}
```

Tambahkan item:

```ts
{
  labelKey: 'navProfileManagement',
  path: '/profile-management',
  icon: 'user',
  children: [
    { labelKey: 'navProfileOverview', path: '/profile-management', exact: true },
    { labelKey: 'navProfileVendor', path: '/profile-management/vendor' },
    { labelKey: 'navProfilePic', path: '/profile-management/pic' },
    { labelKey: 'navProfileBank', path: '/profile-management/bank' },
    { labelKey: 'navProfileTax', path: '/profile-management/tax' },
    { labelKey: 'navProfileDomicile', path: '/profile-management/domicile' },
  ],
},
```

`sidebar.ts`: ganti `{{ child.label }}` menjadi `{{ t()[child.labelKey] }}` dan pastikan `t` tersedia (sudah ada untuk item label).

- [ ] **Step 3: Tulis test nav yang gagal**

```ts
describe('NAV_SECTIONS', () => {
  it('includes profile management with all section children', () => {
    const item = NAV_SECTIONS[0].items.find((entry) => entry.path === '/profile-management');
    expect(item).toBeDefined();
    expect(item!.children?.map((child) => child.path)).toEqual([
      '/profile-management',
      '/profile-management/vendor',
      '/profile-management/pic',
      '/profile-management/bank',
      '/profile-management/tax',
      '/profile-management/domicile',
    ]);
  });
});
```

- [ ] **Step 4: Kartu home menjadi navigasi**

`home.page.ts`:

```ts
interface QuickAccessItem {
  title: string;
  description: string;
  image: string;
  route?: string;
}
```

Kartu pertama mendapat `route: '/profile-management'`. Inject `Router` dan ubah handler:

```ts
protected openQuickAccess(item: QuickAccessItem): void {
  if (item.route) {
    void this.router.navigate([item.route]);
    return;
  }
  this.toast.info(this.t().comingSoonTitle, `${item.title} — ${this.t().comingSoonMessage}`);
}
```

`home.page.html`: jangan ubah struktur; handler sudah menangani navigasi.

- [ ] **Step 5: Update test home**

Tambahkan `provideRouter([])` pada `TestBed.configureTestingModule` dan test baru:

```ts
it('navigates to profile management from the first card', () => {
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  const fixture = TestBed.createComponent(HomePage);
  fixture.detectChanges();

  (fixture.nativeElement as HTMLElement)
    .querySelectorAll<HTMLButtonElement>('#quick-access button')[0]
    .click();

  expect(navigate).toHaveBeenCalledWith(['/profile-management']);
});
```

Ganti test toast lama yang mengandalkan kartu pertama (pindahkan ke kartu kedua).

- [ ] **Step 6: Judul topbar**

`topbar.ts`:

```ts
private readonly pageLabels = computed<Record<string, string>>(() => ({
  Home: this.t().pageHome,
  profileManagement: this.t().pageProfileManagement,
}));

protected readonly pageTitle = computed(
  () => this.pageLabels()[this.pageKey()] ?? this.pageKey(),
);
```

Update `topbar.spec.ts` agar memeriksa `profileManagement` → `Profil Vendor` (id).

- [ ] **Step 7: Jalankan test**

```bash
npx ng test --watch=false --include=app/core/nav.spec.ts
npx ng test --watch=false --include=app/pages/home/home.page.spec.ts
npx ng test --watch=false --include=app/layout/topbar.spec.ts
npx ng test --watch=false --include=app/core/i18n/texts.spec.ts
```

### Task 14: `AppUpdateService` multi-`version.json`

**Files:**

- Modify: `src/app/core/update/app-update.service.ts`
- Modify: `src/app/core/update/app-update.service.spec.ts`
- Modify: `src/app/layout/update-banner.ts` (hanya jika perlu label sumber)

**Interfaces:**

- Produces: `pending: Signal<Array<AppVersionInfo & { id: string }>>`, `updateAvailable`, `dismiss()`, `reload()`, `buildReloadUrl(key)`.

- [ ] **Step 1: Tulis test baru yang gagal**

```ts
describe('AppUpdateService (multi source)', () => {
  const manifest = { 'profile-management': 'http://localhost:4201/remoteEntry.json' };

  function stubFetch(buildIds: Record<string, string>): ReturnType<typeof vi.fn> {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('federation.manifest.json')) {
        return { ok: true, json: async () => manifest } as Response;
      }
      const remote = url.includes('4201');
      return {
        ok: true,
        json: async () => ({ buildId: remote ? buildIds['remote'] : buildIds['host'] }),
      } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  afterEach(() => vi.unstubAllGlobals());

  it('establishes baselines for host and remote without reporting updates', async () => {
    stubFetch({ host: 'h1', remote: 'r1' });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AppUpdateService);
    await service.ready;
    expect(service.updateAvailable()).toBe(false);
  });

  it('reports an update when only the remote build changes', async () => {
    stubFetch({ host: 'h1', remote: 'r1' });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AppUpdateService);
    await service.ready;

    stubFetch({ host: 'h1', remote: 'r2' });
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending()[0].id).toBe('profile-management');
  });

  it('ignores a failing source without blocking the other', async () => {
    const fetchMock = stubFetch({ host: 'h1', remote: 'r1' });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AppUpdateService);
    await service.ready;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes('4201')) throw new Error('offline');
      return { ok: true, json: async () => ({ buildId: 'h2' }) } as Response;
    });
    expect(await service.checkNow(true)).toBe(true);
  });

  it('keeps the hash route when building the reload URL', () => {
    window.location.hash = '#/profile-management/bank';
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AppUpdateService);
    expect(service.buildReloadUrl('h2')).toContain('#/profile-management/bank');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

```bash
npx ng test --watch=false --include=app/core/update/app-update.service.spec.ts
```

- [ ] **Step 3: Implementasi**

Struktur wajib:

```ts
interface VersionSource {
  id: string;
  url: string;
}

private readonly sources = signal<VersionSource[]>([{ id: 'host', url: 'version.json' }]);
private readonly baselines = new Map<string, string>();
private readonly dismissed = new Set<string>();
private readonly _pending = signal<Array<AppVersionInfo & { id: string }>>([]);

readonly pending = this._pending.asReadonly();
readonly updateAvailable = computed(() => this._pending().length > 0);

/** Resolved after the manifest is read and the first check finishes. */
readonly ready: Promise<void>;
```

Constructor:

```ts
constructor() {
  this.ready = this.discoverSources().then(() => this.checkNow(true));
  this.timer = setInterval(() => void this.checkNow(), POLL_INTERVAL_MS);
  this.registerFocusListeners();
}
```

`discoverSources()`:

```ts
private async discoverSources(): Promise<void> {
  try {
    const response = await fetch(`federation.manifest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const manifest = (await response.json()) as Record<string, string>;
    const remotes = Object.entries(manifest).map(([id, entry]) => ({
      id,
      url: new URL('version.json', new URL(entry, document.baseURI)).href,
    }));
    this.sources.set([{ id: 'host', url: 'version.json' }, ...remotes]);
  } catch {
    // Host-only mode when the manifest is unavailable.
  }
}
```

`checkNow()` **tidak** memanggil `discoverSources()` (sudah dilakukan constructor); ia memakai `Promise.allSettled` untuk semua source, mengisi baseline, dan menyusun `pending`:

```ts
const pending: Array<AppVersionInfo & { id: string }> = [];
for (const source of this.sources()) {
  const info = results.find((entry) => entry.id === source.id)?.info;
  if (!info) continue;
  const baseline = this.baselines.get(source.id);
  if (!baseline) {
    this.baselines.set(source.id, info.buildId);
    continue;
  }
  const key = `${source.id}:${info.buildId}`;
  if (info.buildId !== baseline && !this.dismissed.has(key)) {
    pending.push({ ...info, id: source.id });
  }
}
this._pending.set(pending);
return pending.length > 0;
```

`dismiss()` dan `reload()`:

```ts
dismiss(): void {
  for (const entry of this._pending()) {
    this.dismissed.add(`${entry.id}:${entry.buildId}`);
  }
  this._pending.set([]);
}

reload(): void {
  const key = this._pending()
    .map((entry) => entry.buildId)
    .join(',');
  window.location.href = this.buildReloadUrl(key);
}
```

Banner tidak perlu diubah; ia membaca `updateAvailable()`.

- [ ] **Step 4: Jalankan test**

```bash
npx ng test --watch=false --include=app/core/update/app-update.service.spec.ts
```

### Task 15: Deploy, cache header, dan dokumentasi

**Files:**

- Modify: `deploy/README.md`, `deploy/nginx.conf.example`, `public/.htaccess`, `README.md`
- Create: `../ivendor-superapps-profile-management/deploy/README.md`, `nginx.conf.example`

- [ ] **Step 1: Tambahkan aturan cache host**

nginx:

```nginx
location = /federation.manifest.json { add_header Cache-Control "no-store" always; }
location = /version.json { add_header Cache-Control "no-store" always; }
location = /remoteEntry.json { add_header Cache-Control "no-cache" always; }
```

Apache (`.htaccess`): tambahkan blok `Files` untuk `federation.manifest.json`, `version.json`, `remoteEntry.json` dengan header yang sama.

- [ ] **Step 2: Tambahkan konfigurasi remote**

Di repo remote, contoh nginx:

```nginx
location = /remotes/profile-management/remoteEntry.json { add_header Cache-Control "no-cache" always; }
location = /remotes/profile-management/version.json { add_header Cache-Control "no-store" always; }
location /remotes/profile-management/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
```

- [ ] **Step 3: Dokumentasikan alur deploy**

`deploy/README.md` host: urutan rilis remote dulu lalu host (bila manifest berubah), path upload `remotes/profile-management/`, dan catatan bahwa banner mendeteksi versi remote.

- [ ] **Step 4: Verifikasi dokumentasi**

Pastikan tidak ada langkah yang bertentangan dengan `AGENTS.md` bagian 2.7 (base href, no-cache index, immutable aset).

### Task 16: E2E MFE + gate akhir

**Files:**

- Modify: `playwright.config.ts`
- Create: `e2e/profile-management.spec.ts`

**Interfaces:**

- Consumes: host `:4205` (Playwright), remote `:4201`.

- [ ] **Step 1: Tambahkan remote sebagai webServer kedua**

`playwright.config.ts`:

```ts
const remoteDir = process.env['PROFILE_REMOTE_DIR'] ?? '../ivendor-superapps-profile-management';

webServer: [
  {
    command: `npm --prefix ${remoteDir} start -- --port 4201`,
    url: 'http://localhost:4201/remoteEntry.json',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
  {
    command: `npm start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
],
```

- [ ] **Step 2: Tulis E2E yang gagal (sebelum remote berjalan di CI)**

```ts
import { expect, test } from '@playwright/test';
import { seedPreferences } from './support';

test.describe('profile management remote', () => {
  test('opens from the home card and saves a bank change', async ({ page }) => {
    await seedPreferences(page);
    await page.goto('/ivendor/#/home');
    await page.getByRole('button', { name: /Vendor Profile Management/ }).click();

    await expect(page).toHaveURL(/#\/profile-management$/);
    await expect(page.getByRole('heading', { name: 'Profil Vendor' })).toBeVisible();

    await page.getByRole('link', { name: 'Rekening Bank' }).click();
    await expect(page).toHaveURL(/#\/profile-management\/bank$/);

    await page.getByRole('button', { name: 'Ubah' }).click();
    await page.locator('#bank-account-name').fill('PT Contoh Baru');
    await page.getByRole('button', { name: 'Simpan' }).click();

    await expect(page.getByText('PT Contoh Baru')).toBeVisible();
  });

  test('shows a retry card when the remote cannot be loaded', async ({ page }) => {
    await page.route('**/remoteEntry.json', (route) => route.abort());
    await page.goto('/ivendor/#/profile-management');

    await expect(
      page.getByRole('heading', { name: 'Modul profil tidak bisa dimuat' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  });
});
```

- [ ] **Step 3: Jalankan E2E**

```bash
npm run e2e
```

Expected: seluruh E2E lulus (test lama + 2 test baru).

- [ ] **Step 4: Jalankan seluruh Definition of Done host**

```bash
npm run format:check
npm run build:dev
npx ng test --watch=false
npm run test:coverage
npm run e2e
```

- [ ] **Step 5: Jalankan Definition of Done remote**

```bash
cd ../ivendor-superapps-profile-management
npm run format:check
npm run build:prod
npx ng test --watch=false
npm run test:coverage
```

- [ ] **Step 6: Verifikasi env staging/production**

```bash
npm run build:staging
cat dist/template-admin-staging/browser/federation.manifest.json
npm run build:prod
cat dist/template-admin/browser/federation.manifest.json
```

Expected: staging berisi path relatif (`remotes/...`), production juga relatif; tidak ada `localhost` pada keduanya.

---

## Catatan eksekusi

- Kerjakan Task 1–10 di repo remote lebih dulu; host tidak bisa memuat remote yang belum ada.
- Task 11 mengubah `angular.json` secara luas. Setelah schematic, bandingkan dengan `git diff` dan pastikan tidak ada konfigurasi environment yang hilang.
- Bila `ng g ...:init` gagal karena `bootstrap.ts` sudah ada, hapus `src/bootstrap.ts` lalu ulangi.
- Jangan menjalankan `npm run e2e` sebelum remote berjalan di `:4201`.
- Setiap task diverifikasi dengan test/build sebelum lanjut ke task berikutnya.

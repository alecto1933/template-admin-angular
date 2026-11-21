# State Management — Design

Tanggal: 2026-11-21
Status: Disetujui untuk implementasi
Pendekatan: A — Signal service per domain (tanpa library baru)

## Tujuan

Menyediakan pola state management yang konsisten untuk empat area:

1. Auth & user session
2. Data server/API (saat ini masih mock, disiapkan agar mudah diganti)
3. Preferensi UI yang perlu diingat (tema, bahasa, sidebar)
4. Standarisasi pola state di seluruh project

## Batasan

- Tidak menambah dependency baru (tanpa NgRx/Akita/SignalStore eksternal).
- Menggunakan `signal`, `computed`, `linkedSignal`, dan `effect` bawaan Angular 22.
- Tidak memigrasikan semua halaman sekaligus.
- Tidak membuat generic store factory.

## Prinsip

- **Store** (`*.store.ts`) dipakai untuk state domain yang dipakai lintas komponen/halaman
  atau harus bertahan saat navigasi.
- **Service** (`*.service.ts`) dipakai untuk utility/stateless (storage, format, toast) dan
  integrasi DOM.
- **State lokal komponen** tetap `signal()` biasa untuk hal yang murni UI: buka/tutup dialog,
  menu konteks, hover, draft form, input sementara.
- Sumber kebenaran state tidak diduplikasi; turunan memakai `computed()`.
- Sinkronisasi ke API non-signal (DOM, localStorage) hanya lewat `effect()`.

## Struktur File

```
src/app/core/
  storage.ts                  # wrapper localStorage yang aman
  state/
    session.service.ts        # auth/user/permission
    preferences.service.ts    # tema, bahasa, sidebar
src/app/pages/orders/
  orders.store.ts             # state domain (pilot)
```

## 1. Storage

`core/storage.ts` mengekspor helper:

- `readJson<T>(key): T | null`
- `writeJson(key, value): void`
- `readString(key): string | null`
- `writeString(key, value): void`
- `remove(key): void`

Semua operasi dibungkus `try/catch` agar aman di private mode / storage tidak tersedia.
Key diberi prefix aplikasi, kecuali key lama yang masih dipakai bootstrap.

## 2. SessionService

State:

- `user: Signal<SessionUser | null>`
- `isAuthenticated: Signal<boolean>` (computed)
- `permissions: Signal<string[]>` (computed)
- `initials: Signal<string>` (computed, untuk avatar topbar)

Aksi:

- `login(user: SessionUser): void`
- `logout(): void`
- `hasPermission(permission: string): boolean`

Persistensi:

- Profil user disimpan sebagai JSON di `localStorage` agar sesi mock bertahan saat reload.
- Token tidak disimpan di sini; saat API nyata hadir, token ditangani lapisan HTTP/backend.

Konsumsi:

- `AppTopbar` membaca nama, email, inisial dari `SessionService` (menghapus data hardcoded).
- Alur logout: konfirmasi modal → `session.logout()` → navigasi ke `/auth/login`.

## 3. PreferencesService

State:

- `theme: 'light' | 'dark'`
- `language: 'id' | 'en'`
- `sidebarCollapsed: boolean`

Perilaku:

- `theme` tetap memakai key `alecto-theme` agar inline script anti-flash di `index.html`
  tidak berubah. Nilai awal dibaca dari class `dark` yang sudah dipasang script tersebut.
  `PreferencesService` menjadi **satu-satunya sumber nilai** dan yang mempersist;
  `ThemeService` hanya menerapkan class `dark` ke `document.documentElement`.
- `language` dipersist dengan key `ivendor-language` sehingga pilihan bahasa bertahan
  setelah reload.
- `sidebarCollapsed` dipersist dengan key `ivendor-sidebar-collapsed`, default `true`
  (sidebar tertutup saat pertama masuk) dan diingat setelah user membuka/menutupnya.

Konsumsi:

- `AppShell` mengambil `sidebarCollapsed` dari preferences (bukan `signal` lokal).
- `AppTopbar` memanggil `preferences.setLanguage()` / `toggleTheme()`.
- `LanguageService` dipertahankan sebagai facade tipis: `lang` menurunkan nilai dari
  `PreferencesService` dan `set()` mendelegasikan ke sana. Tidak boleh ada nilai bahasa
  yang disimpan ganda.

## 4. OrdersStore (pilot)

State:

- `orders: Order[]`
- `status: 'idle' | 'loading' | 'ready' | 'error'`
- `error: string | null`
- `search: string`
- `statusFilter: 'all' | OrderStatus`
- `sortKey: 'createdAt' | 'total'`
- `sortDirection: 'asc' | 'desc'`
- `page: number`

Computed:

- `filtered: Order[]`
- `paged: Order[]`
- `total: number`
- `pageCount: number`

Methods:

- `load()`, `refresh()`
- `setSearch(value)`, `setStatus(value)`, `setSort(key)`, `toggleSortDirection()`, `setPage(n)`
- `create(input)`, `remove(id)`

Sumber data:

- Method privat `fetchOrders()` mengembalikan `Promise<Order[]>` dari mock dengan delay
  kecil untuk mensimulasikan network.
- Saat API nyata tersedia, hanya `fetchOrders()` yang diganti menjadi panggilan HTTP;
  komponen dan test store tidak berubah.

Konsumsi:

- `OrdersPage` meng-inject `OrdersStore`; state domain (data, filter, sort, pagination)
  dipindahkan dari komponen.
- `selected`, `menuOrder`, dan state dialog tetap lokal di komponen karena hanya dipakai
  di halaman itu.

## 5. Migrasi Bertahap

1. `storage.ts` + `PreferencesService` (termasuk memindahkan `sidebarCollapsed`).
2. `SessionService` + integrasi topbar dan alur logout.
3. `OrdersStore` sebagai pilot, lalu `OrdersPage` memakainya.
4. Toggle di `SettingsPage` dan preferensi lain menyusul.
5. Halaman lain dimigrasikan hanya jika state-nya memang lintas komponen.

## 6. Testing

- Unit test store dengan Vitest tanpa DOM (state, computed, aksi).
- Test persistensi preferences dengan storage mock.
- Test `SessionService`: login/logout dan `isAuthenticated`.
- Test yang sudah ada (`theme.service.spec.ts`) tetap dipertahankan.

## Non-goals

- Tidak menambah NgRx, Akita, Elf, atau library state lain.
- Tidak membuat generic store factory / abstraksi baru.
- Tidak memindahkan seluruh state komponen ke store.
- Tidak mengubah desain atau perilaku UI selain yang disebut di atas.

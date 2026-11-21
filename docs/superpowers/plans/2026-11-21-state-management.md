# State Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pola state management berbasis signal (tanpa library baru) untuk preferensi UI, sesi pengguna, dan state domain orders.

**Architecture:** Signal service per domain di `src/app/core/state/`, ditambah helper `storage.ts` yang aman. State domain disimpan di store (`*.store.ts`) yang menyuntikkan data mock lewat satu method privat, sehingga penggantian ke API nanti hanya menyentuh method tersebut. State murni UI tetap lokal di komponen.

**Tech Stack:** Angular 22 (signals, standalone, OnPush), TypeScript 6, Vitest via `@angular/build:unit-test`, Tailwind CSS 4.

## Global Constraints

- Jangan menambah dependency baru (tanpa NgRx/Akita/Elf).
- **Jangan commit ke git.** Semua perubahan tetap di working tree sesuai permintaan user.
- Gunakan `signal`, `computed`; jangan pakai `effect` untuk derived state.
- Ikuti gaya kode yang ada: komponen standalone, `ChangeDetectionStrategy.OnPush`, member `protected readonly` untuk template.
- Path test relatif terhadap `sourceRoot` (`src`), contoh: `npx ng test --watch=false --include=app/core/storage.spec.ts`.
- Jangan mengubah desain/tampilan kecuali yang disebut di task.

---

### Task 1: Storage Helper

**Files:**
- Create: `src/app/core/storage.ts`
- Test: `src/app/core/storage.spec.ts`

**Interfaces:**
- Produces:
  - `appKey(name: string): string` → `ivendor-<name>`
  - `readString(key: string): string | null`
  - `writeString(key: string, value: string): void`
  - `remove(key: string): void`
  - `readJson<T>(key: string): T | null`
  - `writeJson(key: string, value: unknown): void`

- [ ] **Step 1: Tulis test yang gagal**

```ts
// src/app/core/storage.spec.ts
import {
  appKey,
  readJson,
  readString,
  remove,
  writeJson,
  writeString,
} from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('prefixes keys with the app namespace', () => {
    expect(appKey('language')).toBe('ivendor-language');
  });

  it('reads and writes strings', () => {
    writeString(appKey('language'), 'en');
    expect(readString(appKey('language'))).toBe('en');
  });

  it('returns null for missing keys', () => {
    expect(readString(appKey('missing'))).toBeNull();
    expect(readJson(appKey('missing'))).toBeNull();
  });

  it('round-trips JSON values', () => {
    writeJson(appKey('session'), { id: 'usr-1' });
    expect(readJson<{ id: string }>(appKey('session'))).toEqual({ id: 'usr-1' });
  });

  it('returns null for invalid JSON', () => {
    writeString(appKey('broken'), '{not-json');
    expect(readJson(appKey('broken'))).toBeNull();
  });

  it('removes a key', () => {
    writeString(appKey('language'), 'en');
    remove(appKey('language'));
    expect(readString(appKey('language'))).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx ng test --watch=false --include=app/core/storage.spec.ts`
Expected: FAIL — module `./storage` belum ada.

- [ ] **Step 3: Implementasi minimal**

```ts
// src/app/core/storage.ts
const PREFIX = 'ivendor-';

export function appKey(name: string): string {
  return `${PREFIX}${name}`;
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); ignore.
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
}

export function readJson<T>(key: string): T | null {
  const raw = readString(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  writeString(key, JSON.stringify(value));
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npx ng test --watch=false --include=app/core/storage.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Review diff (jangan commit)**

Run: `git diff --stat` dan pastikan hanya dua file task ini yang berubah.

---

### Task 2: PreferencesService + Migrasi Tema/Bahasa/Sidebar

**Files:**
- Create: `src/app/core/state/preferences.service.ts`
- Create: `src/app/core/state/preferences.service.spec.ts`
- Modify: `src/app/core/theme/theme.service.ts` (ganti isi)
- Modify: `src/app/core/language.service.ts` (ganti isi)
- Modify: `src/app/layout/app-shell.ts`

**Interfaces:**
- Consumes: `appKey`, `readString`, `writeString` dari Task 1.
- Produces:
  - `type Theme = 'light' | 'dark'`
  - `type Language = 'id' | 'en'`
  - `PreferencesService.theme: Signal<Theme>`
  - `PreferencesService.language: Signal<Language>`
  - `PreferencesService.sidebarCollapsed: Signal<boolean>`
  - `PreferencesService.toggleTheme(): void`
  - `PreferencesService.setTheme(theme: Theme): void`
  - `PreferencesService.setLanguage(language: Language): void`
  - `PreferencesService.setSidebarCollapsed(collapsed: boolean): void`
  - `PreferencesService.toggleSidebar(): void`

- [ ] **Step 1: Tulis test yang gagal**

```ts
// src/app/core/state/preferences.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { appKey, readString } from '../storage';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({});
  });

  it('defaults to light theme, Indonesian language, and collapsed sidebar', () => {
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.theme()).toBe('light');
    expect(preferences.language()).toBe('id');
    expect(preferences.sidebarCollapsed()).toBe(true);
  });

  it('persists the selected language', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setLanguage('en');

    expect(preferences.language()).toBe('en');
    expect(readString(appKey('language'))).toBe('en');
  });

  it('persists the sidebar state', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.toggleSidebar();

    expect(preferences.sidebarCollapsed()).toBe(false);
    expect(readString(appKey('sidebar-collapsed'))).toBe('false');
  });

  it('toggles the theme and applies the dark class', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setTheme('light');
    preferences.toggleTheme();

    expect(preferences.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(readString('alecto-theme')).toBe('dark');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx ng test --watch=false --include=app/core/state/preferences.service.spec.ts`
Expected: FAIL — `PreferencesService` belum ada.

- [ ] **Step 3: Implementasi PreferencesService**

```ts
// src/app/core/state/preferences.service.ts
import { Injectable, signal } from '@angular/core';
import { appKey, readString, writeString } from '../storage';

export type Theme = 'light' | 'dark';
export type Language = 'id' | 'en';

const THEME_KEY = 'alecto-theme';
const LANGUAGE_KEY = appKey('language');
const SIDEBAR_KEY = appKey('sidebar-collapsed');

function initialTheme(): Theme {
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  const stored = readString(THEME_KEY);
  return stored === 'dark' || stored === 'light' ? stored : 'light';
}

function initialLanguage(): Language {
  const stored = readString(LANGUAGE_KEY);
  return stored === 'en' ? 'en' : 'id';
}

function initialSidebarCollapsed(): boolean {
  return readString(SIDEBAR_KEY) !== 'false';
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly _theme = signal<Theme>(initialTheme());
  private readonly _language = signal<Language>(initialLanguage());
  private readonly _sidebarCollapsed = signal<boolean>(initialSidebarCollapsed());

  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  constructor() {
    this.applyTheme(this._theme());
  }

  toggleTheme(): void {
    this.applyTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  setLanguage(language: Language): void {
    this._language.set(language);
    writeString(LANGUAGE_KEY, language);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._sidebarCollapsed.set(collapsed);
    writeString(SIDEBAR_KEY, String(collapsed));
  }

  toggleSidebar(): void {
    this.setSidebarCollapsed(!this._sidebarCollapsed());
  }

  private applyTheme(theme: Theme): void {
    this._theme.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    writeString(THEME_KEY, theme);
  }
}
```

- [ ] **Step 4: Ganti ThemeService menjadi facade**

```ts
// src/app/core/theme/theme.service.ts
import { computed, inject, Injectable } from '@angular/core';
import { PreferencesService, Theme } from '../state/preferences.service';

export type { Theme };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferences = inject(PreferencesService);

  readonly theme = this.preferences.theme;
  readonly isDark = computed(() => this.theme() === 'dark');

  toggle(): void {
    this.preferences.toggleTheme();
  }

  set(theme: Theme): void {
    this.preferences.setTheme(theme);
  }
}
```

- [ ] **Step 5: Ganti LanguageService menjadi facade**

```ts
// src/app/core/language.service.ts
import { inject, Injectable } from '@angular/core';
import { Language, PreferencesService } from './state/preferences.service';

export type { Language };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly preferences = inject(PreferencesService);

  readonly lang = this.preferences.language;

  set(language: Language): void {
    this.preferences.setLanguage(language);
  }
}
```

- [ ] **Step 6: Hubungkan AppShell ke preferences**

Ubah `src/app/layout/app-shell.ts`:

```ts
import { PreferencesService } from '../core/state/preferences.service';
```

Di dalam class, ganti:

```ts
protected readonly collapsed = signal(true);
```

menjadi:

```ts
private readonly preferences = inject(PreferencesService);
protected readonly collapsed = this.preferences.sidebarCollapsed;
```

Tambahkan method:

```ts
protected toggleSidebar(): void {
  this.preferences.toggleSidebar();
}
```

Di template, ganti `(toggleCollapse)="collapsed.set(!collapsed())"` menjadi
`(toggleCollapse)="toggleSidebar()"`.

- [ ] **Step 7: Jalankan semua test core**

Run: `npx ng test --watch=false --include=app/core`
Expected: PASS — termasuk `theme.service.spec.ts` yang lama.

- [ ] **Step 8: Build**

Run: `npx ng build --configuration development`
Expected: sukses tanpa error.

- [ ] **Step 9: Review diff (jangan commit)**

Run: `git diff -- src/app/core src/app/layout/app-shell.ts`

---

### Task 3: SessionService + Integrasi Login/Topbar

**Files:**
- Create: `src/app/core/state/session.service.ts`
- Create: `src/app/core/state/session.service.spec.ts`
- Modify: `src/app/pages/auth/login.page.ts`
- Modify: `src/app/layout/topbar.ts`

**Interfaces:**
- Consumes: `appKey`, `readJson`, `writeJson`, `remove` dari Task 1.
- Produces:
  - `interface SessionUser { id: string; name: string; email: string; role: string; permissions: string[] }`
  - `DEMO_USER: SessionUser`
  - `SessionService.user: Signal<SessionUser | null>`
  - `SessionService.isAuthenticated: Signal<boolean>`
  - `SessionService.permissions: Signal<string[]>`
  - `SessionService.initials: Signal<string>`
  - `SessionService.login(user?: SessionUser): void`
  - `SessionService.logout(): void`
  - `SessionService.hasPermission(permission: string): boolean`

- [ ] **Step 1: Tulis test yang gagal**

```ts
// src/app/core/state/session.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { appKey, readJson } from '../storage';
import { DEMO_USER, SessionService } from './session.service';

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts without a session', () => {
    const session = TestBed.inject(SessionService);

    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    expect(session.permissions()).toEqual([]);
    expect(session.initials()).toBe('');
  });

  it('logs in with the demo user and persists it', () => {
    const session = TestBed.inject(SessionService);

    session.login();

    expect(session.user()).toEqual(DEMO_USER);
    expect(session.isAuthenticated()).toBe(true);
    expect(session.initials()).toBe('RP');
    expect(readJson(appKey('session'))).toEqual(DEMO_USER);
  });

  it('checks permissions', () => {
    const session = TestBed.inject(SessionService);
    session.login();

    expect(session.hasPermission('orders.write')).toBe(true);
    expect(session.hasPermission('billing.manage')).toBe(false);
  });

  it('logs out and clears the stored session', () => {
    const session = TestBed.inject(SessionService);
    session.login();

    session.logout();

    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    expect(readJson(appKey('session'))).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx ng test --watch=false --include=app/core/state/session.service.spec.ts`
Expected: FAIL — `session.service` belum ada.

- [ ] **Step 3: Implementasi SessionService**

```ts
// src/app/core/state/session.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { appKey, readJson, remove, writeJson } from '../storage';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

const SESSION_KEY = appKey('session');

export const DEMO_USER: SessionUser = {
  id: 'usr-001',
  name: 'Raka Pratama',
  email: 'raka@alecto.id',
  role: 'Admin',
  permissions: ['orders.read', 'orders.write', 'settings.manage'],
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _user = signal<SessionUser | null>(readJson<SessionUser>(SESSION_KEY));

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly permissions = computed(() => this._user()?.permissions ?? []);
  readonly initials = computed(() => initialsOf(this._user()?.name ?? ''));

  login(user: SessionUser = DEMO_USER): void {
    this._user.set(user);
    writeJson(SESSION_KEY, user);
  }

  logout(): void {
    this._user.set(null);
    remove(SESSION_KEY);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }
}
```

- [ ] **Step 4: Hubungkan halaman login**

Di `src/app/pages/auth/login.page.ts`:

Tambahkan import:

```ts
import { SessionService } from '../../core/state/session.service';
```

Tambahkan field di class:

```ts
private readonly session = inject(SessionService);
```

Di method `submit()`, di dalam callback `setTimeout`, **sebelum** `this.router.navigate(['/home']);`, tambahkan:

```ts
this.session.login();
```

Hasil akhir blok tersebut:

```ts
this.loading.set(true);
setTimeout(() => {
  this.loading.set(false);
  this.session.login();
  this.toast.success(this.t().welcomeTitle, this.t().welcomeMessage);
  this.router.navigate(['/home']);
}, 900);
```

- [ ] **Step 5: Hubungkan topbar**

Di `src/app/layout/topbar.ts`:

Tambahkan import:

```ts
import { SessionService } from '../core/state/session.service';
```

Tambahkan field:

```ts
protected readonly session = inject(SessionService);
```

Ganti avatar hardcoded:

```html
<span
  class="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
>
  RP
</span>
```

menjadi:

```html
<span
  class="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
>
  {{ session.initials() || '?' }}
</span>
```

Ganti nama & role:

```html
<span class="block text-[13px] leading-tight font-semibold"> Raka Pratama </span>
<span class="block text-[11px] leading-tight text-muted-foreground"> Admin </span>
```

menjadi:

```html
<span class="block text-[13px] leading-tight font-semibold">
  {{ session.user()?.name ?? 'Tamu' }}
</span>
<span class="block text-[11px] leading-tight text-muted-foreground">
  {{ session.user()?.role ?? '-' }}
</span>
```

Ganti header menu pengguna:

```html
<p class="text-sm font-semibold text-foreground">Raka Pratama</p>
<p class="truncate text-xs text-muted-foreground">raka&#64;alecto.id</p>
```

menjadi:

```html
<p class="text-sm font-semibold text-foreground">{{ session.user()?.name ?? 'Tamu' }}</p>
<p class="truncate text-xs text-muted-foreground">{{ session.user()?.email ?? '-' }}</p>
```

Di method `confirmLogout()`, tambahkan `this.session.logout();` sebelum toast/navigasi:

```ts
protected confirmLogout(): void {
  this.session.logout();
  this.toast.success('Berhasil keluar', 'Sesi demo telah diakhiri.');
  this.router.navigate(['/auth/login']);
}
```

- [ ] **Step 6: Jalankan test session + build**

Run: `npx ng test --watch=false --include=app/core/state/session.service.spec.ts`
Expected: PASS (4 tests).

Run: `npx ng build --configuration development`
Expected: sukses.

- [ ] **Step 7: Review diff (jangan commit)**

Run: `git diff -- src/app/core/state src/app/pages/auth/login.page.ts src/app/layout/topbar.ts`

---

### Task 4: OrdersStore

**Files:**
- Create: `src/app/pages/orders/orders.store.ts`
- Create: `src/app/pages/orders/orders.store.spec.ts`

**Interfaces:**
- Consumes: `Order`, `OrderStatus`, `ORDERS`, `AVATAR_CLASSES` dari `core/mock-data`; `formatDate` dari `core/format`.
- Produces:
  - `type OrderSortKey = 'createdAt' | 'total'`
  - `type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'`
  - `const ORDERS_PAGE_SIZE = 6`
  - `interface NewOrderInput { customer: string; email: string; total: number; status: OrderStatus }`
  - `OrdersStore.orders: Signal<Order[]>`
  - `OrdersStore.status: Signal<LoadStatus>`
  - `OrdersStore.error: Signal<string | null>`
  - `OrdersStore.search: Signal<string>`
  - `OrdersStore.statusFilter: Signal<'all' | OrderStatus>`
  - `OrdersStore.sortKey: Signal<OrderSortKey>`
  - `OrdersStore.sortDirection: Signal<'asc' | 'desc'>`
  - `OrdersStore.filtered: Signal<Order[]>`
  - `OrdersStore.pageCount: Signal<number>`
  - `OrdersStore.currentPage: Signal<number>`
  - `OrdersStore.paged: Signal<Order[]>`
  - `OrdersStore.load(): Promise<void>`
  - `OrdersStore.refresh(): Promise<void>`
  - `OrdersStore.setSearch(value: string): void`
  - `OrdersStore.setStatus(value: 'all' | OrderStatus): void`
  - `OrdersStore.setSort(key: OrderSortKey): void`
  - `OrdersStore.setPage(page: number): void`
  - `OrdersStore.resetFilters(): void`
  - `OrdersStore.create(input: NewOrderInput): Order`
  - `OrdersStore.remove(id: string): void`

- [ ] **Step 1: Tulis test yang gagal**

```ts
// src/app/pages/orders/orders.store.spec.ts
import { ORDER_STATUS, ORDERS } from '../../core/mock-data';
import { OrdersStore } from './orders.store';

describe('OrdersStore', () => {
  let store: OrdersStore;

  beforeEach(() => {
    store = new OrdersStore();
  });

  it('loads mock orders', async () => {
    await store.load();

    expect(store.status()).toBe('ready');
    expect(store.orders().length).toBe(ORDERS.length);
  });

  it('filters by search term', async () => {
    await store.load();

    store.setSearch('dewi');

    expect(store.filtered().every((order) => order.customer.toLowerCase().includes('dewi'))).toBe(
      true,
    );
    expect(store.currentPage()).toBe(1);
  });

  it('filters by status', async () => {
    await store.load();

    store.setStatus('paid');

    expect(store.filtered().every((order) => order.status === 'paid')).toBe(true);
  });

  it('sorts by total and toggles direction', async () => {
    await store.load();

    store.setSort('total');
    const descending = store.filtered().map((order) => order.total);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));

    store.setSort('total');
    const ascending = store.filtered().map((order) => order.total);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
  });

  it('paginates filtered results', async () => {
    await store.load();

    expect(store.pageCount()).toBe(Math.ceil(ORDERS.length / 6));
    expect(store.paged().length).toBe(Math.min(6, ORDERS.length));
  });

  it('creates an order at the top of the list', async () => {
    await store.load();

    const order = store.create({
      customer: 'Budi Santoso',
      email: 'budi@mail.com',
      total: 125000,
      status: 'pending',
    });

    expect(store.orders()[0]).toBe(order);
    expect(order.initials).toBe('BS');
    expect(ORDER_STATUS[order.status].label).toBe('Menunggu');
    expect(store.currentPage()).toBe(1);
  });

  it('removes an order by id', async () => {
    await store.load();
    const target = store.orders()[0];

    store.remove(target.id);

    expect(store.orders().some((order) => order.id === target.id)).toBe(false);
  });

  it('resets filters', async () => {
    await store.load();
    store.setSearch('dewi');
    store.setStatus('paid');

    store.resetFilters();

    expect(store.search()).toBe('');
    expect(store.statusFilter()).toBe('all');
    expect(store.currentPage()).toBe(1);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx ng test --watch=false --include=app/pages/orders/orders.store.spec.ts`
Expected: FAIL — `orders.store` belum ada.

- [ ] **Step 3: Implementasi OrdersStore**

```ts
// src/app/pages/orders/orders.store.ts
import { computed, Injectable, signal } from '@angular/core';
import { formatDate } from '../../core/format';
import { AVATAR_CLASSES, ORDERS, Order, OrderStatus } from '../../core/mock-data';

export type OrderSortKey = 'createdAt' | 'total';
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export const ORDERS_PAGE_SIZE = 6;

const FIRST_INVOICE = 2050;

export interface NewOrderInput {
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly _orders = signal<Order[]>([]);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _search = signal('');
  private readonly _statusFilter = signal<'all' | OrderStatus>('all');
  private readonly _sortKey = signal<OrderSortKey>('createdAt');
  private readonly _sortDirection = signal<'asc' | 'desc'>('desc');
  private readonly _page = signal(1);
  private nextInvoice = FIRST_INVOICE;

  readonly orders = this._orders.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly sortKey = this._sortKey.asReadonly();
  readonly sortDirection = this._sortDirection.asReadonly();

  readonly filtered = computed(() => {
    const query = this._search().trim().toLowerCase();
    const status = this._statusFilter();
    const key = this._sortKey();
    const direction = this._sortDirection() === 'asc' ? 1 : -1;

    return this._orders()
      .filter((order) => status === 'all' || order.status === status)
      .filter(
        (order) =>
          !query ||
          [order.id, order.customer, order.email].some((value) =>
            value.toLowerCase().includes(query),
          ),
      )
      .sort((a, b) => {
        if (key === 'total') {
          return (a.total - b.total) * direction;
        }
        return a.createdAt.localeCompare(b.createdAt) * direction;
      });
  });

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / ORDERS_PAGE_SIZE)),
  );

  readonly currentPage = computed(() => Math.min(this._page(), this.pageCount()));

  readonly paged = computed(() => {
    const page = this.currentPage();
    return this.filtered().slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE);
  });

  async load(): Promise<void> {
    if (this._status() === 'loading' || this._status() === 'ready') {
      return;
    }
    this._status.set('loading');
    this._error.set(null);
    try {
      this._orders.set(await this.fetchOrders());
      this._status.set('ready');
    } catch {
      this._status.set('error');
      this._error.set('Gagal memuat pesanan.');
    }
  }

  async refresh(): Promise<void> {
    this._status.set('idle');
    await this.load();
  }

  setSearch(value: string): void {
    this._search.set(value);
    this._page.set(1);
  }

  setStatus(value: 'all' | OrderStatus): void {
    this._statusFilter.set(value);
    this._page.set(1);
  }

  setSort(key: OrderSortKey): void {
    if (this._sortKey() === key) {
      this._sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this._sortKey.set(key);
      this._sortDirection.set('desc');
    }
    this._page.set(1);
  }

  setPage(page: number): void {
    this._page.set(Math.min(Math.max(1, page), this.pageCount()));
  }

  resetFilters(): void {
    this._search.set('');
    this._statusFilter.set('all');
    this._page.set(1);
  }

  create(input: NewOrderInput): Order {
    const initials = input.customer
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    const order: Order = {
      id: `INV-${this.nextInvoice++}`,
      customer: input.customer.trim(),
      email: input.email.trim(),
      initials: initials || 'NA',
      avatarClass: AVATAR_CLASSES[this._orders().length % AVATAR_CLASSES.length],
      status: input.status,
      total: input.total,
      items: 1,
      date: formatDate(new Date()),
      createdAt: new Date().toISOString(),
    };

    this._orders.update((orders) => [order, ...orders]);
    this._page.set(1);
    return order;
  }

  remove(id: string): void {
    this._orders.update((orders) => orders.filter((order) => order.id !== id));
  }

  private async fetchOrders(): Promise<Order[]> {
    return [...ORDERS];
  }
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npx ng test --watch=false --include=app/pages/orders/orders.store.spec.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Review diff (jangan commit)**

Run: `git diff -- src/app/pages/orders/orders.store.ts src/app/pages/orders/orders.store.spec.ts`

---

### Task 5: Integrasi OrdersPage dengan OrdersStore

**Files:**
- Modify: `src/app/pages/orders/orders.page.ts`
- Test: tidak ada test komponen baru; verifikasi lewat build + test suite + manual.

**Interfaces:**
- Consumes: seluruh API `OrdersStore` dari Task 4 dan `ORDERS_PAGE_SIZE`.
- Produces: `OrdersPage` tetap mengekspos nama signal yang sama ke template (`orders()`, `filtered()`, `paged()`, `search()`, `statusFilter()`, `totalPages()`, `currentPage()`, `rangeStart()`, `rangeEnd()`, `pageNumbers()`, `selectedCount()`, `hasFilters()`), sehingga `orders.page.html` **tidak perlu diubah**.

- [ ] **Step 1: Ganti isi `orders.page.ts`**

```ts
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { formatRupiah } from '../../core/format';
import { ORDER_STATUS, Order, OrderStatus } from '../../core/mock-data';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ORDERS_PAGE_SIZE, OrdersStore } from './orders.store';

type SortKey = 'createdAt' | 'total';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiPageHeader,
    UiButton,
    UiBadge,
    UiIcon,
    UiDialog,
  ],
  templateUrl: './orders.page.html',
})
export class OrdersPage {
  private readonly store = inject(OrdersStore);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly newOrderDialog = viewChild.required<UiDialog>('newOrderDialog');

  protected readonly orders = this.store.orders;
  protected readonly search = this.store.search;
  protected readonly statusFilter = this.store.statusFilter;
  protected readonly sortKey = this.store.sortKey;
  protected readonly sortDirection = this.store.sortDirection;
  protected readonly filtered = this.store.filtered;
  protected readonly paged = this.store.paged;
  protected readonly totalPages = this.store.pageCount;
  protected readonly currentPage = this.store.currentPage;

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly menuOrder = signal<Order | null>(null);

  protected readonly statusMeta = ORDER_STATUS;
  protected readonly formatRupiah = formatRupiah;
  protected readonly statusOptions = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => ({
    value,
    ...ORDER_STATUS[value],
  }));

  protected readonly form = inject(FormBuilder).nonNullable.group({
    customer: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    total: [0, [Validators.required, Validators.min(1)]],
    status: ['pending' as OrderStatus],
  });

  protected readonly rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * ORDERS_PAGE_SIZE + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * ORDERS_PAGE_SIZE, this.filtered().length),
  );

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected readonly selectedCount = computed(() => this.selected().size);

  protected readonly allOnPageSelected = computed(() => {
    const rows = this.paged();
    return rows.length > 0 && rows.every((row) => this.selected().has(row.id));
  });

  protected readonly hasFilters = computed(() => !!this.search() || this.statusFilter() !== 'all');

  constructor() {
    void this.store.load();

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const query = params.get('q');
      if (query !== null) {
        this.store.setSearch(query);
      }
    });
  }

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.store.setStatus((event.target as HTMLSelectElement).value as 'all' | OrderStatus);
  }

  protected resetFilters(): void {
    this.store.resetFilters();
  }

  protected sortBy(key: SortKey): void {
    this.store.setSort(key);
  }

  protected sortIcon(key: SortKey): IconName {
    if (this.sortKey() !== key) {
      return 'arrow-up-down';
    }
    return this.sortDirection() === 'asc' ? 'chevron-up' : 'chevron-down';
  }

  protected goToPage(page: number): void {
    this.store.setPage(page);
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selected.set(next);
  }

  protected toggleAllOnPage(): void {
    const next = new Set(this.selected());
    if (this.allOnPageSelected()) {
      this.paged().forEach((row) => next.delete(row.id));
    } else {
      this.paged().forEach((row) => next.add(row.id));
    }
    this.selected.set(next);
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected openNewOrder(): void {
    this.form.reset({
      customer: '',
      email: '',
      total: 0,
      status: 'pending',
    });
    this.newOrderDialog().open();
  }

  protected invalid(control: 'customer' | 'email' | 'total'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected submitNewOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const order = this.store.create({
      customer: value.customer,
      email: value.email,
      total: value.total,
      status: value.status,
    });

    this.newOrderDialog().close();
    this.toast.success('Pesanan ditambahkan', `${order.id} · ${order.customer}`);
  }

  protected deleteOrder(order: Order): void {
    this.store.remove(order.id);
    this.selected.update((selected) => {
      const next = new Set(selected);
      next.delete(order.id);
      return next;
    });
    this.toast.success('Pesanan dihapus', `${order.id} telah dihapus dari daftar.`);
  }

  protected deleteSelected(): void {
    const ids = this.selected();
    if (!ids.size) {
      return;
    }
    ids.forEach((id) => this.store.remove(id));
    this.clearSelection();
    this.toast.success(`${ids.size} pesanan dihapus`, 'Data contoh hanya berubah di sesi ini.');
  }

  protected copyId(id: string): void {
    if (!navigator.clipboard) {
      this.toast.error('Gagal menyalin', 'Clipboard tidak tersedia.');
      return;
    }
    navigator.clipboard.writeText(id).then(
      () => this.toast.success('ID disalin', id),
      () => this.toast.error('Gagal menyalin', 'Periksa izin clipboard.'),
    );
  }

  protected viewOrder(order: Order): void {
    this.toast.info(
      `${order.id} · ${order.customer}`,
      `${order.items} item · ${formatRupiah(order.total)} · ${order.date}`,
    );
  }

  protected exportOrders(): void {
    this.toast.success('Ekspor dimulai', `${this.filtered().length} pesanan siap diekspor (demo).`);
  }
}
```

- [ ] **Step 2: Build**

Run: `npx ng build --configuration development`
Expected: sukses tanpa error (template tetap kompatibel karena nama signal tidak berubah).

- [ ] **Step 3: Jalankan seluruh test**

Run: `npx ng test --watch=false`
Expected: PASS semua test (storage, preferences, session, orders store, theme).

- [ ] **Step 4: Verifikasi manual dengan Playwright**

1. Jalankan `npx ng serve --port 4210` (background).
2. Buka `http://localhost:4210/auth/login`, isi form, submit.
3. Di `/home`: sidebar default tertutup; buka sidebar → refresh → tetap terbuka.
4. Buka `/orders`: daftar pesanan tampil; cari "dewi"; filter status; sort kolom Total; pindah halaman; tambah pesanan; hapus pesanan.
5. Topbar menampilkan nama sesi; logout → modal → konfirmasi → kembali ke login.
6. Matikan dev server dan hapus folder `.playwright-mcp` bila dibuat.

- [ ] **Step 5: Review diff akhir (jangan commit)**

Run: `git status --short && git diff --stat`
Expected: hanya file yang disebut di task 1-5 berubah; tidak ada `dist/` atau artefak lain.

---

## Catatan Migrasi Lanjutan (di luar plan ini)

- Toggle di `SettingsPage` masih lokal; migrasikan ke `PreferencesService` pada pekerjaan terpisah.
- Saat API nyata hadir: ganti isi `OrdersStore.fetchOrders()` dengan panggilan HTTP dan tambahkan penanganan `status`/`error` di UI.
- Session guard route (`/home`, `/orders`, dst.) belum termasuk; tambahkan saat auth nyata diimplementasikan.

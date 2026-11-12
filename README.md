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
npm start          # http://localhost:4200
npm run build      # build produksi ke dist/
npm test           # unit test (Vitest)
```

Akun demo login: `raka@alecto.id` / `alecto123` (atau email & password apa pun
yang valid — autentikasi hanya simulasi).

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
  (`alecto-theme`) lewat `ThemeService`.
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

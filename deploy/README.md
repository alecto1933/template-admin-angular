# Deploy & Cache Headers

## Build

```bash
npm run build:dev       # dist/template-admin-development/browser
npm run build:staging   # dist/template-admin-staging/browser
npm run build:prod      # dist/template-admin/browser
```

Upload **isi folder `browser/`** ke folder aplikasi di hosting. File
`version.json` dan `.htaccess` ikut di dalamnya.

| Environment | Upload ke |
| --- | --- |
| development | `C:\xampp\htdocs\ivendor\` |
| staging | `/var/www/ivendor-staging/` |
| production | document root domain |

### Base href per environment

Sudah diatur otomatis di `angular.json`:

| Environment | Base href | URL contoh |
| --- | --- | --- |
| development | `/ivendor/` | `http://localhost/ivendor/` |
| staging | `/ivendor-staging/` | `https://domain/ivendor-staging/` |
| production | `/` | `https://domain/` |

`AppUpdateService` memakai `<base href>` untuk mengambil `version.json`, jadi
deteksi update tetap bekerja di subfolder.

Jika butuh path lain, timpa saat build:
```bash
npm run build:staging -- --base-href=/path-lain/
```

### Mengganti base path secara permanen

1. Ubah `baseHref` environment terkait di `angular.json`, misalnya staging:
   ```json
   "staging": { "baseHref": "/vendor/" }
   ```
2. Sesuaikan lokasi deploy agar cocok dengan path:
   - XAMPP/Apache: taruh build di `htdocs/vendor/`.
   - Nginx: sesuaikan semua prefix `location` (index, version.json, aset
     ber-hash, media, fallback) dari `/ivendor-staging/` ke `/vendor/`.
     Alternatif lebih simpel: gunakan vhost/root sendiri dengan base href `/`.
3. Build ulang (`npm run build:staging`) dan deploy.
4. Pastikan base href diawali dan diakhiri `/` (`/vendor/`, bukan `vendor`).

`AppUpdateService` otomatis mengikuti `<base href>`, jadi `version.json`
diambil dari path baru tanpa perubahan kode.

## Staging & Production — Nginx

1. Salin `deploy/nginx.conf.example` ke
   `/etc/nginx/sites-available/ivendor`, sesuaikan `server_name`, `root`, dan SSL.
   Contoh tersebut melayani aplikasi di `/ivendor-staging/`
   (`root /var/www` + folder `ivendor-staging`).
2. Aktifkan:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ivendor /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
3. Setelah setiap deploy, tidak perlu invalidate cache `index.html` karena
   header `no-cache` memaksa browser revalidasi.

## Development — XAMPP/Laragon (Apache)

1. Build: `npm run build:dev`.
2. Salin isi `dist/template-admin-development/browser/` ke
   `C:\xampp\htdocs\ivendor\`.
3. Pastikan di `httpd.conf`:
   ```apache
   LoadModule headers_module modules/mod_headers.so
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
4. Pastikan folder deploy mengizinkan `.htaccess`:
   ```apache
   <Directory "C:/xampp/htdocs/ivendor">
       AllowOverride All
       Require all granted
   </Directory>
   ```
5. Restart Apache. Buka `http://localhost/ivendor/`.

`public/.htaccess` otomatis ikut ter-copy ke folder build dan mengatur header
cache:

| Path | Header |
| --- | --- |
| `index.html` | `no-cache, must-revalidate` |
| `version.json` | `no-store` |
| `main-*` / `chunk-*` / `styles-*` | `public, max-age=31536000, immutable` |
| `/media/*` | `public, max-age=31536000, immutable` |
| gambar lain | `public, max-age=86400` |

## Verifikasi header

```bash
curl -I http://localhost/ivendor/index.html
curl -I http://localhost/ivendor/version.json
curl -I https://domain-anda/ivendor-staging/index.html
curl -I https://domain-anda/ivendor-staging/version.json
```

Yang diharapkan:

```
index.html   → Cache-Control: no-cache, must-revalidate
version.json → Cache-Control: no-store
main-xxxx.js → Cache-Control: public, max-age=31536000, immutable
```

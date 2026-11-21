# Deploy & Cache Headers

## Build

```bash
npm run build:dev       # dist/template-admin-development/browser
npm run build:staging   # dist/template-admin-staging/browser
npm run build:prod      # dist/template-admin/browser
```

Upload **isi folder `browser/`** ke folder aplikasi di hosting. File
`version.json`, `federation.manifest.json`, dan `.htaccess` ikut di dalamnya.

| Environment | Upload ke                   |
| ----------- | --------------------------- |
| development | `C:\xampp\htdocs\ivendor\`  |
| staging     | `/var/www/ivendor-staging/` |
| production  | document root domain        |

### Base href per environment

Sudah diatur otomatis di `angular.json`:

| Environment | Base href           | URL contoh                        |
| ----------- | ------------------- | --------------------------------- |
| development | `/ivendor/`         | `http://localhost/ivendor/`       |
| staging     | `/ivendor-staging/` | `https://domain/ivendor-staging/` |
| production  | `/`                 | `https://domain/`                 |

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
   - Nginx: sesuaikan semua prefix `location` (index, version.json, manifest,
     remote entry, aset ber-hash, media, fallback) dari `/ivendor-staging/` ke
     `/vendor/`. Alternatif lebih simpel: gunakan vhost/root sendiri dengan
     base href `/`.
3. Build ulang (`npm run build:staging`) dan deploy.
4. Pastikan base href diawali dan diakhiri `/` (`/vendor/`, bukan `vendor`).

`AppUpdateService` otomatis mengikuti `<base href>`, jadi `version.json`
diambil dari path baru tanpa perubahan kode.

## Micro frontend `profile-management`

Host memuat remote Native Federation lewat `federation.manifest.json`
(`src/main.ts` → `initFederation('federation.manifest.json')`). Remote dideploy
dari repo terpisah, `ivendor-superapps-profile-management`; panduan remote ada
di `deploy/README.md` repo tersebut.

### Manifest per environment

`scripts/write-federation-manifest.mjs` menghasilkan manifest **saat build**
(sebelum `ng build`). File ini **tidak boleh di-commit**; sudah masuk
`.gitignore`.

| Environment | Perintah                               | Isi manifest                                  |
| ----------- | -------------------------------------- | --------------------------------------------- |
| development | `npm start` / `npm run build:dev`      | `http://localhost:4201/remoteEntry.json`      |
| staging     | `npm run build:staging`                | `remotes/profile-management/remoteEntry.json` |
| production  | `npm run build:prod` / `npm run build` | `remotes/profile-management/remoteEntry.json` |

Path staging/production relatif terhadap `<base href>` host, sehingga remote
selalu same-origin:

| Environment | Base host           | URL remote entry                                               |
| ----------- | ------------------- | -------------------------------------------------------------- |
| staging     | `/ivendor-staging/` | `/ivendor-staging/remotes/profile-management/remoteEntry.json` |
| production  | `/`                 | `/remotes/profile-management/remoteEntry.json`                 |

### Urutan rilis

Remote dan host adalah dua pipeline build terpisah. Rilis remote **dulu**, host
**belum tentu** perlu dideploy ulang:

1. Build + deploy remote (`npm run build:staging` atau `build:prod` di repo
   remote) ke `<base host>/remotes/profile-management/`.
2. Deploy host hanya bila **manifest berubah** (mis. menambah remote baru,
   mengubah URL remote, atau pindah base path). Perubahan kode remote yang
   tidak mengubah manifest tidak memerlukan deploy host.
3. Verifikasi halaman `/profile-management` di host memuat remote versi baru.

Jangan menghapus atau mengganti isi `remotes/profile-management/` sebagian:
`remoteEntry.json` dan chunk ber-hash harus berasal dari build yang sama.

### Deteksi versi remote

`AppUpdateService` membaca `federation.manifest.json`, lalu menambahkan
`version.json` **di samping setiap `remoteEntry.json`**. Artinya banner update
membandingkan `buildId` host **dan** semua remote yang terdaftar; perubahan
build remote saja tetap memunculkan banner. Remote wajib menaruh
`version.json` satu folder dengan `remoteEntry.json`.

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

Contoh nginx memuat aturan untuk artefak host **dan** artefak remote yang
disajikan dari root yang sama. `location =` (exact match) harus tetap ditulis
sebelum `location /` (prefix) agar `version.json`, `remoteEntry.json`, dan
`federation.manifest.json` tidak ikut aturan `immutable`.

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

| Path                              | Header                                |
| --------------------------------- | ------------------------------------- |
| `index.html`                      | `no-cache, must-revalidate`           |
| `version.json`                    | `no-store`                            |
| `federation.manifest.json`        | `no-store`                            |
| `remoteEntry.json`                | `no-cache`                            |
| `main-*` / `chunk-*` / `styles-*` | `public, max-age=31536000, immutable` |
| `/media/*`                        | `public, max-age=31536000, immutable` |
| gambar lain                       | `public, max-age=86400`               |

Aturan `.htaccess` berlaku turun ke subfolder. Jika artefak remote ikut
di-upload ke bawah document root Apache yang sama, `version.json` dan
`remoteEntry.json` remote otomatis mendapat header yang sama. Deployment remote
resmi diasumsikan memakai Nginx (lihat repo remote).

## Verifikasi header

```bash
curl -I http://localhost/ivendor/index.html
curl -I http://localhost/ivendor/version.json
curl -I http://localhost/ivendor/federation.manifest.json
curl -I http://localhost/ivendor/remoteEntry.json
curl -I https://domain-anda/ivendor-staging/index.html
curl -I https://domain-anda/ivendor-staging/version.json
curl -I https://domain-anda/ivendor-staging/federation.manifest.json
curl -I https://domain-anda/ivendor-staging/remoteEntry.json
curl -I https://domain-anda/ivendor-staging/remotes/profile-management/remoteEntry.json
curl -I https://domain-anda/ivendor-staging/remotes/profile-management/version.json
```

Yang diharapkan:

```
index.html                → Cache-Control: no-cache, must-revalidate
version.json              → Cache-Control: no-store
federation.manifest.json  → Cache-Control: no-store
remoteEntry.json          → Cache-Control: no-cache
remotes/.../remoteEntry.json → Cache-Control: no-cache
remotes/.../version.json     → Cache-Control: no-store
main-xxxx.js              → Cache-Control: public, max-age=31536000, immutable
```

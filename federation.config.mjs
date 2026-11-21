import {
  withNativeFederation,
  fromPackageJson,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'template-admin',

  // Allowlist deliberate: dependency baru yang perlu singleton bersama harus
  // ditambahkan di sini pada KEDUA repo. Jangan hapus .only tanpa alasan kuat.
  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    build: 'package',
  })
    .only([
      '@angular/cdk',
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/router',
      'rxjs',
      'tslib',
    ])
    .patch(
      [
        '@angular/common',
        '@angular/core',
        '@angular/forms',
        '@angular/platform-browser',
        '@angular/router',
      ],
      {
        includeSecondaries: { keepAll: true },
      },
    ),

  // Path alias @/ dan @env/ hanya dipakai saat build, bukan shared runtime.
  sharedMappings: [],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});

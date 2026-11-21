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

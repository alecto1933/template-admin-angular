import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

let commit = 'local';
try {
  commit = execSync('git rev-parse --short HEAD', {
    cwd: root,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
} catch {
  // Not a git checkout (e.g. CI archive); fall back to "local".
}

const info = {
  version: pkg.version,
  buildId: `${pkg.version}-${commit}-${Date.now()}`,
  builtAt: new Date().toISOString(),
};

writeFileSync(resolve(root, 'public/version.json'), `${JSON.stringify(info, null, 2)}\n`, 'utf8');
console.log(`version.json → ${info.buildId}`);

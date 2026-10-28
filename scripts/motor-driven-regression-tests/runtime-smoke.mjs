import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'tmp/motor-driven-regression-tests/runtime-smoke');
const require = createRequire(import.meta.url);
const installed = resolve(root, 'node_modules/measur-tools-suite/bin/client.wasm');
const packaged = resolve(root, 'dist/browser/client.wasm');
const hash = value => createHash('sha256').update(value).digest('hex');
if (hash(await readFile(installed)) !== hash(await readFile(packaged))) {
  throw new Error('Build output does not contain the installed Suite WASM; rebuild the app first.');
}
await mkdir(output, { recursive: true });
await build({ entryPoints: [resolve(root, 'src/app/tools-suite-api/motor-driven-regression-tests/runtime-smoke.ts')],
  bundle: true, platform: 'browser', format: 'iife', outfile: resolve(output, 'bundle.js'), logLevel: 'warning' });
await copyFile(packaged, resolve(output, 'client.wasm'));
await writeFile(resolve(output, 'index.html'), '<!doctype html><meta charset="utf-8"><title>Desktop Suite beta runtime verification</title><pre id="result">Running published-beta calculation check…</pre><script src="bundle.js"></script>');
if (process.argv.includes('--electron')) {
  const binary = process.env.ELECTRON_BIN || require('electron');
  const child = spawnSync(binary, [resolve(root, 'scripts/motor-driven-regression-tests/electron-main.cjs')], {
    stdio: 'inherit', env: { ...process.env, MOTOR_DRIVEN_PRELOAD: resolve(root, 'preload.js'), MOTOR_DRIVEN_SMOKE_DIR: output },
    timeout: 45000,
  });
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
} else {
  console.log('Browser consumer prepared at ' + output + '; serve that directory and open index.html.');
}

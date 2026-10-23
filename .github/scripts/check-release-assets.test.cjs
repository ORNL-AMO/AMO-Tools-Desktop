const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { validateAssets } = require('./check-release-assets.cjs');

test('draft release requires all platform assets and update metadata', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'measur-release-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const files = [
    'MEASUR-Setup-1.9.1.exe', 'MEASUR-Setup-1.9.1.exe.blockmap', 'latest.yml',
    'MEASUR-1.9.1.dmg', 'MEASUR-1.9.1.dmg.blockmap', 'MEASUR-1.9.1.zip',
    'MEASUR-1.9.1.zip.blockmap', 'latest-mac.yml', 'MEASUR-1.9.1.AppImage',
    'MEASUR-1.9.1.tar.gz', 'latest-linux.yml',
  ];
  for (const file of files) fs.writeFileSync(path.join(directory, file), 'asset');
  assert.doesNotThrow(() => validateAssets(directory, '1.9.1'));
  for (const file of files) {
    fs.unlinkSync(path.join(directory, file));
    assert.throws(() => validateAssets(directory, '1.9.1'), /Missing or empty/);
    fs.writeFileSync(path.join(directory, file), '');
    assert.throws(() => validateAssets(directory, '1.9.1'), /Missing or empty/);
    fs.writeFileSync(path.join(directory, file), 'asset');
  }
  assert.throws(() => validateAssets(directory, '1.9.2'), /Missing or empty/);
});

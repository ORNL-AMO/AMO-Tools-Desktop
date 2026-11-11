const fs = require('node:fs');
const path = require('node:path');
const { parseSemVer } = require('./check-release-version.cjs');

function validateAssets(directory, version) {
  parseSemVer(version);
  const required = [
    `MEASUR-Setup-${version}.exe`, `MEASUR-Setup-${version}.exe.blockmap`, 'latest.yml',
    `MEASUR-${version}.dmg`, `MEASUR-${version}.dmg.blockmap`,
    `MEASUR-${version}.zip`, `MEASUR-${version}.zip.blockmap`, 'latest-mac.yml',
    `MEASUR-${version}.AppImage`, `MEASUR-${version}.tar.gz`, 'latest-linux.yml',
  ];
  for (const name of required) {
    const file = path.join(directory, name);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
      throw new Error(`Missing or empty release asset: ${name}`);
    }
  }
}

if (require.main === module) {
  try {
    validateAssets(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateAssets };

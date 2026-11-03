const assert = require('node:assert/strict');
const test = require('node:test');
const { compareSemVer, parseSemVer, validateVersionMetadata } = require('./check-release-version.cjs');

test('orders the SemVer precedence examples', () => {
  const versions = [
    '1.0.0-alpha',
    '1.0.0-alpha.1',
    '1.0.0-alpha.beta',
    '1.0.0-beta',
    '1.0.0-beta.2',
    '1.0.0-beta.11',
    '1.0.0-rc.1',
    '1.0.0',
  ];

  for (let index = 1; index < versions.length; index += 1) {
    assert.equal(compareSemVer(versions[index], versions[index - 1]), 1);
  }
});

test('compares release cores and ignores build metadata for precedence', () => {
  assert.equal(compareSemVer('0.16.2-beta', '0.16.1-beta'), 1);
  assert.equal(compareSemVer('2.0.0-alpha', '1.99.99'), 1);
  assert.equal(compareSemVer('1.0.0+build.2', '1.0.0+build.1'), 0);
});

test('rejects invalid semantic versions', () => {
  for (const version of ['1.0', '01.0.0', '1.0.0-01', '1.0.0-alpha..1']) {
    assert.throws(() => parseSemVer(version), /not a semantic version/);
  }
});

test('requires package and lockfile versions to match', () => {
  const packageJson = { version: '1.2.3-beta' };
  assert.doesNotThrow(() => validateVersionMetadata(packageJson, {
    version: '1.2.3-beta',
    packages: { '': { version: '1.2.3-beta' } },
  }));
  assert.throws(() => validateVersionMetadata(packageJson, {
    version: '1.2.2-beta',
    packages: { '': { version: '1.2.3-beta' } },
  }), /versions must match/);
});

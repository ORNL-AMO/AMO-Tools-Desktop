const fs = require('node:fs');

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function parseSemVer(version) {
  const match = SEMVER_PATTERN.exec(version);
  if (!match) {
    throw new Error(`'${version}' is not a semantic version.`);
  }

  return {
    major: BigInt(match[1]),
    minor: BigInt(match[2]),
    patch: BigInt(match[3]),
    prerelease: match[4]?.split('.') ?? [],
  };
}

function compareIdentifiers(left, right) {
  const leftIsNumeric = /^\d+$/.test(left);
  const rightIsNumeric = /^\d+$/.test(right);

  if (leftIsNumeric && rightIsNumeric) {
    const leftNumber = BigInt(left);
    const rightNumber = BigInt(right);
    return leftNumber === rightNumber ? 0 : leftNumber > rightNumber ? 1 : -1;
  }
  if (leftIsNumeric !== rightIsNumeric) {
    return leftIsNumeric ? -1 : 1;
  }
  return left === right ? 0 : left > right ? 1 : -1;
}

function compareSemVer(leftVersion, rightVersion) {
  const left = parseSemVer(leftVersion);
  const right = parseSemVer(rightVersion);

  for (const field of ['major', 'minor', 'patch']) {
    if (left[field] !== right[field]) {
      return left[field] > right[field] ? 1 : -1;
    }
  }

  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    if (left.prerelease.length === right.prerelease.length) return 0;
    return left.prerelease.length === 0 ? 1 : -1;
  }

  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1;
    if (right.prerelease[index] === undefined) return 1;

    const comparison = compareIdentifiers(left.prerelease[index], right.prerelease[index]);
    if (comparison !== 0) return comparison;
  }

  return 0;
}

function validateVersionMetadata(packageJson, lockfile) {
  parseSemVer(packageJson.version);
  if (packageJson.version !== lockfile.version || packageJson.version !== lockfile.packages?.['']?.version) {
    throw new Error('package.json and package-lock.json versions must match.');
  }
}

function main([command, ...args]) {
  if (command === 'metadata') {
    const packageJson = JSON.parse(fs.readFileSync(args[0] ?? 'package.json', 'utf8'));
    const lockfile = JSON.parse(fs.readFileSync(args[1] ?? 'package-lock.json', 'utf8'));
    validateVersionMetadata(packageJson, lockfile);
    return;
  }

  if (command === 'advance' && args.length === 2) {
    if (compareSemVer(args[0], args[1]) <= 0) {
      throw new Error(`Release version ${args[0]} must be greater than ${args[1]}.`);
    }
    return;
  }

  throw new Error('Usage: check-release-version.cjs metadata [package.json package-lock.json] | advance <current> <previous>');
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { compareSemVer, parseSemVer, validateVersionMetadata };

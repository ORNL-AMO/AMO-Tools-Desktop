import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeBackup, stableStringify } from './fixture-tools.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.input || !args.accept) {
  console.error('Usage: npm run ca:regression-tests:extract -- --input <private-backup.json> --accept');
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureDir = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
let backup;
try {
  backup = JSON.parse(readFileSync(resolve(args.input), 'utf8'));
} catch {
  console.error('Unable to read or parse the private MEASUR backup.');
  process.exit(1);
}
const { corpus, coverage } = sanitizeBackup(backup);

mkdirSync(fixtureDir, { recursive: true });
writeFileSync(resolve(fixtureDir, 'corpus.json'), stableStringify(corpus));
writeFileSync(resolve(fixtureDir, 'coverage.json'), stableStringify(coverage));

console.log(`Wrote ${corpus.fixtures.length} sanitized compressed-air fixtures.`);
console.log(`Core fixture count: ${coverage.coreFixtureIds.length}.`);
console.log(`Corpus SHA-256: ${coverage.corpusSha256}.`);

function parseArgs(values) {
  const result = { accept: false };
  for (let index = 0; index < values.length; index++) {
    if (values[index] === '--input') result.input = values[++index];
    if (values[index] === '--accept') result.accept = true;
  }
  return result;
}

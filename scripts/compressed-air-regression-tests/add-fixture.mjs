/**
 * Private-data boundary for adding one real regression-test fixture.
 *
 * Input: a MEASUR JSON export containing exactly one complete compressed-air
 * assessment and its settings.
 * Output: one sanitized fixture appended to corpus.json plus refreshed coverage
 * metadata. The private file is read-only, and its path and source names are
 * never printed or stored.
 *
 * This command intentionally does not calculate or record expected results.
 * That separate review step prevents a newly added input from silently blessing
 * whatever calculation behavior happens to be installed at the time.
 */
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addFixtureToCorpus, stableStringify } from './fixture-tools.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.input || !args.accept) {
  console.error('Usage: npm run ca:regression-tests:add-fixture -- --input <single-assessment-export.json> --accept');
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureDir = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
const corpusPath = resolve(fixtureDir, 'corpus.json');
const coveragePath = resolve(fixtureDir, 'coverage.json');

let exportedData;
let existingCorpus;
try {
  exportedData = JSON.parse(readFileSync(resolve(args.input), 'utf8'));
  existingCorpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
} catch {
  console.error('Unable to read or parse the assessment export or committed fixture corpus.');
  process.exit(1);
}

let result;
try {
  result = addFixtureToCorpus(existingCorpus, exportedData);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to add the assessment fixture.');
  process.exit(1);
}

// Prepare both files before replacing either committed artifact. The temporary
// names also make an interrupted write visibly incomplete instead of corrupting
// valid JSON in place.
const pendingCorpusPath = `${corpusPath}.pending`;
const pendingCoveragePath = `${coveragePath}.pending`;
writeFileSync(pendingCorpusPath, stableStringify(result.corpus));
writeFileSync(pendingCoveragePath, stableStringify(result.coverage));
renameSync(pendingCoveragePath, coveragePath);
renameSync(pendingCorpusPath, corpusPath);

console.log(`Added sanitized fixture ${result.fixture.fixtureId}.`);
console.log(`Real fixture count: ${result.coverage.realFixtureCount}.`);
console.log(`Core fixture count: ${result.coverage.coreFixtureIds.length}.`);
console.log(`Corpus SHA-256: ${result.coverage.corpusSha256}.`);
console.log('Expected results were not changed; review the full regression-test run before recording a new baseline.');

function parseArgs(values) {
  const result = { accept: false };
  for (let index = 0; index < values.length; index++) {
    if (values[index] === '--input') result.input = values[++index];
    if (values[index] === '--accept') result.accept = true;
  }
  return result;
}

/**
 * Private-data boundary for adding one real regression-test fixture.
 *
 * Input: a MEASUR JSON export containing exactly one complete compressed-air
 * assessment and its settings.
 * Output: one new sanitized assessment JSON plus refreshed manifest/coverage
 * metadata. Existing fixture and snapshot files are never rewritten.
 *
 * This command intentionally does not calculate or record expected results.
 * That separate review step prevents a newly added input from silently blessing
 * whatever calculation behavior happens to be installed at the time.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addFixtureToCorpus,
  loadFixtureCorpus,
  stableStringify,
  writeBrowserFixtureRegistry,
} from './fixture-tools.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.input || !args.accept) {
  console.error('Usage: npm run ca:regression-tests:add-fixture -- --input <single-assessment-export.json> --accept');
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureDir = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
const manifestPath = resolve(fixtureDir, 'manifest.json');
const assessmentsDir = resolve(fixtureDir, 'assessments');
const coveragePath = resolve(fixtureDir, 'coverage.json');

let exportedData;
let existingCorpus;
let existingCoverage;
try {
  exportedData = JSON.parse(readFileSync(resolve(args.input), 'utf8'));
  existingCorpus = loadFixtureCorpus(fixtureDir);
  existingCoverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
} catch {
  console.error('Unable to read or parse the assessment export or committed fixture files.');
  process.exit(1);
}

let result;
try {
  result = addFixtureToCorpus(existingCorpus, exportedData, existingCoverage.syntheticFixtures ?? []);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to add the assessment fixture.');
  process.exit(1);
}

const fixturePath = resolve(assessmentsDir, `${result.fixture.fixtureId}.json`);
if (existsSync(fixturePath)) {
  console.error(`Refusing to overwrite existing fixture ${result.fixture.fixtureId}.`);
  process.exit(2);
}
const existingManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const updatedManifest = { ...existingManifest, sourceAppVersion: result.corpus.sourceAppVersion };

// Prepare every artifact before publishing the new fixture. Existing fixture
// files and expected-results snapshots remain untouched.
const pendingFixturePath = `${fixturePath}.pending`;
const pendingManifestPath = `${manifestPath}.pending`;
const pendingCoveragePath = `${coveragePath}.pending`;
writeFileSync(pendingFixturePath, stableStringify(result.fixture));
writeFileSync(pendingManifestPath, stableStringify(updatedManifest));
writeFileSync(pendingCoveragePath, stableStringify(result.coverage));
renameSync(pendingFixturePath, fixturePath);
renameSync(pendingManifestPath, manifestPath);
renameSync(pendingCoveragePath, coveragePath);
writeBrowserFixtureRegistry(fixtureDir);

console.log(`Added sanitized fixture ${result.fixture.fixtureId}.`);
console.log(`Real fixture count: ${result.coverage.realFixtureCount}.`);
console.log(`Core fixture count: ${result.coverage.coreFixtureIds.length}.`);
console.log(`Corpus SHA-256: ${result.coverage.corpusSha256}.`);
console.log('Expected results were not changed; review the full regression-test run before recording a new snapshot.');

function parseArgs(values) {
  const result = { accept: false };
  for (let index = 0; index < values.length; index++) {
    if (values[index] === '--input') result.input = values[++index];
    if (values[index] === '--accept') result.accept = true;
  }
  return result;
}

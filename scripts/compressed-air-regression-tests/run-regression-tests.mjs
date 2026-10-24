/**
 * Node orchestrator for the compressed-air regression tests.
 *
 * Angular/Karma must perform the calculations because the production Suite
 * integration is browser/WASM based. This command starts that focused Karma
 * spec in capture mode, receives the calculated JSON through the custom Karma
 * reporter, and then performs one of three explicit operations:
 *
 *   compare - fail when current results differ from a committed snapshot
 *   record  - write a separately named snapshot (requires --accept)
 *   report  - describe differences without failing (requires --allow-differences)
 *
 * Normal comparison and reporting never modify committed fixtures or snapshots.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  compareSnapshots,
  loadRegressionTestSnapshot,
  stableStringify,
  writeBrowserFixtureRegistry,
} from './fixture-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = parseArgs(process.argv.slice(2));
const fixtureRoot = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
const fixtureManifest = JSON.parse(readFileSync(resolve(fixtureRoot, 'manifest.json'), 'utf8'));
const snapshotName = args.snapshot ?? fixtureManifest.activeSnapshot;
if (!/^[a-z0-9][a-z0-9.-]*$/.test(snapshotName)) {
  console.error('Snapshot names may contain lowercase letters, numbers, dots, and hyphens only.');
  process.exit(2);
}
const snapshotRoot = resolve(fixtureRoot, 'snapshots');
const snapshotPath = resolve(snapshotRoot, snapshotName);
const temporaryDirectory = resolve(root, 'tmp/compressed-air-regression-tests');

if (!['compare', 'record', 'report'].includes(args.command)) usage();
if (args.command === 'record' && !args.accept) {
  console.error('Recording a snapshot requires --accept.');
  process.exit(2);
}
if (args.command === 'record' && !args.snapshot) {
  console.error('Recording a snapshot requires an explicit --snapshot <new-name>.');
  process.exit(2);
}
if (args.command === 'record' && existsSync(snapshotPath)) {
  console.error(`Refusing to overwrite existing snapshot ${snapshotName}. Choose a new snapshot name.`);
  process.exit(2);
}
if (args.command === 'report' && !args.allowDifferences) {
  console.error('Diagnostic reporting requires --allow-differences.');
  process.exit(2);
}

mkdirSync(temporaryDirectory, { recursive: true });
const actualPath = resolve(temporaryDirectory, `actual-${args.scope}.json`);

// The environment variables put the Karma spec in capture mode. In this mode
// the browser calculates results but leaves comparison and reporting to Node.
const test = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['ng', 'test', '--watch=false', '--no-progress', '--include=**/compressed-air-regression-tests.spec.ts'],
  {
    cwd: root,
    env: {
      ...process.env,
      CA_REGRESSION_TEST_OUTPUT: actualPath,
      CA_REGRESSION_TEST_SCOPE: args.scope,
      CA_REGRESSION_TEST_SNAPSHOT: snapshotName,
    },
    encoding: 'utf8',
    stdio: 'inherit',
  },
);
if (test.status !== 0) process.exit(test.status ?? 1);

const actual = JSON.parse(readFileSync(actualPath, 'utf8'));
if (args.command === 'record') {
  if (args.scope !== 'full') {
    console.error('The immutable snapshot must be recorded with --scope full.');
    process.exit(2);
  }
  const pendingPath = `${snapshotPath}.pending`;
  if (existsSync(pendingPath)) {
    console.error(`Incomplete pending snapshot directory already exists for ${snapshotName}.`);
    process.exit(2);
  }
  mkdirSync(pendingPath, { recursive: false });
  const desktopCommit = getDesktopCommit();
  const { fixtures, ...runMetadata } = actual;
  const snapshotManifest = {
    ...runMetadata,
    desktopCommit,
    fixtureIds: fixtures.map(fixture => fixture.fixtureId),
  };
  writeFileSync(resolve(pendingPath, 'manifest.json'), stableStringify(snapshotManifest));
  for (const fixture of fixtures) {
    writeFileSync(resolve(pendingPath, `${fixture.fixtureId}.json`), stableStringify(fixture));
  }
  renameSync(pendingPath, snapshotPath);
  writeBrowserFixtureRegistry(fixtureRoot);
  console.log(`Recorded ${actual.fixtures.length} fixtures in snapshot ${snapshotName}.`);
  console.log('The active snapshot was not changed. Review the new files, then update fixtures/manifest.json explicitly.');
  process.exit(0);
}

const { manifest: snapshotManifest, snapshot: expectedFull } = loadRegressionTestSnapshot(snapshotRoot, snapshotName);
const expected = args.scope === 'full'
  ? expectedFull
  : selectCore(expectedFull, actual.fixtures.map(fixture => fixture.fixtureId));
const differences = compareSnapshots(expected, actual);

if (args.command === 'report') {
  const report = {
    snapshot: snapshotName,
    snapshotProvenance: {
      desktopCommit: snapshotManifest.desktopCommit,
      desktopApplicationVersion: snapshotManifest.desktopApplicationVersion,
      suitePackageVersion: snapshotManifest.suitePackageVersion,
    },
    currentProvenance: {
      desktopCommit: getDesktopCommit(),
      desktopApplicationVersion: actual.desktopApplicationVersion,
      suitePackageVersion: actual.suitePackageVersion,
    },
    scope: args.scope,
    differenceCount: differences.length,
    differences: differences.map(difference => classifyDifference(difference, expected, actual)),
  };
  writeFileSync(resolve(temporaryDirectory, 'report.json'), stableStringify(report));
  writeFileSync(resolve(temporaryDirectory, 'report.md'), renderMarkdown(report));
  console.log(`Wrote sanitized diagnostic reports with ${differences.length} differences under tmp/compressed-air-regression-tests/.`);
  process.exit(0);
}

if (differences.length > 0) {
  console.error(`Compressed-air regression tests failed with ${differences.length} differences.`);
  differences.slice(0, 20).forEach(difference => console.error(`${difference.category}: ${difference.path}`));
  process.exit(1);
}
console.log(`Compressed-air regression tests passed for ${actual.fixtures.length} fixtures.`);

function selectCore(snapshot, fixtureIds) {
  return {
    ...snapshot,
    scope: 'core',
    fixtures: snapshot.fixtures.filter(fixture => fixtureIds.includes(fixture.fixtureId)),
  };
}

function classifyDifference(difference, expected, actual) {
  const fixtureMatch = difference.path.match(/\.fixtures\[(\d+)\]/);
  const fixtureIndex = fixtureMatch ? Number(fixtureMatch[1]) : null;
  const modificationMatch = difference.path.match(/\.modifications\[(\d+)\]/);
  const dayTypeMatch = difference.path.match(/\.dayTypes\[(\d+)\]/);
  const compressorMatch = difference.path.match(/(?:compressorSummaries\[\d+\]|profileSummary)\[(\d+)\]/);
  const intervalMatch = difference.path.match(/(?:profileSummaryData|profileSummaryTotals)\[(\d+)\]/);
  const category = difference.category === 'numeric'
    ? 'numerical-change'
    : difference.category === 'non-finite'
      ? 'non-finite-change'
    : difference.category.startsWith('missing') || difference.category === 'array-length' || difference.category === 'type'
      ? 'structural-change'
      : 'value-change';
  return {
    ...difference,
    changeCategory: category,
    context: {
      fixtureId: fixtureIndex == null
        ? null
        : actual.fixtures?.[fixtureIndex]?.fixtureId ?? expected.fixtures?.[fixtureIndex]?.fixtureId ?? null,
      phase: difference.path.includes('.output.baseline') ? 'baseline' : modificationMatch ? 'modification' : null,
      modificationIndex: modificationMatch ? Number(modificationMatch[1]) : null,
      dayTypeIndex: dayTypeMatch ? Number(dayTypeMatch[1]) : null,
      compressorIndex: compressorMatch ? Number(compressorMatch[1]) : null,
      intervalIndex: intervalMatch ? Number(intervalMatch[1]) : null,
      fieldPath: difference.path,
    },
  };
}

function renderMarkdown(report) {
  const lines = [
    '# Compressed-air regression-test differences',
    '',
    `- Expected-results snapshot: ${report.snapshot}`,
    `- Snapshot Desktop commit: ${report.snapshotProvenance.desktopCommit}`,
    `- Current Desktop commit: ${report.currentProvenance.desktopCommit}`,
    `- Scope: ${report.scope}`,
    `- Differences: ${report.differenceCount}`,
    '',
  ];
  let previousFixture;
  for (const difference of report.differences) {
    if (difference.context.fixtureId !== previousFixture) {
      previousFixture = difference.context.fixtureId;
      lines.push(`# Fixture ${previousFixture ?? 'snapshot metadata'}`, '');
    }
    lines.push(`## ${difference.changeCategory}: ${difference.path}`, '');
    lines.push(`- Category: ${difference.category}`);
    lines.push(`- Phase: ${difference.context.phase ?? 'metadata'}`);
    if (difference.context.modificationIndex != null) lines.push(`- Modification index: ${difference.context.modificationIndex}`);
    if (difference.context.dayTypeIndex != null) lines.push(`- Day-type index: ${difference.context.dayTypeIndex}`);
    if (difference.context.compressorIndex != null) lines.push(`- Compressor index: ${difference.context.compressorIndex}`);
    if (difference.context.intervalIndex != null) lines.push(`- Interval index: ${difference.context.intervalIndex}`);
    if ('expected' in difference) lines.push(`- Expected: ${JSON.stringify(difference.expected)}`);
    if ('actual' in difference) lines.push(`- Actual: ${JSON.stringify(difference.actual)}`);
    if ('absoluteDelta' in difference) lines.push(`- Absolute delta: ${difference.absoluteDelta}`);
    if ('relativeDelta' in difference) lines.push(`- Relative delta: ${difference.relativeDelta}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function parseArgs(values) {
  const result = { command: values[0], scope: 'core', accept: false, allowDifferences: false };
  for (let index = 1; index < values.length; index++) {
    if (values[index] === '--scope') result.scope = values[++index];
    if (values[index] === '--snapshot') result.snapshot = values[++index];
    if (values[index] === '--accept') result.accept = true;
    if (values[index] === '--allow-differences') result.allowDifferences = true;
  }
  if (!['core', 'full'].includes(result.scope)) usage();
  return result;
}

function usage() {
  console.error('Usage: run-regression-tests.mjs <compare|record|report> [--scope core|full] [--snapshot name] [--accept] [--allow-differences]');
  process.exit(2);
}

function getDesktopCommit() {
  const result = spawnSync('git', ['rev-parse', '--short=9', 'HEAD'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error('Unable to determine the current Desktop commit.');
  return result.stdout.trim();
}

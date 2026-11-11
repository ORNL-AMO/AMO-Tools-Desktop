/**
 * Node-level tests for fixture preparation and result comparison.
 *
 * These do not initialize Angular or the Suite. The real-WASM calculation path
 * is exercised by compressed-air-regression-tests.spec.ts. This suite protects
 * the other half of the harness: filtering, deterministic sanitization, privacy,
 * core-case selection, stable serialization, and comparison semantics.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  addFixtureToCorpus,
  buildCoverage,
  compareSnapshots,
  findCompleteCompressedAirAssessments,
  getBrowserFixtureRegistrySource,
  isCompleteCompressedAirAssessment,
  loadFixtureCorpus,
  loadRegressionTestSnapshot,
  selectCoreFixtureIds,
  stableStringify,
  verifyPrivacy,
} from './fixture-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('complete assessment filtering ignores incomplete records', () => {
  const settings = { unitsOfMeasure: 'Imperial' };
  const complete = {
    id: 1,
    type: 'CompressedAir',
    compressedAirAssessment: {
      setupDone: true,
      compressorInventoryItems: [{}],
      systemProfile: { profileSummary: [{}] },
    },
  };
  assert.equal(isCompleteCompressedAirAssessment(complete, settings), true);
  assert.equal(isCompleteCompressedAirAssessment({ ...complete, compressedAirAssessment: { ...complete.compressedAirAssessment, setupDone: false } }, settings), false);
  assert.equal(isCompleteCompressedAirAssessment(complete, undefined), false);
});

test('stable serialization sorts object keys without reordering arrays', () => {
  assert.equal(stableStringify({ z: 1, a: [{ z: 2, a: 3 }] }), '{\n  "a": [\n    {\n      "a": 3,\n      "z": 2\n    }\n  ],\n  "z": 1\n}\n');
});

test('core selection is deterministic and covers all tags', () => {
  const fixtures = [
    { fixtureId: 'b', coverageTags: ['two'] },
    { fixtureId: 'a', coverageTags: ['one', 'two'] },
    { fixtureId: 'c', coverageTags: ['three'] },
  ];
  assert.deepEqual(selectCoreFixtureIds(fixtures, 2), ['a', 'c']);
});

test('privacy validation rejects backup and database fields', () => {
  assert.equal(verifyPrivacy([{ fixtureId: 'safe' }]).valid, true);
  assert.equal(verifyPrivacy([{ logToolData: {} }]).valid, false);
  assert.equal(verifyPrivacy([{ filename: 'private.json' }]).valid, false);
});

test('fixture addition is deterministic, remaps references, and drops Log Tool data', () => {
  const sourceData = {
    assessments: [{
      id: 99,
      appVersion: '1.6.10',
      type: 'CompressedAir',
      name: 'Source Assessment Name',
      compressedAirAssessment: {
        name: 'Source Assessment Name',
        setupDone: true,
        compressorInventoryItems: [{ itemId: 'source-compressor', name: 'Source Compressor', description: 'Private description' }],
        replacementCompressorInventoryItems: [],
        compressedAirDayTypes: [{ dayTypeId: 'source-day', name: 'Source Day', numberOfDays: 365, profileDataType: 'power' }],
        systemBasics: { notes: 'Private notes', electricityCost: .1, demandCost: 0 },
        systemInformation: {
          multiCompressorSystemControls: 'cascading',
          trimSelections: [{ dayTypeId: 'source-day', compressorId: 'source-compressor' }],
          co2SavingsData: {
            energySource: 'Private root energy source',
            zipcode: '12345',
            otherFuelMixedCO2SavingsData: [{
              energySource: 'Private nested energy source',
              fuelType: 'Private nested fuel',
              eGridRegion: 'Private nested region',
              zipcode: '54321',
            }],
          },
        },
        systemProfile: {
          systemProfileSetup: { dayTypeId: 'source-day', numberOfHours: 24, dataInterval: 1, profileDataType: 'power' },
          profileSummary: [{ compressorId: 'source-compressor', dayTypeId: 'source-day', logToolFieldId: 'source-log-field', profileSummaryData: [{}] }],
        },
        endUseData: { endUseDayTypeSetup: { selectedDayTypeId: 'source-day', dayTypeLeakRates: [] }, endUses: [] },
        modifications: [],
        logToolData: { logToolFields: [{ alias: 'Private Log Alias' }] },
      },
    }],
    settings: [{ assessmentId: 99, unitsOfMeasure: 'Imperial', eGridRegion: 'Private Region', zipcode: '12345' }],
  };
  const assessmentExport = {
    assessments: [{ assessment: sourceData.assessments[0], settings: sourceData.settings[0] }],
  };
  const emptyCorpus = { schemaVersion: 1, sourceAppVersion: 'unknown', fixtures: [] };
  const first = addFixtureToCorpus(emptyCorpus, assessmentExport);
  const second = addFixtureToCorpus(emptyCorpus, assessmentExport);
  assert.equal(stableStringify(first), stableStringify(second));
  const fixture = first.fixture;
  const data = fixture.assessment.compressedAirAssessment;
  assert.equal(data.systemProfile.profileSummary[0].compressorId, data.compressorInventoryItems[0].itemId);
  assert.equal(data.systemProfile.profileSummary[0].dayTypeId, data.compressedAirDayTypes[0].dayTypeId);
  assert.equal('logToolData' in data, false);
  assert.equal('logToolFieldId' in data.systemProfile.profileSummary[0], false);
  assert.equal(stableStringify(fixture).includes('Source Assessment Name'), false);
  assert.equal(stableStringify(fixture).includes('Private Region'), false);
  assert.equal(stableStringify(fixture).includes('Private nested energy source'), false);
  assert.equal(data.systemInformation.co2SavingsData.otherFuelMixedCO2SavingsData[0].zipcode, '00000');
});

test('fixture addition rejects stale retained references instead of leaking source IDs', () => {
  const assessment = {
    appVersion: '1.9.0',
    type: 'CompressedAir',
    compressedAirAssessment: {
      setupDone: true,
      compressorInventoryItems: [{ itemId: 'known-compressor', nameplateData: {}, compressorControls: {} }],
      compressedAirDayTypes: [{ dayTypeId: 'known-day', profileDataType: 'power' }],
      systemInformation: {
        trimSelections: [{ compressorId: 'private-stale-id', dayTypeId: 'known-day' }],
      },
      systemProfile: { profileSummary: [{ compressorId: 'known-compressor', dayTypeId: 'known-day' }] },
      modifications: [],
    },
  };
  const exportedData = { assessments: [{ assessment, settings: { unitsOfMeasure: 'Imperial' } }] };
  assert.throws(
    () => addFixtureToCorpus({ schemaVersion: 1, fixtures: [] }, exportedData),
    /retained fixture reference/,
  );
});

test('fixture addition accepts a normal one-assessment export and preserves existing fixtures', () => {
  const assessment = {
    id: 7,
    appVersion: '1.9.0',
    type: 'CompressedAir',
    name: 'New private assessment',
    compressedAirAssessment: {
      name: 'New private assessment',
      setupDone: true,
      compressorInventoryItems: [{ itemId: 1, name: 'Private compressor', nameplateData: {}, compressorControls: {} }],
      compressedAirDayTypes: [],
      systemProfile: { profileSummary: [{}] },
      modifications: [],
    },
  };
  const assessmentExport = {
    assessments: [{ assessment, settings: { assessmentId: 7, unitsOfMeasure: 'Imperial' } }],
  };
  assert.equal(findCompleteCompressedAirAssessments(assessmentExport).length, 1);
  assert.equal(findCompleteCompressedAirAssessments({
    assessments: [assessment],
    settings: [{ assessmentId: 7, unitsOfMeasure: 'Imperial' }],
  }).length, 0);

  const existingFixture = {
    fixtureId: 'ca-real-043',
    source: 'sanitized-backup',
    coverageTags: ['units:Imperial'],
    assessment: { appVersion: '1.6.10' },
    settings: { unitsOfMeasure: 'Imperial' },
  };
  const result = addFixtureToCorpus(
    { schemaVersion: 1, sourceAppVersion: '1.6.10', fixtures: [existingFixture] },
    assessmentExport,
  );
  assert.equal(result.fixture.fixtureId, 'ca-real-044');
  assert.deepEqual(result.corpus.fixtures[0], existingFixture);
  assert.equal(result.coverage.realFixtureCount, 2);
  assert.equal(result.corpus.sourceAppVersion, '1.6.10, 1.9.0');
});

test('fixture addition rejects duplicates and ambiguous multi-assessment exports', () => {
  const assessment = {
    id: 9,
    appVersion: '1.9.0',
    type: 'CompressedAir',
    compressedAirAssessment: {
      setupDone: true,
      compressorInventoryItems: [{ itemId: 1, nameplateData: {}, compressorControls: {} }],
      compressedAirDayTypes: [],
      systemProfile: { profileSummary: [{}] },
      modifications: [],
    },
  };
  const settings = { assessmentId: 9, unitsOfMeasure: 'Imperial' };
  const one = { assessments: [{ assessment, settings }] };
  const initial = addFixtureToCorpus({ schemaVersion: 1, fixtures: [] }, one);
  assert.throws(() => addFixtureToCorpus(initial.corpus, one), /already represented/);

  const two = { assessments: [{ assessment, settings }, { assessment: structuredClone(assessment), settings }] };
  assert.throws(() => addFixtureToCorpus({ schemaVersion: 1, fixtures: [] }, two), /multiple complete/);
});

test('coverage aggregates real and synthetic fixture inventories', () => {
  const coverage = buildCoverage(
    [{ fixtureId: 'real', coverageTags: ['real-only', 'shared'] }],
    [{ fixtureId: 'synthetic', coverageTags: ['synthetic-only', 'shared'] }],
  );
  assert.equal(coverage.realFixtureCount, 1);
  assert.equal(coverage.syntheticFixtureCount, 1);
  assert.equal(coverage.totalFixtureCount, 2);
  assert.deepEqual(coverage.realTags, { 'real-only': 1, shared: 1 });
  assert.deepEqual(coverage.syntheticTags, { shared: 1, 'synthetic-only': 1 });
  assert.deepEqual(coverage.tags, { 'real-only': 1, shared: 2, 'synthetic-only': 1 });
  assert.deepEqual(new Set(coverage.coreFixtureIds), new Set(['real', 'synthetic']));
  assert.equal(coverage.realFixtures[0].fixtureId, 'real');
  assert.equal(typeof coverage.realFixtures[0].sha256, 'string');
  assert.ok(coverage.missingScenarios.includes('auxiliary-equipment'));
});

test('snapshot recording refuses to overwrite an existing snapshot', () => {
  const fixtureRoot = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
  const activeSnapshot = JSON.parse(readFileSync(resolve(fixtureRoot, 'manifest.json'), 'utf8')).activeSnapshot;
  const run = spawnSync(
    process.execPath,
    [
      'scripts/compressed-air-regression-tests/run-regression-tests.mjs',
      'record', '--scope', 'full', '--snapshot', activeSnapshot, '--accept',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(run.status, 2);
  assert.match(run.stderr, new RegExp(`Refusing to overwrite existing snapshot ${activeSnapshot.replaceAll('.', '\\.')}\\b`));
});

test('committed fixtures pass the standalone privacy guard', () => {
  const fixtureRoot = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
  const corpus = loadFixtureCorpus(fixtureRoot);
  assert.ok(corpus.fixtures.length > 0);
  assert.equal(verifyPrivacy(corpus.fixtures).valid, true);
  const serialized = stableStringify(corpus);
  assert.doesNotMatch(serialized, /OneDrive|ADJUSTED_MEASUR_Backup_Data|logToolData|logToolFieldId/);
});

test('per-file fixture and snapshot loaders preserve deterministic order and manifests', () => {
  const fixtureRoot = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
  const activeSnapshot = JSON.parse(readFileSync(resolve(fixtureRoot, 'manifest.json'), 'utf8')).activeSnapshot;
  const corpus = loadFixtureCorpus(fixtureRoot);
  assert.equal(corpus.fixtures.length, 43);
  assert.equal(corpus.fixtures[0].fixtureId, 'ca-real-001');
  assert.equal(corpus.fixtures.at(-1).fixtureId, 'ca-real-043');

  const { manifest, snapshot } = loadRegressionTestSnapshot(
    resolve(fixtureRoot, 'snapshots'),
    activeSnapshot,
  );
  assert.equal(manifest.snapshotName, activeSnapshot);
  assert.equal(typeof manifest.desktopCommit, 'string');
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.fixtures.length, 49);
  assert.deepEqual(snapshot.fixtures.map(fixture => fixture.fixtureId), manifest.fixtureIds);
});

test('generated browser registry matches the per-file fixture manifests', () => {
  const fixtureRoot = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures');
  const registryPath = resolve(fixtureRoot, 'fixture-registry.ts');
  assert.equal(readFileSync(registryPath, 'utf8'), getBrowserFixtureRegistrySource(fixtureRoot));
});

test('per-file loaders reject filename and manifest mismatches', () => {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'ca-regression-loader-'));
  try {
    const fixtureRoot = resolve(temporaryRoot, 'fixtures');
    mkdirSync(resolve(fixtureRoot, 'assessments'), { recursive: true });
    writeFileSync(resolve(fixtureRoot, 'manifest.json'), JSON.stringify({ schemaVersion: 1, sourceAppVersion: 'test' }));
    writeFileSync(resolve(fixtureRoot, 'assessments/ca-real-001.json'), JSON.stringify({ fixtureId: 'ca-real-002' }));
    assert.throws(() => loadFixtureCorpus(fixtureRoot), /does not match embedded ID/);

    const snapshotRoot = resolve(fixtureRoot, 'snapshots');
    mkdirSync(resolve(snapshotRoot, 'test-snapshot'), { recursive: true });
    writeFileSync(resolve(snapshotRoot, 'test-snapshot/manifest.json'), JSON.stringify({
      snapshotName: 'test-snapshot',
      fixtureIds: ['missing-fixture'],
    }));
    assert.throws(
      () => loadRegressionTestSnapshot(snapshotRoot, 'test-snapshot'),
      /fixture files do not match its manifest/,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test('coverage inventory names matching fixtures and known compound gaps', () => {
  const coveragePath = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures/coverage.json');
  const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
  const auxiliary = coverage.scenarios.find(scenario => scenario.id === 'auxiliary-equipment');
  assert.equal(auxiliary.status, 'covered');
  assert.ok(auxiliary.matchingFixtureIds.length > 0);
  const subHourEem = coverage.scenarios.find(scenario => scenario.id === 'sub-hour-with-eem');
  assert.equal(subHourEem.status, 'missing');
  assert.match(subHourEem.missingReason, /pressure-indexing/);
});

test('every known non-finite path has a documented reason', () => {
  const allowancePath = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures/known-non-finite-paths.json');
  const allowance = JSON.parse(readFileSync(allowancePath, 'utf8'));
  assert.equal(allowance.schemaVersion, 2);
  const usedReasons = new Set();
  for (const fixture of allowance.fixtures) {
    assert.ok(fixture.allowances.length > 0);
    for (const group of fixture.allowances) {
      assert.ok(allowance.reasons[group.reason], `Unknown reason ${group.reason}`);
      assert.ok(group.paths.length > 0);
      usedReasons.add(group.reason);
    }
  }
  assert.deepEqual(usedReasons, new Set(Object.keys(allowance.reasons)));
});

test('snapshot comparison uses hybrid tolerance and reports structure', () => {
  assert.deepEqual(compareSnapshots({ value: 100 }, { value: 100.00005 }), []);
  const differences = compareSnapshots({ value: 100, rows: [1] }, { value: 101, rows: [1, 2] });
  assert.deepEqual(differences.map(item => item.category), ['array-length', 'numeric']);
});

test('snapshot comparison ignores provenance and still checks the calculation contract', () => {
  const expected = {
    schemaVersion: 2,
    resultSchemaVersion: 2,
    snapshotName: 'accepted-snapshot',
    desktopApplicationVersion: '1.0.0',
    suitePackageVersion: '1.2.6-rc.2',
    sourceMeasurVersion: '1.4.0',
    scope: 'core',
    fixtures: [{ fixtureId: 'ca-real-001', value: 100 }],
  };
  const actual = {
    ...expected,
    snapshotName: 'current-run',
    desktopApplicationVersion: '1.1.0',
    suitePackageVersion: '1.2.6-rc.350.1',
    sourceMeasurVersion: '1.5.0',
  };

  assert.deepEqual(compareSnapshots(expected, actual), []);
  const differences = compareSnapshots(expected, { ...actual, resultSchemaVersion: 3 });
  assert.deepEqual(differences.map(item => item.path), ['$.resultSchemaVersion']);
});

test('snapshot comparison distinguishes missing, reordered, exception, and non-finite changes', () => {
  const differences = compareSnapshots(
    { rows: [{ id: 1 }, { id: 2 }], status: 'known-failure', failure: 'TypeError', value: 1 },
    { rows: [{ id: 2 }, { id: 1 }], status: 'calculated', value: NaN, added: null },
  );
  assert.ok(differences.some(item => item.category === 'missing-expected-field'));
  assert.ok(differences.some(item => item.category === 'missing-actual-field'));
  assert.ok(differences.some(item => item.path.includes('.rows')));
  assert.ok(differences.some(item => item.category === 'non-finite'));
});

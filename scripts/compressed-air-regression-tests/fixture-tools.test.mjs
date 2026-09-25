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
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addFixtureToCorpus,
  compareSnapshots,
  findCompleteCompressedAirAssessments,
  isCompleteCompressedAirAssessment,
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
        systemInformation: { multiCompressorSystemControls: 'cascading', trimSelections: [{ dayTypeId: 'source-day', compressorId: 'source-compressor' }] },
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

test('committed fixtures pass the standalone privacy guard', () => {
  const corpusPath = resolve(root, 'src/app/compressed-air-assessment/calculations/regression-tests/fixtures/corpus.json');
  const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
  assert.ok(corpus.fixtures.length > 0);
  assert.equal(verifyPrivacy(corpus.fixtures).valid, true);
  const serialized = stableStringify(corpus);
  assert.doesNotMatch(serialized, /OneDrive|ADJUSTED_MEASUR_Backup_Data|logToolData|logToolFieldId/);
});

test('snapshot comparison uses hybrid tolerance and reports structure', () => {
  assert.deepEqual(compareSnapshots({ value: 100 }, { value: 100.00005 }), []);
  const differences = compareSnapshots({ value: 100, rows: [1] }, { value: 101, rows: [1, 2] });
  assert.deepEqual(differences.map(item => item.category), ['array-length', 'numeric']);
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

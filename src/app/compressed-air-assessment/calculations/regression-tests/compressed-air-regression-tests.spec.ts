/**
 * Karma entry point for compressed-air assessment regression tests.
 *
 * There are two execution modes:
 *
 * 1. A normal `npm test` run calculates the coverage-selected core set and
 *    compares it with the imported baseline directly in Jasmine.
 * 2. The dedicated core/full/report/record commands pass `ca-capture` through
 *    Karma. The browser still performs every real-WASM calculation, but emits
 *    the current snapshot so the Node command can select a baseline, produce a
 *    detailed report, or explicitly record a new baseline.
 *
 * See scripts/compressed-air-regression-tests/README.md for the full data flow.
 */
import corpusData from './fixtures/corpus.json';
import coverageData from './fixtures/coverage.json';
import baselineData from './fixtures/baselines/pre-pr409-suite-1.2.5.json';
import {
  compareRegressionTestSnapshots,
  CompressedAirRegressionTestRunner,
  RegressionTestSnapshot,
} from './compressed-air-regression-tests.runner';
import { SYNTHETIC_FIXTURE_COUNT } from './synthetic-fixtures';

declare const __karma__: {
  config: { args?: string[] };
  info(info: { caSnapshotChunk: { index: number; total: number; data: string } }): void;
};

describe('compressed-air assessment regression tests', () => {
  let runner: CompressedAirRegressionTestRunner;

  beforeAll(async () => {
    runner = new CompressedAirRegressionTestRunner();
    // This initializes the actual measur-tools-suite module and WASM binary once
    // for the suite. No compressor calculation is mocked by this spec.
    await runner.initialize();
  });

  it('matches the immutable pre-change baseline', () => {
    const args = new Set(__karma__?.config?.args ?? []);
    const scope = args.has('ca-scope-full') ? 'full' : 'core';
    const baselineArg = [...args].find(arg => arg.startsWith('ca-baseline='));
    const baselineName = baselineArg?.slice('ca-baseline='.length) ?? 'pre-pr409-suite-1.2.5';
    const actual = runner.run(corpusData as any, coverageData.coreFixtureIds, scope, baselineName);

    if (args.has('ca-capture')) {
      // Dedicated commands compare outside the browser so they can write a
      // structured diagnostic report without giving Karma filesystem access.
      emitSnapshot(actual);
      const expectedCount = scope === 'full'
        ? corpusData.fixtures.length + SYNTHETIC_FIXTURE_COUNT
        : coverageData.coreFixtureIds.length;
      expect(actual.fixtures.length).toBe(expectedCount);
      return;
    }

    const expected = selectScope(baselineData as RegressionTestSnapshot, coverageData.coreFixtureIds, scope);
    const differences = compareRegressionTestSnapshots(expected, actual);
    expect(differences).withContext(differences.slice(0, 20).join('\n')).toEqual([]);
  });
});

function selectScope(snapshot: RegressionTestSnapshot, coreFixtureIds: string[], scope: 'core' | 'full'): RegressionTestSnapshot {
  if (scope === 'full') return snapshot;
  return {
    ...snapshot,
    scope: 'core',
    fixtures: snapshot.fixtures.filter(fixture => coreFixtureIds.includes(fixture.fixtureId)),
  };
}

function emitSnapshot(snapshot: RegressionTestSnapshot): void {
  // Karma browser_info messages have practical payload limits. Chunking avoids
  // truncating the full corpus while keeping the transfer out of console logs.
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))));
  const chunkSize = 48_000;
  const chunks = Math.ceil(encoded.length / chunkSize);
  for (let index = 0; index < chunks; index++) {
    __karma__.info({
      caSnapshotChunk: {
        index,
        total: chunks,
        data: encoded.slice(index * chunkSize, (index + 1) * chunkSize),
      },
    });
  }
}

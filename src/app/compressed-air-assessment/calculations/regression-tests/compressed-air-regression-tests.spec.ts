/**
 * Karma entry point for compressed-air assessment regression tests.
 *
 * There are two execution modes:
 *
 * 1. A normal `npm test` run calculates the coverage-selected core set and
 *    compares it with the active expected-results snapshot in Jasmine.
 * 2. The dedicated core/full/report/record commands pass `ca-capture` through
 *    Karma. The browser still performs every real-WASM calculation, but emits
 *    the current results so the Node command can select a snapshot, produce a
 *    detailed report, or explicitly record a new snapshot.
 *
 * See scripts/compressed-air-regression-tests/README.md for the full data flow.
 */
import fixtureManifest from './fixtures/manifest.json';
import coverageData from './fixtures/coverage.json';
import { regressionTestCorpus, regressionTestSnapshots } from './fixtures/fixture-registry';
import {
  compareRegressionTestSnapshots,
  CompressedAirRegressionTestRunner,
  RegressionTestSnapshot,
} from './compressed-air-regression-tests.runner';

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

  it('matches the active expected-results snapshot', () => {
    const args = new Set(__karma__?.config?.args ?? []);
    const scope = args.has('ca-scope-full') ? 'full' : 'core';
    const snapshotArg = [...args].find(arg => arg.startsWith('ca-snapshot='));
    const snapshotName = snapshotArg?.slice('ca-snapshot='.length) ?? fixtureManifest.activeSnapshot;
    const actual = runner.run(regressionTestCorpus as any, coverageData.coreFixtureIds, scope, snapshotName);

    if (args.has('ca-capture')) {
      // Dedicated commands compare outside the browser so they can write a
      // structured diagnostic report without giving Karma filesystem access.
      emitSnapshot(actual);
      const expectedCount = scope === 'full'
        ? coverageData.totalFixtureCount
        : coverageData.coreFixtureIds.length;
      expect(actual.fixtures.length).toBe(expectedCount);
      const expectedSyntheticCoverage = coverageData.syntheticFixtures
        .filter(fixture => actual.fixtures.some(result => result.fixtureId === fixture.fixtureId));
      for (const expectedFixture of expectedSyntheticCoverage) {
        const actualFixture = actual.fixtures.find(fixture => fixture.fixtureId === expectedFixture.fixtureId);
        expect([...actualFixture.coverageTags].sort()).toEqual(expectedFixture.coverageTags);
      }
      return;
    }

    const expectedSnapshot = regressionTestSnapshots[snapshotName];
    if (!expectedSnapshot) throw new Error(`Snapshot ${snapshotName} is not present in the generated browser registry.`);
    const expected = selectScope(expectedSnapshot as RegressionTestSnapshot, coverageData.coreFixtureIds, scope);
    const differences = compareRegressionTestSnapshots(expected, actual);
    expect(differences).withContext(differences.slice(0, 20).join('\n')).toEqual([]);
  });
});

describe('compressed-air regression snapshot comparison', () => {
  it('ignores snapshot provenance while preserving calculation contract checks', () => {
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

    expect(compareRegressionTestSnapshots(expected, actual)).toEqual([]);
    expect(compareRegressionTestSnapshots(expected, { ...actual, resultSchemaVersion: 3 }))
      .toContain('$.resultSchemaVersion: numeric change');
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

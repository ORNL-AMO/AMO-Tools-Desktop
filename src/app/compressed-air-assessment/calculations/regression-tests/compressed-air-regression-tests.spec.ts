import corpusData from './fixtures/corpus.json';
import coverageData from './fixtures/coverage.json';
import baselineData from './fixtures/baselines/pre-pr409-suite-1.2.5.json';
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
    await runner.initialize();
  });

  it('matches the immutable pre-change baseline', () => {
    const args = new Set(__karma__?.config?.args ?? []);
    const scope = args.has('ca-scope-full') ? 'full' : 'core';
    const baselineArg = [...args].find(arg => arg.startsWith('ca-baseline='));
    const baselineName = baselineArg?.slice('ca-baseline='.length) ?? 'pre-pr409-suite-1.2.5';
    const actual = runner.run(corpusData as any, coverageData.coreFixtureIds, scope, baselineName);

    if (args.has('ca-capture')) {
      emitSnapshot(actual);
      expect(actual.fixtures.length).toBe(scope === 'full' ? 48 : 7);
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

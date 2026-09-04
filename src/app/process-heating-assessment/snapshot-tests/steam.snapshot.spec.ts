/**
 * Snapshot test: Steam (STUB — blocked on real fixture data)
 *
 * TODO(fixture-data): no Steam-pathway assessment fixture exists anywhere in the repo (legacy or
 * new). `PhastResultsService.getResults()` branches on `settings.energySourceType === 'Steam'`
 * (phast-results.service.ts:306,426) — a real, untested calculation path, not just UI routing.
 * Real assessment data for this configuration will be provided later; until then this suite stays
 * a skipped stub rather than silently reporting the gap as covered.
 *
 * Once fixture data lands:
 *   1. Add `fixtures/<name>.json` (an exported Assessment with `settings.energySourceType: 'Steam'`)
 *      and follow the pattern in e.g. fuel-example.snapshot.spec.ts to generate its `.snap.json`.
 *   2. Replace this stub's body with the real baseline + per-modification assertions.
 *   3. Update refactor-plan/snapshot-test-coverage.md's Steam row.
 */

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('Snapshot Test: Steam', () => {
  it('TODO(fixture-data): blocked on a Steam-pathway assessment fixture', () => {
    // Intentionally skipped — see file header.
  });
});

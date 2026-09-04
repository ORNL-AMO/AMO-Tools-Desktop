/**
 * Snapshot test: Custom Electrotechnology (STUB — blocked on real fixture data)
 *
 * TODO(fixture-data): no fixture uses `furnaceType: 'Custom Electrotechnology'` anywhere in the
 * repo (legacy or new). `PhastResultsService.getResults()` branches on this furnace type
 * (phast-results.service.ts:420,423) — a real, untested calculation path. Real assessment data for
 * this configuration will be provided later; until then this suite stays a skipped stub rather than
 * silently reporting the gap as covered.
 *
 * Once fixture data lands:
 *   1. Add `fixtures/<name>.json` (an exported Assessment with `settings.energySourceType:
 *      'Electricity'`, `settings.furnaceType: 'Custom Electrotechnology'`) and follow the pattern in
 *      e.g. fuel-example.snapshot.spec.ts to generate its `.snap.json`.
 *   2. Replace this stub's body with the real baseline + per-modification assertions.
 *   3. Update refactor-plan/snapshot-test-coverage.md to add this row (not in the original 22 —
 *      found during the step-4 golden-master analysis).
 */

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('Snapshot Test: Custom Electrotechnology', () => {
  it('TODO(fixture-data): blocked on a Custom Electrotechnology assessment fixture', () => {
    // Intentionally skipped — see file header.
  });
});

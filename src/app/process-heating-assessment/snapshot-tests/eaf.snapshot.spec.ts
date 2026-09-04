/**
 * Snapshot test: Electric Arc Furnace (EAF) (STUB — blocked on real fixture data)
 *
 * TODO(fixture-data): no fixture uses `furnaceType: 'Electric Arc Furnace (EAF)'` anywhere in the
 * repo (legacy or new). `PhastResultsService.getResults()` branches on this furnace type
 * (phast-results.service.ts:291,414) and it's the only pathway that exercises the EAF-only loss
 * types: Slag, Auxiliary Power, Energy Input EAF, Exhaust Gas EAF (see
 * refactor-plan/snapshot-test-coverage.md Group B). Real assessment data for this configuration will
 * be provided later; until then this suite stays a skipped stub rather than silently reporting the
 * gap as covered.
 *
 * Once fixture data lands:
 *   1. Add `fixtures/<name>.json` (an exported Assessment with `settings.energySourceType:
 *      'Electricity'`, `settings.furnaceType: 'Electric Arc Furnace (EAF)'`) and follow the pattern
 *      in e.g. fuel-example.snapshot.spec.ts to generate its `.snap.json`.
 *   2. Replace this stub's body with the real baseline + per-modification assertions.
 *   3. Update refactor-plan/snapshot-test-coverage.md's Group B rows (Slag, Auxiliary Power, Energy
 *      Input EAF, Exhaust Gas EAF).
 */

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('Snapshot Test: Electric Arc Furnace (EAF)', () => {
  it('TODO(fixture-data): blocked on an EAF-pathway assessment fixture', () => {
    // Intentionally skipped — see file header.
  });
});

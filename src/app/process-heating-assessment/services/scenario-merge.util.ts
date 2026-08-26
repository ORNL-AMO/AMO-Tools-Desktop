import { Losses, PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';

// Combines a modification's overrides with baseline to produce the PHAST object that modification
// should actually be evaluated against. Two levels only, both plain object spreads:
//   1. Any top-level PHAST field present in the diff (e.g. name, systemEfficiency) replaces
//      baseline's value entirely.
//   2. Inside `losses`, each loss-type array (chargeMaterials, wallLosses, ...) that's present in
//      the diff replaces baseline's array for that loss type entirely; any loss type the diff
//      doesn't mention falls through to baseline untouched.
// This is intentionally NOT a deep/recursive merge: every loss form service already rebuilds and
// writes its entire array whenever anything in it changes, so array-level replacement is the only
// granularity this needs. A loss-type diff applies whenever it's present, regardless of any
// Explore Opportunities flag on the modification: that flag is presentation state for one screen,
// not a precondition for whether a saved edit (from that screen or from Expert View) takes effect.
export function getEffectivePhast(baseline: PHAST, modification: ProcessHeatingModification | undefined): PHAST {
  const diff = modification?.scenarioOverrides;
  if (!diff) {
    // No overrides at all yet (a brand-new modification): the effective PHAST is just baseline.
    return baseline;
  }

  const effectiveLosses: Losses = diff.losses
    ? { ...baseline.losses, ...diff.losses }
    : baseline.losses;

  return {
    ...baseline,
    ...diff,
    losses: effectiveLosses,
  };
}

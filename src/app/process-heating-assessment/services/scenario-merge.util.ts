import { isEqual } from 'lodash';
import { Losses, PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';

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

// Structural inverse of getEffectivePhast(), at the same two-level granularity: top-level PHAST
// fields are compared wholesale, `losses` is compared one level deeper (per loss-type array, never
// per array item). Used to migrate `scenarioOverrides` for modifications written by legacy, whose
// edits live in a full `phast` clone rather than a diff.
export function computeScenarioOverrides(modificationPhast: PHAST | undefined, baseline: PHAST): ScenarioOverrides {
  if (!modificationPhast) {
    return {};
  }

  const overrides: ScenarioOverrides = {};
  for (const key of Object.keys(modificationPhast) as (keyof PHAST)[]) {
    if (key === 'losses' || key === 'modifications' || key === 'selectedModificationId') {
      continue;
    }
    if (!isEqual(modificationPhast[key], baseline[key])) {
      (overrides as Record<string, unknown>)[key] = modificationPhast[key];
    }
  }

  if (modificationPhast.losses) {
    const lossesOverride: Losses = {};
    for (const lossKey of Object.keys(modificationPhast.losses) as (keyof Losses)[]) {
      if (!isEqual(modificationPhast.losses[lossKey], baseline.losses?.[lossKey])) {
        (lossesOverride as Record<string, unknown>)[lossKey] = modificationPhast.losses[lossKey];
      }
    }
    if (Object.keys(lossesOverride).length > 0) {
      overrides.losses = lossesOverride;
    }
  }

  return overrides;
}

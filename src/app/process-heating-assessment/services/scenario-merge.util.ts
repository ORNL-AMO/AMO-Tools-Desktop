import { Losses, PHAST } from '../../shared/models/phast/phast';
import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { ProcessHeatingModification } from '../models/modification';


const GATED_LOSS_TYPES: { lossType: keyof Losses; opportunityFlag: keyof ProcessHeatingModification }[] = [
  { lossType: 'chargeMaterials', opportunityFlag: 'exploreOppsShowMaterial' },
];

function hasOpportunity(modification: ProcessHeatingModification, opportunityFlag: keyof ProcessHeatingModification): boolean {
  return (modification[opportunityFlag] as SavingsOpportunity | undefined)?.hasOpportunity ?? false;
}

// Combines a modification's overrides with baseline to produce the PHAST object that modification
// should actually be evaluated against. Two levels only, both plain object spreads:
//   1. Any top-level PHAST field present in the diff (e.g. name, systemEfficiency) replaces
//      baseline's value entirely.
//   2. Inside `losses`, each loss-type array (chargeMaterials, wallLosses, ...) that's present in
//      the diff replaces baseline's array for that loss type entirely; any loss type the diff
//      doesn't mention falls through to baseline untouched.
// This is intentionally NOT a deep/recursive merge — every loss form service already rebuilds and
// writes its entire array whenever anything in it changes, so array-level replacement is the only
// granularity this needs.
export function getEffectivePhast(baseline: PHAST, modification: ProcessHeatingModification | undefined): PHAST {
  const diff = modification?.scenarioOverrides;
  if (!diff) {
    // No overrides at all yet (a brand-new modification) — the effective PHAST is just baseline.
    return baseline;
  }

  let effectiveLosses: Losses = diff.losses
    ? { ...baseline.losses, ...diff.losses }
    : baseline.losses;

  for (const { lossType, opportunityFlag } of GATED_LOSS_TYPES) {
    if (diff.losses?.[lossType] && !hasOpportunity(modification, opportunityFlag)) {
      effectiveLosses = { ...effectiveLosses, [lossType]: baseline.losses?.[lossType] };
    }
  }

  return {
    ...baseline,
    ...diff,
    losses: effectiveLosses,
  };
}

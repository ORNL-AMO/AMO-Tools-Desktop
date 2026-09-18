import { cloneDeep, isEqual } from 'lodash';
import { getNewIdString } from '../../shared/helperFunctions';
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
// The live-baseline fallback below never fires for the 5 calc-relevant fields in practice, since
// every modification (fresh or migrated) always carries them via getBaselineSnapshot(); it
// stays as a safety net for non-calc fields and any future PHAST field.
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

/**
 * Deep-clones the 5 calc-relevant fields off `source` so a modification stops
 * live-tracking baseline for them once created. All 5 keys are always included, even
 * as `undefined`, so {@link getEffectivePhast}'s live-baseline fallback never fires
 * for them.
 */
export function getBaselineSnapshot(source: PHAST | undefined): Pick<ScenarioOverrides,
  'losses' | 'operatingCosts' | 'operatingHours' | 'systemEfficiency' | 'co2SavingsData'> {
  return {
    losses: cloneDeep(source?.losses),
    operatingCosts: cloneDeep(source?.operatingCosts),
    operatingHours: cloneDeep(source?.operatingHours),
    systemEfficiency: source?.systemEfficiency,
    co2SavingsData: cloneDeep(source?.co2SavingsData),
  };
}

// Structural inverse of getEffectivePhast(), at the same two-level granularity: top-level PHAST
// fields are compared wholesale, `losses` is compared one level deeper (per loss-type array, never
// per array item). Used to migrate `scenarioOverrides` for modifications written by legacy, whose
// edits live in a full `phast` clone rather than a diff. The 5 calc-relevant fields are captured
// unconditionally from `modificationPhast` rather than diffed against baseline: diffing would only
// freeze a legacy modification's untouched field if baseline had already drifted by migration time,
// otherwise it would silently start live-tracking baseline going forward.
export function deriveScenarioOverridesFromLegacyModification(modificationPhast: PHAST | undefined, baseline: PHAST): ScenarioOverrides {
  if (!modificationPhast) {
    return {};
  }

  const overrides: ScenarioOverrides = {};
  for (const key of Object.keys(modificationPhast) as (keyof PHAST)[]) {
    if (key === 'losses' || key === 'modifications' || key === 'selectedModificationId'
      || key === 'operatingCosts' || key === 'operatingHours' || key === 'systemEfficiency' || key === 'co2SavingsData') {
      continue;
    }
    if (!isEqual(modificationPhast[key], baseline[key])) {
      (overrides as Record<string, unknown>)[key] = modificationPhast[key];
    }
  }

  return { ...overrides, ...getBaselineSnapshot(modificationPhast) };
}

type WithId = { id?: string };

// wallLosses/extendedSurfaces have always shipped with an optional `id` (unlike chargeMaterials,
// which requires one), so assessments predating the per-item Explore Opportunities comparison can
// have entries with no id at all. Backfills one, preserving the array reference when every item
// already has one so idempotency checks elsewhere (`scenarioOverrides === existing`) still hold.
function ensureLossIds<T extends WithId>(items: T[] | undefined): T[] | undefined {
  if (!items || items.every(item => item.id)) {
    return items;
  }
  return items.map(item => (item.id ? item : { ...item, id: getNewIdString() }));
}

// A modification's wallLosses/extendedSurfaces override, when present, is a full-array replacement
// representing the same physical losses in the same order as baseline (see getEffectivePhast()) —
// true in particular for legacy migrations, which clone the array in place rather than reordering
// it. Backfilling ids here independently of baseline would break the by-id lookups every consumer
// (Explore Opportunities comparisons, per-item updates) relies on, so align by position instead.
function alignOverrideLossIds<T extends WithId>(baselineItems: T[] | undefined, overrideItems: T[] | undefined): T[] | undefined {
  if (!overrideItems || overrideItems.every(item => item.id)) {
    return overrideItems;
  }
  return overrideItems.map((item, index) => (item.id ? item : { ...item, id: baselineItems?.[index]?.id ?? getNewIdString() }));
}

// Backfills missing ids on baseline's wallLosses/extendedSurfaces, then aligns any modification
// override for those loss types onto the same ids by position. Must run after scenarioOverrides
// migration (deriveScenarioOverridesFromLegacyModification), not before: diffing a legacy modification's un-id'd clone
// against an already-backfilled baseline would flag `id` alone as a spurious override. Idempotent:
// returns the same `phast` reference when nothing needed backfilling.
export function ensureLossIdsForPhast(phast: PHAST): PHAST {
  const wallLosses = ensureLossIds(phast.losses?.wallLosses);
  const extendedSurfaces = ensureLossIds(phast.losses?.extendedSurfaces);
  const baselineChanged = wallLosses !== phast.losses?.wallLosses || extendedSurfaces !== phast.losses?.extendedSurfaces;

  const existingModifications = phast.modifications as ProcessHeatingModification[] | undefined;
  let modificationsChanged = false;
  const modifications = existingModifications?.map(modification => {
    const overrideLosses = modification.scenarioOverrides?.losses;
    const overrideWallLosses = alignOverrideLossIds(wallLosses, overrideLosses?.wallLosses);
    const overrideExtendedSurfaces = alignOverrideLossIds(extendedSurfaces, overrideLosses?.extendedSurfaces);
    if (overrideWallLosses === overrideLosses?.wallLosses && overrideExtendedSurfaces === overrideLosses?.extendedSurfaces) {
      return modification;
    }
    modificationsChanged = true;
    return {
      ...modification,
      scenarioOverrides: {
        ...modification.scenarioOverrides,
        losses: { ...overrideLosses, wallLosses: overrideWallLosses, extendedSurfaces: overrideExtendedSurfaces },
      },
    };
  });

  if (!baselineChanged && !modificationsChanged) {
    return phast;
  }

  return {
    ...phast,
    losses: baselineChanged ? { ...phast.losses, wallLosses, extendedSurfaces } : phast.losses,
    modifications: modificationsChanged ? modifications : phast.modifications,
  };
}

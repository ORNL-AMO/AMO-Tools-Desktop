import { cloneDeep, isEqual } from 'lodash';
import { getNewIdString } from '../../shared/helperFunctions';
import { LOSS_KEYS, Losses, PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';

// Combines a modification's overrides with baseline to produce the PHAST object that modification
// should actually be evaluated against. Two levels only, both plain object spreads:
//   1. Any top-level PHAST field present in the diff (e.g. name, systemEfficiency) replaces
//      baseline's value entirely.
//   2. Inside `losses`, each loss-type array (chargeMaterials, wallLosses, ...) comes from the diff
//      alone, replacing baseline's array for that loss type entirely.
// This is intentionally NOT a deep/recursive merge: every loss form service already rebuilds and
// writes its entire array whenever anything in it changes, so array-level replacement is the only
// granularity this needs. A loss-type diff applies whenever it's present, regardless of any
// Explore Opportunities flag on the modification: that flag is presentation state for one screen,
// not a precondition for whether a saved edit (from that screen or from Expert View) takes effect.
// Every modification (fresh or migrated) carries the calc-relevant fields via getBaselineSnapshot(),
// and once it has that snapshot (`losses` is present) those fields never fall back to baseline. The
// snapshot stores "none" as `undefined`, which JSON export, import and dashboard Copy drop; reading the
// snapshot alone keeps a dropped key meaning "none" instead of picking up baseline's live value.
// The live-baseline fallback stays for non-calc fields and any future PHAST field.
export function getEffectivePhast(baseline: PHAST, modification: ProcessHeatingModification | undefined): PHAST {
  const diff = modification?.scenarioOverrides;
  if (!diff) {
    // No overrides at all yet (a brand-new modification): the effective PHAST is just baseline.
    return baseline;
  }

  if (!diff.losses) {
    return { ...baseline, ...diff, auxiliaryEquipment: diff.auxiliaryEquipment ?? baseline.auxiliaryEquipment };
  }

  const effectiveLosses = {} as Losses;
  for (const key of LOSS_KEYS) {
    effectiveLosses[key] = diff.losses[key] as never;
  }

  return {
    ...baseline,
    ...diff,
    losses: effectiveLosses,
    operatingCosts: diff.operatingCosts,
    operatingHours: diff.operatingHours,
    systemEfficiency: diff.systemEfficiency,
    co2SavingsData: diff.co2SavingsData,
    // A modification created or migrated before baseline had equipment holds none of its own, so it starts
    // from baseline's items until it edits them; an emptied list ([]) stays empty.
    auxiliaryEquipment: diff.auxiliaryEquipment ?? baseline.auxiliaryEquipment,
  };
}

// Always returns an object, even when baseline has no losses yet: a present `losses` is what marks a
// modification as snapshotted in getEffectivePhast().
function fullLossSnapshot(losses: Losses | undefined): Losses {
  const snapshot = {} as Losses;
  for (const key of LOSS_KEYS) {
    snapshot[key] = cloneDeep(losses?.[key]) as never;
  }
  return snapshot;
}

/**
 * Deep-clones the calc-relevant fields off `source` so a modification stops
 * live-tracking baseline for them once created. A field `source` lacks stays "none"
 * for good, even after baseline adds it; see {@link getEffectivePhast}.
 */
export function getBaselineSnapshot(source: PHAST | undefined): Pick<ScenarioOverrides,
  'losses' | 'operatingCosts' | 'operatingHours' | 'systemEfficiency' | 'co2SavingsData' | 'auxiliaryEquipment'> {
  return {
    losses: fullLossSnapshot(source?.losses),
    operatingCosts: cloneDeep(source?.operatingCosts),
    operatingHours: cloneDeep(source?.operatingHours),
    systemEfficiency: source?.systemEfficiency,
    co2SavingsData: cloneDeep(source?.co2SavingsData),
    auxiliaryEquipment: cloneDeep(source?.auxiliaryEquipment),
  };
}

// Structural inverse of getEffectivePhast(), at the same two-level granularity: top-level PHAST
// fields are compared wholesale, `losses` is compared one level deeper (per loss-type array, never
// per array item). Used to migrate `scenarioOverrides` for modifications written by legacy, whose
// edits live in a full `phast` clone rather than a diff. The calc-relevant fields are captured
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
      || key === 'operatingCosts' || key === 'operatingHours' || key === 'systemEfficiency' || key === 'co2SavingsData'
      || key === 'auxiliaryEquipment') {
      continue;
    }
    if (!isEqual(modificationPhast[key], baseline[key])) {
      (overrides as Record<string, unknown>)[key] = modificationPhast[key];
    }
  }

  return { ...overrides, ...getBaselineSnapshot(modificationPhast) };
}

type WithId = { id?: string };

/** Loss types matched between baseline and modification by item id. */
const ID_MATCHED_LOSS_KEYS = ['chargeMaterials', 'wallLosses', 'extendedSurfaces', 'atmosphereLosses', 'fixtureLosses', 'coolingLosses', 'openingLosses', 'leakageLosses', 'flueGasLosses', 'auxiliaryPowerLosses', 'energyInputExhaustGasLoss', 'slagLosses', 'energyInputEAF', 'exhaustGasEAF', 'otherLosses'] as const satisfies readonly (keyof Losses)[];

// These loss types have always shipped with an optional `id`, so assessments predating the
// per-item Explore Opportunities comparison can have entries with no id at all. Backfills one,
// preserving the array reference when every item already has one so idempotency checks elsewhere
// (`scenarioOverrides === existing`) still hold.
function ensureLossIds<T extends WithId>(items: T[] | undefined): T[] | undefined {
  if (!items || items.every(item => item.id)) {
    return items;
  }
  return items.map(item => (item.id ? item : { ...item, id: getNewIdString() }));
}

// A modification's override for one of these loss types, when present, is a full-array replacement
// representing the same physical losses in the same order as baseline (see getEffectivePhast()) -
// true in particular for legacy migrations, which clone the array in place rather than reordering
// it. Backfilling ids here independently of baseline would break the by-id lookups every consumer
// (Explore Opportunities comparisons, per-item updates) relies on, so align by position instead.
function alignOverrideLossIds<T extends WithId>(baselineItems: T[] | undefined, overrideItems: T[] | undefined): T[] | undefined {
  if (!overrideItems || overrideItems.every(item => item.id)) {
    return overrideItems;
  }
  return overrideItems.map((item, index) => (item.id ? item : { ...item, id: baselineItems?.[index]?.id ?? getNewIdString() }));
}

// Before charge material ids were backfilled on load, each scenario gave its id-less materials fresh
// ids independently, so a material saved on both sides ended up under unrelated ids. Re-keying by
// position is safe only for charge materials: adding or removing them is locked once a modification
// exists, so both lists still hold the same materials in the same order. Other loss types can be
// added or removed per modification, where unrelated ids are a real difference.
function realignUnrelatedChargeMaterialIds<T extends WithId>(baselineItems: T[] | undefined, overrideItems: T[] | undefined): T[] | undefined {
  if (!baselineItems?.length || !overrideItems || overrideItems.length !== baselineItems.length) {
    return overrideItems;
  }
  const baselineIds = new Set(baselineItems.map(item => item.id));
  if (overrideItems.some(item => baselineIds.has(item.id))) {
    return overrideItems;
  }
  return overrideItems.map((item, index) => ({ ...item, id: baselineItems[index].id }));
}

// Backfills missing ids on baseline's id-matched loss types, then aligns any modification override
// for those loss types onto the same ids by position. Must run after scenarioOverrides migration
// (deriveScenarioOverridesFromLegacyModification), not before: diffing a legacy modification's un-id'd clone
// against an already-backfilled baseline would flag `id` alone as a spurious override. Idempotent:
// returns the same `phast` reference when nothing needed backfilling.
export function ensureLossIdsForPhast(phast: PHAST): PHAST {
  const baselineLosses: Losses = { ...phast.losses };
  let baselineChanged = false;
  for (const key of ID_MATCHED_LOSS_KEYS) {
    const backfilled = ensureLossIds<WithId>(phast.losses?.[key]);
    if (backfilled !== phast.losses?.[key]) {
      baselineLosses[key] = backfilled as never;
      baselineChanged = true;
    }
  }

  const existingModifications = phast.modifications as ProcessHeatingModification[] | undefined;
  let modificationsChanged = false;
  const modifications = existingModifications?.map(modification => {
    const overrideLosses = modification.scenarioOverrides?.losses;
    const alignedLosses: Losses = { ...overrideLosses };
    let overrideChanged = false;
    for (const key of ID_MATCHED_LOSS_KEYS) {
      let aligned = alignOverrideLossIds<WithId>(baselineLosses[key], overrideLosses?.[key]);
      if (key === 'chargeMaterials') {
        aligned = realignUnrelatedChargeMaterialIds<WithId>(baselineLosses[key], aligned);
      }
      if (aligned !== overrideLosses?.[key]) {
        alignedLosses[key] = aligned as never;
        overrideChanged = true;
      }
    }
    if (!overrideChanged) {
      return modification;
    }
    modificationsChanged = true;
    return {
      ...modification,
      scenarioOverrides: { ...modification.scenarioOverrides, losses: alignedLosses },
    };
  });

  if (!baselineChanged && !modificationsChanged) {
    return phast;
  }

  return {
    ...phast,
    losses: baselineChanged ? baselineLosses : phast.losses,
    modifications: modificationsChanged ? modifications : phast.modifications,
  };
}

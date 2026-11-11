import { Assessment } from '../../shared/models/assessment';
import { Modification as LegacyModification } from '../../shared/models/phast/phast';
import { ExploreOpportunityCategory, PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { getEffectivePhast } from './scenario-merge.util';
import { toLegacyPhast } from './legacy-phast.util';

const LEGACY_FLAG_KEYS: Record<ExploreOpportunityCategory, keyof LegacyModification> = {
  [ExploreOpportunityCategory.FlueGas]: 'exploreOppsShowFlueGas',
  [ExploreOpportunityCategory.AirTemp]: 'exploreOppsShowAirTemp',
  [ExploreOpportunityCategory.Material]: 'exploreOppsShowMaterial',
  [ExploreOpportunityCategory.AllTimeOpen]: 'exploreOppsShowAllTimeOpen',
  [ExploreOpportunityCategory.Opening]: 'exploreOppsShowOpening',
  [ExploreOpportunityCategory.AllEmissivity]: 'exploreOppsShowAllEmissivity',
  [ExploreOpportunityCategory.Cooling]: 'exploreOppsShowCooling',
  [ExploreOpportunityCategory.Atmosphere]: 'exploreOppsShowAtmosphere',
  [ExploreOpportunityCategory.Operations]: 'exploreOppsShowOperations',
  [ExploreOpportunityCategory.Leakage]: 'exploreOppsShowLeakage',
  [ExploreOpportunityCategory.Slag]: 'exploreOppsShowSlag',
  [ExploreOpportunityCategory.EfficiencyData]: 'exploreOppsShowEfficiencyData',
  [ExploreOpportunityCategory.Wall]: 'exploreOppsShowWall',
  [ExploreOpportunityCategory.AllTemp]: 'exploreOppsShowAllTemp',
  [ExploreOpportunityCategory.Fixtures]: 'exploreOppsShowFixtures',
};

/**
 * The shared JUSTIFI exporter reads each modification's full `phast` clone and legacy `exploreOppsShowX` fields;
 * this module stores `scenarioOverrides` and `exploreOpportunityFlags` instead.
 * @param assessment assessment saved by this module
 * @param setupDone whether the settings and baseline are complete; the exporter writes no results without it
 * @returns a copy whose modifications carry the legacy shape the exporter reads; the input is not mutated
 */
export function toLegacyJustifiAssessment(assessment: Assessment, setupDone: boolean): Assessment {
  const baseline = assessment.phast as unknown as PHAST;
  const modifications = (baseline.modifications ?? []) as ProcessHeatingModification[];
  const legacyModifications = modifications.map(modification => {
    const flags = modification.exploreOpportunityFlags ?? {};
    const legacyFlags: Partial<LegacyModification> = {};
    (Object.keys(flags) as ExploreOpportunityCategory[]).forEach(category => {
      legacyFlags[LEGACY_FLAG_KEYS[category] as string] = flags[category];
    });
    return {
      id: modification.id,
      notes: modification.notes,
      exploreOpportunities: Object.keys(flags).length > 0,
      ...legacyFlags,
      phast: toLegacyPhast(withoutAuxiliaryEquipment(getEffectivePhast(baseline, modification))),
    } as LegacyModification;
  });
  return { ...assessment, phast: { ...toLegacyPhast(withoutAuxiliaryEquipment(baseline)), setupDone, modifications: legacyModifications } };
}

/**
 * Auxiliary equipment is not exported: the edited items live in `auxiliaryEquipment`, so the legacy
 * `auxEquipment` may be stale.
 * @param phast scenario to export
 * @returns a copy without either auxiliary equipment field
 */
function withoutAuxiliaryEquipment(phast: PHAST): PHAST {
  const { auxEquipment, auxiliaryEquipment, ...rest } = phast;
  return rest;
}

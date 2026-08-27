import { ExploreOpportunityCategory, Modification, PHAST } from './phast';
import { SavingsOpportunity } from '../../shared/models/explore-opps';

// The set of fields a modification is allowed to override on baseline. Excludes `modifications`
// and `selectedModificationId`: a modification's own overrides never carry a nested modification list
// or baseline's selection state.
export type ScenarioOverrides = Partial<Omit<PHAST, 'modifications' | 'selectedModificationId'>>;

// `Modification` (id, notes, the exploreOpportunityFlags curation state) has no full-clone field of
// its own to extend around: `scenarioOverrides` is the only place a modification's data lives,
// storing just the fields it overrides, not a clone of the assessment.
export interface ProcessHeatingModification extends Modification {
  scenarioOverrides?: ScenarioOverrides;
}

export function getModificationName(modification: ProcessHeatingModification): string {
  return modification.scenarioOverrides?.name ?? '';
}

// The shape a modification has when it was last written by legacy: a full-clone `phast`, no
// `scenarioOverrides` yet, and its explore-opportunities curation state as legacy's own flat fields
// (shared/models/phast/phast.ts) rather than this module's `exploreOpportunityFlags` map. Exists
// only to name the resolver's unchecked cast boundary (process-heating-assessment.resolver.ts) —
// not a type any other code should construct or hold onto.
export interface LegacyModification extends ProcessHeatingModification {
  phast?: PHAST;
  exploreOpportunities?: boolean;
  exploreOppsShowFlueGas?: SavingsOpportunity;
  exploreOppsShowAirTemp?: SavingsOpportunity;
  exploreOppsShowMaterial?: SavingsOpportunity;
  exploreOppsShowAllTimeOpen?: SavingsOpportunity;
  exploreOppsShowOpening?: SavingsOpportunity;
  exploreOppsShowAllEmissivity?: SavingsOpportunity;
  exploreOppsShowCooling?: SavingsOpportunity;
  exploreOppsShowAtmosphere?: SavingsOpportunity;
  exploreOppsShowOperations?: SavingsOpportunity;
  exploreOppsShowLeakage?: SavingsOpportunity;
  exploreOppsShowSlag?: SavingsOpportunity;
  exploreOppsShowEfficiencyData?: SavingsOpportunity;
  exploreOppsShowWall?: SavingsOpportunity;
  exploreOppsShowAllTemp?: SavingsOpportunity;
  exploreOppsShowFixtures?: SavingsOpportunity;
}

// Translates legacy's 15 flat `exploreOppsShowX` fields into this module's per-category map.
// Read-only against `modification`: legacy's fields are left in place, never deleted, so a migrated
// record stays fully readable by legacy's own Explore Opportunities screen. The top-level legacy
// `exploreOpportunities: boolean` has no per-category meaning and is intentionally not part of this
// mapping.
export function computeMigratedExploreOpportunityFlags(
  modification: LegacyModification
): Partial<Record<ExploreOpportunityCategory, SavingsOpportunity>> {
  const flags: Partial<Record<ExploreOpportunityCategory, SavingsOpportunity>> = {};
  const setIfPresent = (category: ExploreOpportunityCategory, value: SavingsOpportunity | undefined): void => {
    if (value) {
      flags[category] = value;
    }
  };

  setIfPresent(ExploreOpportunityCategory.FlueGas, modification.exploreOppsShowFlueGas);
  setIfPresent(ExploreOpportunityCategory.AirTemp, modification.exploreOppsShowAirTemp);
  setIfPresent(ExploreOpportunityCategory.Material, modification.exploreOppsShowMaterial);
  setIfPresent(ExploreOpportunityCategory.AllTimeOpen, modification.exploreOppsShowAllTimeOpen);
  setIfPresent(ExploreOpportunityCategory.Opening, modification.exploreOppsShowOpening);
  setIfPresent(ExploreOpportunityCategory.AllEmissivity, modification.exploreOppsShowAllEmissivity);
  setIfPresent(ExploreOpportunityCategory.Cooling, modification.exploreOppsShowCooling);
  setIfPresent(ExploreOpportunityCategory.Atmosphere, modification.exploreOppsShowAtmosphere);
  setIfPresent(ExploreOpportunityCategory.Operations, modification.exploreOppsShowOperations);
  setIfPresent(ExploreOpportunityCategory.Leakage, modification.exploreOppsShowLeakage);
  setIfPresent(ExploreOpportunityCategory.Slag, modification.exploreOppsShowSlag);
  setIfPresent(ExploreOpportunityCategory.EfficiencyData, modification.exploreOppsShowEfficiencyData);
  setIfPresent(ExploreOpportunityCategory.Wall, modification.exploreOppsShowWall);
  setIfPresent(ExploreOpportunityCategory.AllTemp, modification.exploreOppsShowAllTemp);
  setIfPresent(ExploreOpportunityCategory.Fixtures, modification.exploreOppsShowFixtures);

  return flags;
}

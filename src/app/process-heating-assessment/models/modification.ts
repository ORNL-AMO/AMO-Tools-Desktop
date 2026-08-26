import { Modification, PHAST } from './phast';

// The set of fields a modification is allowed to override on baseline. Excludes `modifications`
// and `selectedModificationId`: a modification's own overrides never carry a nested modification list
// or baseline's selection state.
export type ScenarioOverrides = Partial<Omit<PHAST, 'modifications' | 'selectedModificationId'>>;

// `Modification` (id, notes, the exploreOpportunities curation flags) has no full-clone field of
// its own to extend around: `scenarioOverrides` is the only place a modification's data lives,
// storing just the fields it overrides, not a clone of the assessment.
export interface ProcessHeatingModification extends Modification {
  scenarioOverrides?: ScenarioOverrides;
}

export function getModificationName(modification: ProcessHeatingModification): string {
  return modification.scenarioOverrides?.name ?? '';
}

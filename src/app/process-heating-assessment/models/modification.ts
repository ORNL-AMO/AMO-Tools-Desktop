import { Modification, PHAST } from '../../shared/models/phast/phast';

// The set of fields a modification is allowed to override on baseline. Excludes `modifications`
// and `selectedModificationId`: a modification's own overrides never carry a nested modification list
// or baseline's selection state.
export type ScenarioOverrides = Partial<Omit<PHAST, 'modifications' | 'selectedModificationId'>>;

// Extends the legacy `Modification` interface only for its non-`phast` fields (id, notes, the
// exploreOppsShowX curation flags). `scenarioOverrides` replaces `phast`: a modification stores only the
// fields it overrides, not a full clone of the assessment.
export interface ProcessHeatingModification extends Modification {
  scenarioOverrides?: ScenarioOverrides;
}

export function getModificationName(modification: ProcessHeatingModification): string {
  return modification.scenarioOverrides?.name ?? '';
}

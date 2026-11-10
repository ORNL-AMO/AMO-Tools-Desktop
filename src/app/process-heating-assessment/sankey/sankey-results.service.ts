import { computed, inject, Injectable, Signal } from '@angular/core';
import { PhastValidService } from '../../phast/phast-valid.service';
import { PHAST as SharedPHAST, PhastValid as SharedPhastValid } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { getModificationName } from '../models/modification';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { toLegacyPhast } from '../services/legacy-phast.util';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';

export interface SankeyScenario {
  id: string;
  name: string;
  /** Legacy-shaped scenario copy, since the shared sankey component reads and annotates its input */
  phast: SharedPHAST;
}

/** Builds the sankey input for the baseline and every modification. */
@Injectable()
export class SankeyResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly scenarios: Signal<SankeyScenario[]> = computed(() =>
    [
      { id: 'baseline', name: 'Baseline' },
      ...this.modificationService.modifications().map(modification => ({ id: modification.id, name: getModificationName(modification) })),
    ].map(({ id, name }) => ({
      id,
      name,
      phast: toLegacyPhast(this.assessmentService.scenarioPhastSignal(id)),
    }))
  );
}

/**
 * The shared sankey checks its input's validity itself, so it gets this module's cached scenario validity in place of legacy's.
 * Its input is the scenario's own `phast` copy, which identifies the scenario.
 */
export function providePhastValidService(): Pick<PhastValidService, 'checkValid'> {
  const validityService = inject(ProcessHeatingValidityService);
  const sankeyResultsService = inject(SankeyResultsService);
  return {
    checkValid: (phast: SharedPHAST): SharedPhastValid => {
      const scenario = sankeyResultsService.scenarios().find(entry => entry.phast === phast);
      return validityService.scenarioValidity(scenario.id);
    },
  };
}

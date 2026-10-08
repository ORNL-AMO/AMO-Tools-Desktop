import { computed, inject, Injectable, Signal } from '@angular/core';
import { PHAST as SharedPHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { getModificationName } from '../../models/modification';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ExecutiveSummaryResultsService } from '../executive-summary/executive-summary-results.service';

export interface ReportSankeyScenario {
  id: string;
  name: string;
  /** Legacy-shaped scenario copy, since the shared sankey component reads and annotates its input */
  phast: SharedPHAST;
  costSavings: number;
  energySavings: number;
}

export interface ReportSankeyUI {
  settings: Settings;
  scenarios: ReportSankeyScenario[];
  energySavingsUnit: string;
}

/** Builds the per-scenario sankey inputs and savings for the Sankey tab and its export. */
@Injectable()
export class ReportSankeyResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly executiveSummaryService = inject(ExecutiveSummaryResultsService);

  readonly reportSankeyUI: Signal<ReportSankeyUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const savings = this.executiveSummaryService.scenarioSavings();
    if (!savings.baseline) {
      return undefined;
    }

    const scenarioIds = [
      { id: 'baseline', name: 'Baseline' },
      ...this.modificationService.modifications().map(modification => ({ id: modification.id, name: getModificationName(modification) })),
    ];
    const scenarios = scenarioIds
      .filter(({ id }) => savings[id])
      .map(({ id, name }) => ({
        id,
        name,
        phast: { ...this.assessmentService.scenarioPhastSignal(id) } as unknown as SharedPHAST,
        ...savings[id],
      }));
    return { settings, scenarios, energySavingsUnit: `${settings.energyResultUnit}/yr` };
  });
}

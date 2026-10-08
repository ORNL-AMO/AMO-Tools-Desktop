import { computed, inject, Injectable, Signal } from '@angular/core';
import { PhastChartsService } from '../../../phast/phast-report/phast-charts.service';
import { getModificationName } from '../../models/modification';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

export interface ReportGraphsScenario {
  id: string;
  name: string;
  lossValuesAndLabels: Array<{ value: number; label: string }>;
  deliverValuesAndLabels: Array<{ value: number; label: string }>;
}

export interface ReportGraphsUI {
  scenarios: ReportGraphsScenario[];
  lossUnit: string;
  deliverUnit: string;
  barChartYAxisLabel: string;
}

/**
 * Builds the loss distribution and heat delivered chart data for baseline and every modification
 * from live scenario results, for the Report Graphs tab and its export.
 */
@Injectable()
export class ReportGraphsResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly phastChartsService = inject(PhastChartsService);

  readonly reportGraphsUI: Signal<ReportGraphsUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const categories = this.resultsService.getResultCategories(settings);
    const scenarioIds = [
      { id: 'baseline', name: 'Baseline' },
      ...this.modificationService.modifications().map(modification => ({ id: modification.id, name: getModificationName(modification) })),
    ];

    const scenarios = scenarioIds.flatMap(({ id, name }) => {
      const results = this.resultsService.scenarioResults(id);
      if (!results) {
        return [];
      }
      return [{
        id,
        name,
        lossValuesAndLabels: this.phastChartsService.getLossValuesAndLabels(results, categories),
        deliverValuesAndLabels: this.phastChartsService.getDeliverValuesAndLabels(results),
      }];
    });
    if (scenarios[0]?.id !== 'baseline') {
      return undefined;
    }

    const lossUnit = settings.unitsOfMeasure === 'Metric' ? 'GJ/hr' : 'MMBtu/hr';
    return { scenarios, lossUnit, deliverUnit: 'kW', barChartYAxisLabel: `Heat Loss (${lossUnit})` };
  });
}

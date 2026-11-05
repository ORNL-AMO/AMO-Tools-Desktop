import { computed, inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SankeyResultsService, SankeyScenario } from '../../sankey/sankey-results.service';
import { ExecutiveSummaryResultsService } from '../executive-summary/executive-summary-results.service';

export interface ReportSankeyScenario extends SankeyScenario {
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
  private readonly sankeyResultsService = inject(SankeyResultsService);
  private readonly executiveSummaryService = inject(ExecutiveSummaryResultsService);

  readonly reportSankeyUI: Signal<ReportSankeyUI | undefined> = computed(() => {
    const settings = this.sankeyResultsService.settings();
    const savings = this.executiveSummaryService.scenarioSavings();
    if (!savings.baseline) {
      return undefined;
    }

    const scenarios = this.sankeyResultsService.scenarios()
      .filter(({ id }) => savings[id])
      .map(scenario => ({ ...scenario, ...savings[scenario.id] }));
    return { settings, scenarios, energySavingsUnit: `${settings.energyResultUnit}/yr` };
  });
}

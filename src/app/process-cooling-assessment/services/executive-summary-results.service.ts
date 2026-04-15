import { inject, Injectable } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { ExecutiveSummaryResults, ModificationEEMSUsed, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ModificationService } from './modification.service';
import { ModificationNameCell, PercentSavings, ReportTableRow } from '../report/report-ui-models';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';

@Injectable()
export class ExecutiveSummaryResultsService {
  private readonly resultsService = inject(ProcessCoolingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  settingsSignal = this.processCoolingAssessmentService.settingsSignal;

  readonly executiveSummaryUI$ = combineLatest([
    this.resultsService.baselineResults$,
    this.resultsService.modificationResults$
  ]).pipe(
    map(([baselineResults, modificationResults]) => {
      return this.buildExecutiveSummaryUI(baselineResults, modificationResults);
    })
  );

  readonly executiveSummaryBaseline$ = this.resultsService.baselineResults$.pipe(
    map((baselineResults) => {
      return this.buildExecutiveSummaryUI(baselineResults, []);
    })
  );

  readonly executiveSummarySelectedModificationUI$ = combineLatest([
    this.resultsService.baselineResults$,
    this.resultsService.modificationResults$,
    this.modificationService.selectedModificationId$,
  ]).pipe(
    map(([baselineResults, modificationResults, selectedModificationId]) => {
      const selectedModificationResults: ProcessCoolingResults[] = modificationResults?.filter(modification => modification.id === selectedModificationId);
      return this.buildExecutiveSummaryUI(baselineResults, selectedModificationResults);
    })
  );

  buildExecutiveSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): ExecutiveSummaryUI {
    const executiveSummaryUI: ExecutiveSummaryUI = {
        modificationNames: [],
        resultRows: [],
        modificationPercentSavings: [],
        modificationEEMsUsed: [],
      }
      const baselineSummary: ExecutiveSummaryResults = baselineResults ? this.getExecutiveSummaryResults(baselineResults) : null;
      let modificationSummaries: ExecutiveSummaryResults[] = [];
      if (modificationResults) {
          modificationSummaries = modificationResults.map(result => {
            const summary = this.getExecutiveSummaryResults(result, baselineSummary);
            executiveSummaryUI.modificationPercentSavings.push({
              id: result.id,
              value: summary.percentEnergySavings ?? null,
            });
            return summary;
          });
          executiveSummaryUI.modificationNames = this.resultsService.getResultModificationNames(modificationResults);
          let modificationEEMsUsed = this.modificationService.modificationEEMsUsedSignal();
          executiveSummaryUI.modificationEEMsUsed = modificationEEMsUsed.filter(modification => modificationResults.some(result => result.id === modification.modificationId));
      }
      executiveSummaryUI.resultRows = this.mapToExecutiveSummaryRows(baselineSummary, modificationSummaries);
      return executiveSummaryUI;
    }

    /**
   * Get totals, savings, high level results for pumps, tower, chillers
   * @param suiteResults 
   * @returns executive summary results for baseline or modification. If baselineSummary is provided, will also calculate savings compared to baseline.
   */
  private getExecutiveSummaryResults(processCoolingResults: ProcessCoolingResults, baselineSummary?: ExecutiveSummaryResults): ExecutiveSummaryResults {
    const totalChillerEnergy = processCoolingResults.chiller?.reduce((allChillerEnergy, chiller) => {
      return allChillerEnergy + (chiller.energy?.reduce((sum, energy) => sum + energy, 0));
    }, 0);

    const totalTowerEnergy = processCoolingResults.tower?.energy?.reduce((sum, energy) => sum + energy, 0);
    const pumpTotalCondenserEnergy = processCoolingResults.pump?.condenserPumpingEnergy?.reduce((sum, energy) => sum + energy.value, 0); 
    const pumpTotalChilledEnergy = processCoolingResults.pump?.chillerPumpingEnergy?.reduce((sum, energy) => sum + energy.value, 0);
    const totalPumpEnergy = pumpTotalCondenserEnergy + pumpTotalChilledEnergy;
    
    let totalEnergy = totalChillerEnergy + totalTowerEnergy + totalPumpEnergy;
    totalEnergy = totalEnergy || null;
    const totalCost = totalEnergy ? totalEnergy * (processCoolingResults.electricityCost) : null;

    let summary: ExecutiveSummaryResults = {
      pumpTotalChilledEnergy,
      pumpTotalCondenserEnergy,
      totalChillerEnergy,
      totalTowerEnergy,
      totalPumpEnergy,
      totalEnergy,
      totalCost,
    };

    if (baselineSummary) {
      // * modification summary includes savings compared to baseline
      const energySavings = totalEnergy ? baselineSummary.totalEnergy - totalEnergy : null;
      const costSavings = totalCost ? baselineSummary.totalCost - totalCost : null;
      const percentEnergySavings = energySavings ? (energySavings / baselineSummary.totalEnergy) * 100 : null;
      const percentCostSavings = costSavings ? (costSavings / baselineSummary.totalCost) * 100 : null;

      summary = {
        ...summary,
        energySavings,  
        percentEnergySavings,
        costSavings,
        percentCostSavings,
      };
    }

    return summary;
  }


  private mapToExecutiveSummaryRows(
    baseline: ExecutiveSummaryResults | null,
    modifications: ExecutiveSummaryResults[] | null
  ): ReportTableRow[] {      
    const defaultpipeFormat = '1.0-0';
    const defaultclassName: 'default' | 'emphasis' = 'default';
    const defaultEnergyUnit = this.settingsSignal().unitsOfMeasure? PROCESS_COOLING_UNITS.energy.labelHTML.imperial : PROCESS_COOLING_UNITS.energy.labelHTML.metric;
    
    const defaultRow: ReportTableRow = {
      label: 'Result',
      units: `(${defaultEnergyUnit})`,
      className: defaultclassName,
      baseline: { value: undefined, decimalPipe: defaultpipeFormat },
      modifications: []
    }

    return [
      {
        ...defaultRow,
        label: 'Chilled Water Pumping Energy',
        baseline: { 
          value: baseline?.pumpTotalChilledEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalChilledEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Condenser Water Pumping Energy',
        baseline: { value: baseline?.pumpTotalCondenserEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalCondenserEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Chiller Energy',
        baseline: { value: baseline?.totalChillerEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalChillerEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Tower Energy',
        baseline: { value: baseline?.totalTowerEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalTowerEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Pump Energy',
        baseline: { value: baseline?.totalPumpEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalPumpEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Total Energy',
        baseline: { value: baseline?.totalEnergy ?? null, decimalPipe: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalEnergy ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Energy Savings',
        baseline: { value: null },
        modifications: modifications.map(modification => {
          return { value: modification.energySavings ?? null, decimalPipe: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Total Cost',
        units: `($)`,
        baseline: { value: baseline?.totalCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } },
        modifications: modifications.map(modification => {
          return { value: modification.totalCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Cost Savings',
        units: `($)`,
        baseline: { value: null },
        modifications: modifications.map(modification => {
          return { value: modification.costSavings ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } };
        }),
      },
    ];
  }

}

export type SummaryView = 'baseline-panel' | 'modification-panel' | 'report';


export interface ExecutiveSummaryUI {
  modificationNames: ModificationNameCell[];
  resultRows: ReportTableRow[];
  modificationPercentSavings: PercentSavings[];
  modificationEEMsUsed: ModificationEEMSUsed[];
}

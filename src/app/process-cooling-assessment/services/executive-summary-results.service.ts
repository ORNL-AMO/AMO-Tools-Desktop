import { inject, Injectable } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { ExecutiveSummaryResults, ModificationEEMSUsed, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ModificationService } from './modification.service';

@Injectable({ providedIn: 'root' })
export class ExecutiveSummaryResultsService {
  private readonly resultsService = inject(ProcessCoolingResultsService);
  private readonly modificationService = inject(ModificationService);

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
          modificationEEMsUsed = modificationEEMsUsed.filter(modification => modificationResults.some(result => result.id === modification.modificationId));
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
    const pumpTotalCondenserEnergy = processCoolingResults.pump?.condenserPumpingEnergy?.reduce((sum, energy) => sum + energy, 0); 
    const pumpTotalChilledEnergy = processCoolingResults.pump?.chillerPumpingEnergy?.reduce((sum, energy) => sum + energy, 0);
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
  ): ExecutiveSummaryRow[] {      
    const defaultpipeFormat = '1.0-0';
    const defaultclassName: 'default' | 'emphasis' = 'default';
    const defaultEnergyUnit = PROCESS_COOLING_UNITS.energy.labelHTML.imperial; 
    
    const defaultRow: ExecutiveSummaryRow = {
      label: 'Result',
      units: `(${defaultEnergyUnit})`,
      className: defaultclassName,
      baseline: { value: undefined, pipeFormat: defaultpipeFormat },
      modifications: []
    }

    return [
      {
        ...defaultRow,
        label: 'Pump Total Chilled Energy',
        baseline: { value: baseline?.pumpTotalChilledEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalChilledEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Pump Total Condenser Energy',
        baseline: { value: baseline?.pumpTotalCondenserEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalCondenserEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Chiller Energy',
        baseline: { value: baseline?.totalChillerEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalChillerEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Tower Energy',
        baseline: { value: baseline?.totalTowerEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalTowerEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Pump Energy',
        baseline: { value: baseline?.totalPumpEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalPumpEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Total Energy',
        baseline: { value: baseline?.totalEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Energy Savings',
        baseline: { value: null },
        modifications: modifications.map(modification => {
          return { value: modification.energySavings ?? null, pipeFormat: defaultpipeFormat };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Total Cost',
        units: `($/${PROCESS_COOLING_UNITS.energy.labelHTML.imperial})`,
        baseline: { value: baseline?.totalCost ?? null, pipeFormat: 'currency' },
        modifications: modifications.map(modification => {
          return { value: modification.totalCost ?? null, pipeFormat: 'currency' };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Cost Savings',
        baseline: { value: null },
        modifications: modifications.map(modification => {
          return { value: modification.costSavings ?? null, pipeFormat: 'currency' };
        }),
      },
    ];
  }

}

export type SummaryView = 'baseline-panel' | 'modification-panel' | 'report';


export interface ExecutiveSummaryUI {
  modificationNames: ModificationNameCell[];
  resultRows: ExecutiveSummaryRow[];
  modificationPercentSavings: PercentSavings[];
  modificationEEMsUsed: ModificationEEMSUsed[];
}

export interface ExecutiveSummaryRow {
  label: string;
  units?: string;
  className?: 'default' | 'emphasis';
  baseline: ReportColumnCell;
  modifications: Array<ReportColumnCell>;
}

export interface PercentSavings { 
  id: string;
  value: number | null;
}

export interface ModificationNameCell {
  id: string;
  name: string;
}

export interface ReportColumnCell {
  value: string | number;
  // * e.g. '1.0-0', '1.0-2', etc.
  pipeFormat?: string; 
}


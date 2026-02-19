import { inject, Injectable } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { ExecutiveSummaryResults, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';

@Injectable({ providedIn: 'root' })
export class ExecutiveSummaryResultsService {
  private readonly resultsService = inject(ProcessCoolingResultsService);

  readonly executiveSummaryRows$ = combineLatest([
    this.resultsService.baselineResults$,
    this.resultsService.modificationResults$
  ]).pipe(
    map(([baselineResults, modificationResults]) => {
      const baselineSummary = baselineResults ? this.mapAssessmentResultsToExecutiveSummary(baselineResults) : null;
      let mappedModificationSummaries: ExecutiveSummaryResults[] = [];
      if (modificationResults) {
          mappedModificationSummaries = modificationResults.map(result => {
            return this.mapAssessmentResultsToExecutiveSummary(result);
          });
      }
      return this.mapToExecutiveSummaryRows(baselineSummary, mappedModificationSummaries);
    })
  );

  // * optimization: combine with modificationEEMsUsedSignal for modificationMeta as one
  readonly modificationNames$ = this.resultsService.modificationResults$.pipe(
    map((modificationResults) => {
      if (!modificationResults) return [];
      return modificationResults.map((result, idx) => result?.name ?? `Modification ${idx + 1}`);
    })
  );


  private mapToExecutiveSummaryRows(
    baseline: ExecutiveSummaryResults | null,
    modifications: ExecutiveSummaryResults[] | null
  ): ExecutiveSummaryRow[] {      
    const defaultNumberPipeFormat = '1.0-0';
    const defaultRowType = 'normal';
    const defaultEnergyUnit = PROCESS_COOLING_UNITS.energy.labelHTML.imperial; 
    
    const defaultRow: ExecutiveSummaryRow = {
      label: 'Result',
      units: defaultEnergyUnit,
      rowType: defaultRowType,
      baseline: undefined,
      modifications: []
    }

    return [
      {
        ...defaultRow,
        label: 'Pump Total Chilled Energy',
        baseline: { value: baseline?.pumpTotalChilledEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalChilledEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Pump Total Condenser Energy',
        baseline: { value: baseline?.pumpTotalCondenserEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.pumpTotalCondenserEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Chiller Energy',
        baseline: { value: baseline?.totalChillerEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalChillerEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Tower Energy',
        baseline: { value: baseline?.totalTowerEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalTowerEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Pump Energy',
        baseline: { value: baseline?.totalPumpEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalPumpEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
      {
        ...defaultRow,
        label: 'Total Energy',
        baseline: { value: baseline?.totalEnergy ?? null, numberPipe: defaultNumberPipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalEnergy ?? null, numberPipe: defaultNumberPipeFormat };
        }),
      },
    ];
  }
  
  /**
   * TODO these are prototyped placeholder calculations
   * @param suiteResults 
   * @returns 
   */
  private mapAssessmentResultsToExecutiveSummary(suiteResults: ProcessCoolingResults): ExecutiveSummaryResults {
    // todo prototyped results - break these to separate functions as needed and add additional calculations as needed
    const towerTotalHours = suiteResults.tower?.hours?.reduce((sum, h) => sum + (h || 0), 0) || 0;
    const pumpTotalChilledEnergy = suiteResults.pump?.chillerPumpingEnergy?.reduce((sum, e) => sum + (e || 0), 0) || 0;
    const pumpTotalCondenserEnergy = suiteResults.pump?.condenserPumpingEnergy?.reduce((sum, e) => sum + (e || 0), 0) || 0;
    const totalChillerEnergy = suiteResults.chiller?.reduce((sum, c) => sum + (c.energy?.reduce((eSum, e) => eSum + (e || 0), 0) || 0), 0) || 0;
    const totalTowerEnergy = suiteResults.tower?.energy?.reduce((sum, e) => sum + (e || 0), 0) || 0;
    const totalPumpEnergy = (suiteResults.pump?.chillerPumpingEnergy?.reduce((sum, e) => sum + (e || 0), 0) || 0) + (suiteResults.pump?.condenserPumpingEnergy?.reduce((sum, e) => sum + (e || 0), 0) || 0);
    const totalEnergy = totalChillerEnergy + totalTowerEnergy + totalPumpEnergy;
    const totalCost = 0; // todo - add cost to results and calculate here
    const eemOpportunities = [];

    return {
      towerTotalHours,
      pumpTotalChilledEnergy,
      pumpTotalCondenserEnergy,
      totalChillerEnergy,
      totalTowerEnergy,
      totalPumpEnergy,
      totalEnergy,
      totalCost,
      eemOpportunities
    };
  }
}


export interface ExecutiveSummaryRow {
  label: string;
  units?: string;
  rowType?: 'normal' | 'bold' | 'bold-bg' | 'bold-row-stripe' | 'hide-print';
  baseline: ReportColumnCell;
  modifications: Array<ReportColumnCell>;
}

export interface ReportColumnCell {
  value: string | number;
  // * e.g. '1.0-0', '1.0-2', etc.
  numberPipe?: string; 
}


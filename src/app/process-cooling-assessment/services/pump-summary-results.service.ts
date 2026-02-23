import { inject, Injectable } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { PumpResults, ProcessCoolingResults, PumpChillerItemEnergy } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ModificationNameCell, ReportTableRow } from '../report/report-ui-models';

@Injectable({ providedIn: 'root' })
export class PumpSummaryResultsService {
  private readonly resultsService = inject(ProcessCoolingResultsService);

  readonly pumpSummaryUI$ = combineLatest([
    this.resultsService.baselineResults$,
    this.resultsService.modificationResults$
  ]).pipe(
    map(([baselineResults, modificationResults]) => {
      return this.buildPumpSummaryUI(baselineResults, modificationResults);
    })
  );


  buildPumpSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): PumpSummaryUI {
    const pumpSummaryUI: PumpSummaryUI = {
      modificationNames: [],
      chillerPumpingEnergy: [],
      condenserPumpingEnergy: [],
      summaryRows: [],
    };
    const baselineSummary: PumpResults = baselineResults ? this.getPumpSummaryResults(baselineResults) : null;
    let modificationSummaries: PumpResults[] = [];
    if (modificationResults) {
      modificationSummaries = modificationResults.map(result => {
        const summary = this.getPumpSummaryResults(result, baselineSummary);
        return summary;
      });
      pumpSummaryUI.modificationNames = this.resultsService.getResultModificationNames(modificationResults);
    }
    const { chillerPumpingEnergy, condenserPumpingEnergy, summaryRows } = this.mapToPumpSummaryRows(baselineSummary, modificationSummaries);
    pumpSummaryUI.chillerPumpingEnergy = chillerPumpingEnergy;
    pumpSummaryUI.condenserPumpingEnergy = condenserPumpingEnergy;
    pumpSummaryUI.summaryRows = summaryRows;
    return pumpSummaryUI;
  }

  private getPumpSummaryResults(processCoolingResults: ProcessCoolingResults, baselineSummary?: PumpResults): PumpResults {
    const chillerPumpingEnergy = processCoolingResults.pump?.chillerPumpingEnergy ?? [];
    const condenserPumpingEnergy = processCoolingResults.pump?.condenserPumpingEnergy ?? [];
    const totalChillerPumpingEnergy = chillerPumpingEnergy.reduce((sum, energy) => sum + energy.value, 0);
    const totalCondenserPumpingEnergy = condenserPumpingEnergy.reduce((sum, energy) => sum + energy.value, 0);
    const totalPumpEnergy = totalChillerPumpingEnergy + totalCondenserPumpingEnergy;
    const electricityCost = processCoolingResults.electricityCost;
    const totalPumpCost = totalPumpEnergy * electricityCost;

    let summary: PumpResults = {
      id: processCoolingResults.id,
      name: processCoolingResults.name,
      chillerPumpingEnergy,
      condenserPumpingEnergy,
      totalChillerPumpingEnergy,
      totalCondenserPumpingEnergy,
      totalPumpEnergy,
      electricityCost,
      totalPumpCost,
    };

    if (baselineSummary) {
      const energySavings = totalPumpEnergy ? baselineSummary.totalPumpEnergy - totalPumpEnergy : null;
      const costSavings = totalPumpCost ? baselineSummary.totalPumpCost - totalPumpCost : null;
      const percentEnergySavings = energySavings ? (energySavings / baselineSummary.totalPumpEnergy) * 100 : null;
      const percentCostSavings = costSavings ? (costSavings / baselineSummary.totalPumpCost) * 100 : null;
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

  private mapToPumpSummaryRows(
    baseline: PumpResults | null,
    modifications: PumpResults[] | null
  ): Partial<PumpSummaryUI> {
    const defaultpipeFormat = '1.0-0';
    const defaultclassName: 'default' | 'emphasis' = 'default';
    const defaultEnergyUnit = PROCESS_COOLING_UNITS.energy.labelHTML.imperial;

    const defaultRow: ReportTableRow = {
      label: 'Result',
      units: `(${defaultEnergyUnit})`,
      className: defaultclassName,
      baseline: { value: undefined, pipeFormat: defaultpipeFormat },
      modifications: []
    };

    const chillerRows: ReportTableRow[] = [];
    if (baseline?.chillerPumpingEnergy) {
      baseline.chillerPumpingEnergy.forEach((pumpEnergyItem: PumpChillerItemEnergy, idx) => {
        chillerRows.push({
          label: pumpEnergyItem.name ? pumpEnergyItem.name : `Chiller Pumping Energy ${idx + 1}`,
          units: `(${defaultEnergyUnit})`,
          className: 'default',
          baseline: { value: pumpEnergyItem.value ?? null, pipeFormat: defaultpipeFormat },
          modifications: modifications.map(modification => {
            return { value: modification.chillerPumpingEnergy?.[idx]?.value ?? null, pipeFormat: defaultpipeFormat };
          })
        });
      });
    }

    const condenserRows: ReportTableRow[] = [];
    if (baseline?.condenserPumpingEnergy) {
      baseline.condenserPumpingEnergy.forEach((pumpEnergyItem: PumpChillerItemEnergy, idx) => {
        condenserRows.push({
          label: pumpEnergyItem.name ? pumpEnergyItem.name : `Condenser Pumping Energy ${idx + 1}`,
          units: `(${defaultEnergyUnit})`,
          className: 'default',
          baseline: { value: pumpEnergyItem.value ?? null, pipeFormat: defaultpipeFormat },
          modifications: modifications.map(modification => {
            return { value: modification.condenserPumpingEnergy?.[idx]?.value ?? null, pipeFormat: defaultpipeFormat };
          })
        });
      });
    }

    const totalChillingPumpingEnergyRow: ReportTableRow = {
        ...defaultRow,
        label: 'Total Chiller Pumping Energy',
        baseline: { value: baseline?.totalChillerPumpingEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalChillerPumpingEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      };

      const totalCondenserPumpingEnergyRow: ReportTableRow =
      {
        ...defaultRow,
        label: 'Total Condenser Pumping Energy',
        baseline: { value: baseline?.totalCondenserPumpingEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalCondenserPumpingEnergy ?? null, pipeFormat: defaultpipeFormat };
        }),
      };

    chillerRows.push(totalChillingPumpingEnergyRow);
    condenserRows.push(totalCondenserPumpingEnergyRow);

    const summaryRows: ReportTableRow[] = [
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Total Pump Energy',
        baseline: { value: baseline?.totalPumpEnergy ?? null, pipeFormat: defaultpipeFormat },
        modifications: modifications.map(modification => {
          return { value: modification.totalPumpEnergy ?? null, pipeFormat: defaultpipeFormat };
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
        label: 'Total Pump Cost',
        units: `($)`,
        baseline: { value: baseline?.totalPumpCost ?? null, pipeFormat: 'currency' },
        modifications: modifications.map(modification => {
          return { value: modification.totalPumpCost ?? null, pipeFormat: 'currency' };
        }),
      },
      {
        ...defaultRow,
        className: 'emphasis',
        label: 'Cost Savings',
        units: `($)`,
        baseline: { value: null },
        modifications: modifications.map(modification => {
          return { value: modification.costSavings ?? null, pipeFormat: 'currency' };
        }),
      },
    ];

    return {
      chillerPumpingEnergy: chillerRows,
      condenserPumpingEnergy: condenserRows,
      summaryRows
    };
  }
}

export interface PumpSummaryUI {
  modificationNames: ModificationNameCell[];
  chillerPumpingEnergy: ReportTableRow[];
  condenserPumpingEnergy: ReportTableRow[];
  summaryRows: ReportTableRow[];
}
import { inject, Injectable, input } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { PumpResults, ProcessCoolingResults, PumpChillerItemEnergy } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ModificationNameCell, ReportTableRow } from '../report/report-ui-models';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { InputSummaryResults } from '../../shared/models/process-cooling-assessment';
import { getCipherInfo } from 'crypto';

@Injectable({ providedIn: 'root' })
export class InputSummaryService {
    private readonly resultsService = inject(ProcessCoolingResultsService);
    private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    settingsSignal = this.processCoolingAssessmentService.settingsSignal;

    readonly inputSummaryUI$ = combineLatest([
        this.resultsService.baselineResults$,
        this.resultsService.modificationResults$
    ]).pipe(
        map(([baselineResults, modificationResults]) => {
            return this.buildInputSummaryUI(baselineResults, modificationResults);
        })
    )


    buildInputSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): InputSummaryUI { 
        const inputSummaryUI: InputSummaryUI = {
            modificationNames: [],
            operationSummaryRows: {
                baseOperations: [],
                chillerSetup: [],
                carbonEmissions: [],
            },
            summaryRows: [],
        };

        const baselineSummary: InputSummaryResults = baselineResults ? this.getInputSummaryResults(baselineResults) : null;
        let modificationSummaries: InputSummaryResults[] = [];
        if (modificationResults) {
            modificationSummaries = modificationResults.map(result => this.getInputSummaryResults(result));
            inputSummaryUI.modificationNames = this.resultsService.getResultModificationNames(modificationResults);
        }

        // Use the new mapping function
        const operationSummaryRows = this.mapToInputSummaryRows(baselineSummary, modificationSummaries);
        inputSummaryUI.operationSummaryRows = operationSummaryRows;
        // Log chilledWaterSupplyTemp for debugging
        console.log('Input Summary UI:', inputSummaryUI);
        return inputSummaryUI;
    }

    private getInputSummaryResults(processCoolingResults: ProcessCoolingResults): InputSummaryResults {
        // Try to extract systemInformation.operations and towerInput from ProcessCoolingResults
        let ops = (processCoolingResults as any)?.systemInformation?.operations;
        let towerInput = (processCoolingResults as any)?.towerInput;
        // Fallback: if not present, try to get from attached assessment (if available)
        if (!ops && (processCoolingResults as any)?.assessment?.systemInformation?.operations) {
            ops = (processCoolingResults as any).assessment.systemInformation.operations;
        }
        if (!towerInput && (processCoolingResults as any)?.assessment?.systemInformation?.towerInput) {
            towerInput = (processCoolingResults as any).assessment.systemInformation.towerInput;
        }
        return {
            id: processCoolingResults.id,
            name: processCoolingResults.name,
            electricityCost: processCoolingResults.electricityCost,
            fuelCost: processCoolingResults.fuelCost,
            // Chiller setup fields
            chilledWaterSupplyTemp: ops?.chilledWaterSupplyTemp ?? null,
            condenserCoolingMethod: ops?.condenserCoolingMethod ?? null,
            // Tower fields
            towerType: towerInput?.towerType ?? null,
            towerTypeLabel: this.getTowerTypeLabel(towerInput?.towerType),
            towerSizeMetric: towerInput?.towerSizeMetric ?? null,
            towerSizeMetricLabel: this.getTowerSizeMetricLabel(towerInput?.towerSizeMetric),
            fanType: towerInput?.fanType ?? null,
            fanTypeLabel: this.getFanTypeLabel(towerInput?.fanType),
            numberOfTowers: towerInput?.numberOfTowers ?? null,
            numberOfFans: towerInput?.numberOfFans ?? null,
            usesFreeCooling: towerInput?.usesFreeCooling ?? null,
            isHEXRequired: towerInput?.isHEXRequired ?? null,
            HEXApproachTemp: towerInput?.HEXApproachTemp ?? null,
        } as any;
    }

    private mapToInputSummaryRows(
        baseline: any | null,
        modifications: any[] | null
    ): OperationSummaryRows {
        const defaultpipeFormat = '1.0-0';
        const defaultclassName: 'default' | 'emphasis' = 'default';
        const tempUnit = this.settingsSignal().unitsOfMeasure === 'Imperial' ? '°F' : '°C';

        // Base Operations
        const baseOperations: ReportTableRow[] = [
            {
                label: 'Electricity Cost',
                units: '($)',
                className: defaultclassName,
                baseline: { value: baseline?.electricityCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } },
                modifications: modifications ? modifications.map(mod => ({ value: mod.electricityCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } })) : []
            },
            {
                label: 'Fuel Cost',
                units: '($)',
                className: defaultclassName,
                baseline: { value: baseline?.fuelCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } },
                modifications: modifications ? modifications.map(mod => ({ value: mod.fuelCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } })) : []
            }
        ];

        // Chiller Setup
        const chillerSetup: ReportTableRow[] = [
            {
                label: 'Chilled Water Supply Temperature',
                units: tempUnit,
                className: defaultclassName,
                baseline: { value: baseline?.chilledWaterSupplyTemp ?? null, decimalPipe: defaultpipeFormat },
                modifications: modifications ? modifications.map(mod => ({ value: mod.chilledWaterSupplyTemp ?? null, decimalPipe: defaultpipeFormat })) : []
            },
            {
                label: 'Condenser Cooling Method',
                units: '',
                className: defaultclassName,
                baseline: { value: this.getCondenserCoolingMethodLabel(baseline?.condenserCoolingMethod) },
                modifications: modifications ? modifications.map(mod => ({ value: this.getCondenserCoolingMethodLabel(mod.condenserCoolingMethod) })) : []
            }
        ];

        // Tower Setup
        const towerSetup: ReportTableRow[] = [
            {
                label: 'Tower Type',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.towerTypeLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.towerTypeLabel ?? '' })) : []
            },
            {
                label: 'Tower Size Metric',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.towerSizeMetricLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.towerSizeMetricLabel ?? '' })) : []
            },
            {
                label: 'Fan Type',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.fanTypeLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.fanTypeLabel ?? '' })) : []
            },
            {
                label: 'Number of Towers',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.numberOfTowers ?? null },
                modifications: modifications ? modifications.map(mod => ({ value: mod.numberOfTowers ?? null })) : []
            },
            {
                label: 'Number of Fans',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.numberOfFans ?? null },
                modifications: modifications ? modifications.map(mod => ({ value: mod.numberOfFans ?? null })) : []
            },
            {
                label: 'Uses Free Cooling',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.usesFreeCooling ? 'Yes' : 'No' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.usesFreeCooling ? 'Yes' : 'No' })) : []
            },
            {
                label: 'Is HEX Required',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.isHEXRequired ? 'Yes' : 'No' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.isHEXRequired ? 'Yes' : 'No' })) : []
            },
            {
                label: 'HEX Approach Temp',
                units: tempUnit,
                className: defaultclassName,
                baseline: { value: baseline?.HEXApproachTemp ?? null, decimalPipe: defaultpipeFormat },
                modifications: modifications ? modifications.map(mod => ({ value: mod.HEXApproachTemp ?? null, decimalPipe: defaultpipeFormat })) : []
            }
        ];

        return {
            baseOperations,
            chillerSetup,
            carbonEmissions: [],
            towerSetup
        };
    }

    // Tower type label mapping
    private getTowerTypeLabel(type: number | null | undefined): string {
        switch (type) {
            case 0: return '1 Cell, 1 Speed';
            case 1: return '1 Cell, 2 Speed';
            case 2: return '2 Cell, 1 Speed';
            case 3: return '2 Cell, 2 Speed';
            case 4: return '3 Cell, 1 Speed';
            case 5: return '3 Cell, 2 Speed';
            case 6: return 'Variable Speed';
            default: return '';
        }
    }

    // Tower size metric label mapping
    private getTowerSizeMetricLabel(metric: number | null | undefined): string {
        switch (metric) {
            case 0: return 'Tons';
            case 1: return 'HP';
            case 2: return 'Unknown';
            default: return '';
        }
    }

    // Fan type label mapping
    private getFanTypeLabel(type: number | null | undefined): string {
        switch (type) {
            case 0: return 'Axial';
            case 1: return 'Centrifugal';
            case 2: return 'Unknown';
            default: return '';
        }
    }

    // Helper to map condenserCoolingMethod number to label
    private getCondenserCoolingMethodLabel(method: number | null | undefined): string {
        if (method === 0) return 'Air';
        if (method === 1) return 'Water';
        if (method === 2) return 'Evaporative';
        if (method === null || method === undefined) return '';
        return String(method);
    }

}

export interface InputSummaryUI {
    modificationNames: ModificationNameCell[];
    operationSummaryRows: OperationSummaryRows; // parent object for all operation sections
    summaryRows: ReportTableRow[];
}

export interface OperationSummaryRows {
    baseOperations: ReportTableRow[];
    chillerSetup: ReportTableRow[];
    carbonEmissions: ReportTableRow[];
    towerSetup?: ReportTableRow[];
    // add more sections as needed
}
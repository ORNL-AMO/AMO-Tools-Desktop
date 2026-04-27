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
        console.log('is', inputSummaryUI);
        return inputSummaryUI;
    }

    private getInputSummaryResults(processCoolingResults: ProcessCoolingResults): InputSummaryResults {
        //unfunushed, only getting necessary data for operations.
        return {
            id: processCoolingResults.id,
            name: processCoolingResults.name,
            electricityCost: processCoolingResults.electricityCost,
            fuelCost: processCoolingResults.fuelCost,
        }
    }

    private mapToInputSummaryRows(
        baseline: InputSummaryResults | null,
        modifications: InputSummaryResults[] | null
    ): OperationSummaryRows {
        const defaultpipeFormat = '1.0-0';
        const defaultclassName: 'default' | 'emphasis' = 'default';
        const defaultEnergyUnit = this.settingsSignal().unitsOfMeasure ? PROCESS_COOLING_UNITS.energy.labelHTML.imperial : PROCESS_COOLING_UNITS.energy.labelHTML.metric;

        // Only baseOperations for now
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

        return {
            baseOperations,
            chillerSetup: [],
            carbonEmissions: []
        };
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
    // add more sections as needed
}
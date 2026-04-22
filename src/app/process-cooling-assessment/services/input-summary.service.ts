import { inject, Injectable, input } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { PumpResults, ProcessCoolingResults, PumpChillerItemEnergy } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ModificationNameCell, ReportTableRow } from '../report/report-ui-models';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';



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
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
            return this.buildInputSummaryUI(baselineResults, modificationResults);
        })
    )


    buildInputSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): void { 
        console.log('resultsService results', baselineResults, modificationResults);
        return null;
    }

}

export interface PumpSummaryUI {
  modificationNames: ModificationNameCell[];
  chillerPumpingEnergy: ReportTableRow[];
  condenserPumpingEnergy: ReportTableRow[];
  summaryRows: ReportTableRow[];
}
import { inject, Injectable } from '@angular/core';
import { ProcessCoolingChillerOutput, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { combineLatest, map } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';

@Injectable({
  providedIn: 'root'
})
export class SystemProfileService {
  private readonly resultsService = inject(ProcessCoolingResultsService);
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  settingsSignal = this.processCoolingAssessmentService.settingsSignal;

  readonly baselineProfileUI$ = this.resultsService.baselineResults$.pipe(
    map((baselineResults) => {
      return this.buildSystemProfileUI(baselineResults, []);
    })
  );

  readonly reportProfileUI$ = combineLatest([
    this.resultsService.baselineResults$,
    this.resultsService.modificationResults$
  ]).pipe(
    map(([baselineResults, modificationResults]) => {
      return this.buildSystemProfileUI(baselineResults, modificationResults);
    })
  );

  buildSystemProfileUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): SystemProfileUI {
    const systemProfileUI: SystemProfileUI = {
      defaultSelectedId: baselineResults.id,
      systemProfileChillerOutput: [{ id: baselineResults.id, name: 'Baseline', chillerOutputs: baselineResults.chiller }],
    }
    if (modificationResults) {
      modificationResults.forEach(result => {
        systemProfileUI.systemProfileChillerOutput.push({ id: result.id, name: result.name, chillerOutputs: result.chiller });
      });
    }

    return systemProfileUI;
  }
}

export type ProfileView = 'baseline' | 'report';


export interface SystemProfileUI {
  defaultSelectedId: string;
  systemProfileChillerOutput: SystemProfileChillerOutput[];
}

export interface SystemProfileChillerOutput {
  id: string;
  name: string;
  chillerOutputs: ProcessCoolingChillerOutput[];
}
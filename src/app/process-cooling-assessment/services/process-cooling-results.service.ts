import { inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { CondenserCoolingMethod, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { BehaviorSubject, map } from 'rxjs';

@Injectable()
export class ProcessCoolingResultsService {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly suiteApi = inject(ProcessCoolingSuiteApiService);

  readonly results$ = this.processCoolingAssessmentService.assessment$.pipe(
    map(assessment => {
      if (assessment && assessment.processCooling && assessment.processCooling.isValid) {
        return this.getResults(assessment.processCooling);
      }
      return undefined;
    })
  );

  getResults(assessment: ProcessCoolingAssessment) {
    console.log('[ProcessCoolingResultsService]  assessment:', assessment);
    let results: ProcessCoolingResults;
    if (assessment.systemInformation.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
      results = this.suiteApi.getWaterCooledResults(assessment);
    } else {
      results = this.suiteApi.getAirCooledResults(assessment);
    }
    console.log('[ProcessCoolingResultsService] getResults:', results);
    return results;
  }
}

import { Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../tools-suite-api/process-cooling-suite-api.service';
import { ProcessCoolingAssessment, ProcessCoolingResults } from '../shared/models/process-cooling-assessment';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingResultsService {
  constructor(private suiteApi: ProcessCoolingSuiteApiService) { }

  getResults(assessment: ProcessCoolingAssessment) {
    console.log('[ProcessCoolingResultsService]  assessment:', assessment);
    let results: ProcessCoolingResults;
    if (assessment.systemInformation.operations.condenserCoolingMethod === 0) {
      results = this.suiteApi.getWaterCooledResults(assessment);
    } else {
      results = this.suiteApi.getAirCooledResults(assessment);
    }
    console.log('[ProcessCoolingResultsService] getResults:', results);
    return results;
  }
}

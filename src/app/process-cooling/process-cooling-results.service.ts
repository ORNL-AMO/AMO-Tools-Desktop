import { Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../tools-suite-api/process-cooling-suite-api.service';
import { ProcessCoolingAssessment, ProcessCoolingChillerOutput, ProcessCoolingPumpOutput, ProcessCoolingTowerOutput } from '../shared/models/process-cooling-assessment';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingResultsService {
  constructor(private suiteApi: ProcessCoolingSuiteApiService) { }

  /**
   * Calls all suite API methods and returns a composed ProcessCoolingResults object.
   * @param assessment The input assessment object
   */
  getResults(assessment: ProcessCoolingAssessment): any {
    console.log('[ProcessCoolingResultsService] getResults called with assessment:', assessment);
    const airCooledChiller = this.suiteApi.runAirCooledChillerEnergy(assessment);
    const waterCooledChiller = this.suiteApi.runWaterCooledChillerEnergy(assessment);
    const pump = this.suiteApi.runPumpEnergy(assessment);
    const tower = this.suiteApi.runTowerEnergy(assessment);
    const results = {
      airCooledChiller,
      waterCooledChiller,
      pump,
      tower
    };
    console.log('[ProcessCoolingResultsService] getResults:', results);
    return results;
  }
}

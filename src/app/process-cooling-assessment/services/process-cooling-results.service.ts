import { inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { WEATHER_CONTEXT } from '../../shared/modules/weather-data/weather-context.token';
import { combineLatest, map, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { CondenserCoolingMethod, Modification, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ModificationService } from './modification.service';

@Injectable()
export class ProcessCoolingResultsService {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly processCoolingWeatherContextService = inject(WEATHER_CONTEXT);
  private readonly suiteApi = inject(ProcessCoolingSuiteApiService);

  readonly baselineResults$: Observable<ProcessCoolingResults> = this.processCoolingAssessmentService.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      let results: ProcessCoolingResults;
      if (processCooling && processCooling.isValid) {
        results = this.getResults(processCooling);
      }
      // console.log('[ProcessCoolingResultsService] baselineResults$ results:', results);
      return results;
    })
  );

  readonly modificationResults$: Observable<ProcessCoolingResults> = combineLatest([
    this.processCoolingAssessmentService.processCooling$,
    this.modificationService.selectedModification$
  ]).pipe(
    map(([processCooling, modification]: [ProcessCoolingAssessment, Modification]) => {
      let results: ProcessCoolingResults;
      if (processCooling && processCooling.isValid && modification && modification.isValid) {
        const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(processCooling, modification);
        results = this.getResults(modifiedProcessCoolingAssessment);
      } 
      // console.log('[ProcessCoolingResultsService] modificationResults$ results:', results);
      return results;
    })
  );

  getResults(processCoolingAssessment: ProcessCoolingAssessment): ProcessCoolingResults {
    // console.log('[ProcessCoolingResultsService]  processCoolingAssessment:', processCoolingAssessment);
    let results: ProcessCoolingResults;
    const weatherData = this.processCoolingWeatherContextService.getWeatherData();
    const isValidWeatherData = this.processCoolingWeatherContextService.isValidWeatherData();
    
    if (isValidWeatherData) {
      if (processCoolingAssessment.systemInformation.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
        results = this.suiteApi.getWaterCooledResults(processCoolingAssessment, weatherData);
      } else {
        results = this.suiteApi.getAirCooledResults(processCoolingAssessment, weatherData);
      }
    }
    return results;
  }
}

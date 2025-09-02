import { inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { CondenserCoolingMethod, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { map } from 'rxjs';
import { WEATHER_CONTEXT } from '../../shared/modules/weather-data/weather-context.token';

@Injectable()
export class ProcessCoolingResultsService {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly processCoolingWeatherContextService = inject(WEATHER_CONTEXT);

  private readonly suiteApi = inject(ProcessCoolingSuiteApiService);

  readonly results$ = this.processCoolingAssessmentService.processCooling$.pipe(
    map(processCooling => {
      if (processCooling && processCooling.isValid) {
        return this.getResults(processCooling);
      }
      return undefined;
    })
  );

  getResults(assessment: ProcessCoolingAssessment) {
    console.log('[ProcessCoolingResultsService]  assessment:', assessment);
    console.log('[ProcessCoolingResultsService]  weatherContextData:', this.processCoolingWeatherContextService.getWeatherData());
    let results: ProcessCoolingResults;
    const weatherData = this.processCoolingWeatherContextService.getWeatherData();
    const isValidWeatherData = this.processCoolingWeatherContextService.isValidWeatherData();
    
    if (isValidWeatherData) {
      if (assessment.systemInformation.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
        results = this.suiteApi.getWaterCooledResults(assessment, weatherData);
      } else {
        results = this.suiteApi.getAirCooledResults(assessment, weatherData);
      }
    }
    console.log('[ProcessCoolingResultsService] getResults:', results);
    return results;
  }
}

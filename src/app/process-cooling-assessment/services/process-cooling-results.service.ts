import { inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService } from '../../tools-suite-api/process-cooling-suite-api.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { combineLatest, map, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { CondenserCoolingMethod, Modification, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ModificationService } from './modification.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable()
export class ProcessCoolingResultsService {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly processCoolingWeatherContextService = inject(WEATHER_CONTEXT);
  private readonly suiteApi = inject(ProcessCoolingSuiteApiService);
  private readonly convertProcessCoolingService = inject(ConvertProcessCoolingService);

  readonly baselineResults$: Observable<ProcessCoolingResults> = combineLatest([
    this.processCoolingAssessmentService.processCooling$,
    this.processCoolingAssessmentService.isBaselineValid$
  ]).pipe(
    map(([processCooling, isBaselineValid]: [ProcessCoolingAssessment, boolean]) => {
      let results: ProcessCoolingResults;
      if (processCooling && isBaselineValid) {
        results = this.getProcessCoolingSuiteResults(processCooling);
      }
      return results;
    })
  );

  readonly selectedModificationResults$: Observable<ProcessCoolingResults> = combineLatest([
    this.processCoolingAssessmentService.processCooling$,
    this.processCoolingAssessmentService.isBaselineValid$,
    this.modificationService.selectedModification$
  ]).pipe(
    map(([processCooling, isBaselineValid, modification]: [ProcessCoolingAssessment, boolean, Modification]) => {
      let results: ProcessCoolingResults;
      if (processCooling && isBaselineValid && modification && modification.isValid) {
        const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(processCooling, modification);
        results = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment);
      } 
      console.log('[ProcessCoolingResultsService] selectedModificationResults$ results:', results);
      return results;
    })
  );

  readonly modificationResults$: Observable<ProcessCoolingResults[]> = combineLatest([
    this.processCoolingAssessmentService.processCooling$,
    this.processCoolingAssessmentService.isBaselineValid$,
    toObservable(this.modificationService.modifications)
  ]).pipe(
    map(([processCooling, isBaselineValid, modifications]: [ProcessCoolingAssessment, boolean, Modification[]]) => {

      let modificationResults: ProcessCoolingResults[] = [];
      if (processCooling && isBaselineValid && modifications) {
        modificationResults = modifications.map(modification => {
          if (modification && modification.isValid) {
            const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(processCooling, modification);
            let results: ProcessCoolingResults = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment);
            return results;
          }
        }).filter(result => result !== undefined);
      } 
      console.log('[ProcessCoolingResultsService] modificationResults$ results:', modificationResults);
      return modificationResults;
    })
  );

  getProcessCoolingSuiteResults(processCoolingAssessment: ProcessCoolingAssessment): ProcessCoolingResults {
    console.log('[ProcessCoolingResultsService]  processCoolingAssessment:', processCoolingAssessment);
    let results: ProcessCoolingResults;
    const weatherData: WeatherContextData = this.processCoolingWeatherContextService.getWeatherData();
    const isValidWeatherData: boolean = this.processCoolingWeatherContextService.isValidWeatherData();
    if (isValidWeatherData) {
      const convertedWeatherDataInput = this.convertProcessCoolingService.convertWeatherDataForSuiteApi(weatherData, this.processCoolingAssessmentService.settingsSignal());
      if (processCoolingAssessment.systemInformation.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
        results = this.suiteApi.getWaterCooledResults(processCoolingAssessment, convertedWeatherDataInput);
      } else {
        results = this.suiteApi.getAirCooledResults(processCoolingAssessment, convertedWeatherDataInput);
      }
    }
    console.log('[ProcessCoolingResultsService] getProcessCoolingSuiteResults results:', results);
    return results;
  }
}

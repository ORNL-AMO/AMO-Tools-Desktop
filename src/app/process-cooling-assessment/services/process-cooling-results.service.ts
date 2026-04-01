import { inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService, SuiteModificationArgs } from '../../tools-suite-api/process-cooling-suite-api.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { combineLatest, map, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { CondenserCoolingMethod, Modification, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ModificationService } from './modification.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ModificationNameCell } from '../report/report-ui-models';

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
        results.id = String(this.processCoolingAssessmentService.assessmentValue.id);
      }
      console.log('[ProcessCoolingResultsService] baselineResults$ results:', results);
      return results;
    })
  );

  readonly selectedModificationResults$: Observable<ProcessCoolingResults> = this.modificationService.selectedModification$.pipe(
    map((modification: Modification) => {
      let results: ProcessCoolingResults;
      const isValid = !this.modificationService.invalidModificationIds().includes(modification.id);
      if (modification && isValid) {
        const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(modification);
        console.log(`[ProcessCoolingResultsService] modification ${modification.name} isValid:`, isValid);
        results = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment);
        results.id = modification.id;
      }
      // console.log('[ProcessCoolingResultsService] selectedModificationResults$ results:', results);
      return results;
    })
  );

  readonly modificationResults$: Observable<ProcessCoolingResults[]> = toObservable(this.modificationService.modifications).pipe(
    map((modifications: Modification[]) => {
      let modificationResults: ProcessCoolingResults[] = [];
      if (modifications) {
        modificationResults = modifications.map(modification => {
          // todo we may still have race condition with invalidModificationids
          const isValid = !this.modificationService.invalidModificationIds().includes(modification.id);
          console.log(`[ProcessCoolingResultsService] modification ${modification.name} isValid:`, isValid);
          if (isValid) {
            const suiteModificationArgs: SuiteModificationArgs = {
              changeRefrig: modification.replaceChillerRefrigerant?.useOpportunity ?? false
            };
            const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(modification);
            let results: ProcessCoolingResults = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment, suiteModificationArgs);
            results.id = modification.id;
            return results;
          } else {
            // * we need an empty result set - MEASUR'S UX is to still show invalid modifications in the executive summary
            let results: ProcessCoolingResults = this.getEmptyInvalidResults(modification);
            return results;
          }
        }).filter(result => result !== undefined);
      }
      console.log('[ProcessCoolingResultsService] modificationResults$ results:', modificationResults);
      return modificationResults;
    })
  );

  /**
   * Retrieve assessment results from the Suite API. Represents either baseline or modification results, depending on the context of use
   * @param processCoolingAssessment 
   * @returns Baseline or Modification results
   */
  getProcessCoolingSuiteResults(processCoolingAssessment: ProcessCoolingAssessment, suiteModificationArgs?: SuiteModificationArgs): ProcessCoolingResults {
    console.log('[ProcessCoolingResultsService]  processCoolingAssessment:', processCoolingAssessment);
    let results: ProcessCoolingResults;
    const weatherData: WeatherContextData = this.processCoolingWeatherContextService.getWeatherData();
    const isValidWeatherData: boolean = this.processCoolingWeatherContextService.isValidWeatherData();
    if (isValidWeatherData) {
      const convertedWeatherDataInput = this.convertProcessCoolingService.convertWeatherDataForSuiteApi(weatherData, this.processCoolingAssessmentService.settingsSignal());
      if (processCoolingAssessment.systemInformation.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
        results = this.suiteApi.getWaterCooledResults(processCoolingAssessment, convertedWeatherDataInput, suiteModificationArgs);
      } else {
        results = this.suiteApi.getAirCooledResults(processCoolingAssessment, convertedWeatherDataInput, suiteModificationArgs);
      }
    }
    // console.log('[ProcessCoolingResultsService] getProcessCoolingSuiteResults results:', results);
    return results;
  }

    getResultModificationNames(modificationResults: ProcessCoolingResults[] | null): ModificationNameCell[] {
    if (!modificationResults) return [];
      return modificationResults.map((result, idx) => {
        return { id: result?.id ?? `modification-${idx + 1}`, name: result?.name ?? `Modification ${idx + 1}` };
      });
    }

    getEmptyInvalidResults(modification: Modification): ProcessCoolingResults {
    return {
        id: modification.id,
        name: modification.name,
        fuelCost: 0,
        electricityCost: 0,
        chiller: [],
        pump: {
            chillerPumpingEnergy: [],
            condenserPumpingEnergy: [],
        },
        tower: {
            hours: [],
            energy: [],
        },
    };
}
}

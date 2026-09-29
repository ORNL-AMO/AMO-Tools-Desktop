import { computed, inject, Injectable } from '@angular/core';
import { ProcessCoolingSuiteApiService, SuiteModificationArgs } from '../../tools-suite-api/process-cooling-suite-api.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { combineLatest, map, Observable } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { CondenserCoolingMethod, Modification, ProcessCoolingAssessment, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ModificationService } from './modification.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ModificationNameCell } from '../../shared/report-builder/models/report-ui-models';

@Injectable()
export class ProcessCoolingResultsService {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly processCoolingWeatherContextService = inject(WEATHER_CONTEXT);
  private readonly suiteApi = inject(ProcessCoolingSuiteApiService);
  private readonly convertProcessCoolingService = inject(ConvertProcessCoolingService);

  private readonly debugSuiteInputs: { baseline?: any; modifications: Record<string, any> } = { modifications: {} };
  private readonly debugSuiteOutputs: { baseline?: any; modifications: Record<string, any> } = { modifications: {} };

  readonly baselineResults$: Observable<ProcessCoolingResults | undefined> = combineLatest([
    this.processCoolingAssessmentService.processCooling$,
    this.processCoolingWeatherContextService.weatherContextData$,
  ]).pipe(
    map(([processCooling]) => {
      if (!this.processCoolingAssessmentService.isBaselineValid(processCooling)) return undefined;
      const results = this.getProcessCoolingSuiteResults(processCooling, undefined, { group: 'baseline' });
      results.id = String(this.processCoolingAssessmentService.assessmentValue.id);
      return results;
    })
  );

  readonly selectedModificationResults$: Observable<ProcessCoolingResults> = this.modificationService.selectedModification$.pipe(
    map((modification: Modification) => {
      let results: ProcessCoolingResults;
      const isValid = !this.modificationService.invalidModificationIds().includes(modification.id);
      if (modification && isValid) {
        const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(modification);
        results = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment, undefined, { group: 'modification', id: modification.id });
        results.id = modification.id;
      }
      return results;
    })
  );

  readonly modificationResults$: Observable<ProcessCoolingResults[]> = toObservable(
    computed(() => ({
      modifications: this.modificationService.modifications(),
      invalidIds: this.modificationService.invalidModificationIds(),
    }))
  ).pipe(
    map(({ modifications, invalidIds }) => {
      let modificationResults: ProcessCoolingResults[] = [];
      if (modifications) {
        modificationResults = modifications.map(modification => {
          const isValid = !invalidIds.includes(modification.id);
          if (isValid) {
            const suiteModificationArgs: SuiteModificationArgs = {
              changeRefrig: modification.replaceChillerRefrigerant?.useOpportunity ?? false
            };
            const modifiedProcessCoolingAssessment = this.modificationService.getModifiedProcessCoolingAssessment(modification);
            let results: ProcessCoolingResults = this.getProcessCoolingSuiteResults(modifiedProcessCoolingAssessment, suiteModificationArgs, { group: 'modification', id: modification.id });
            results.id = modification.id;
            return results;
          } else {
            // * we need an empty result set - MEASUR'S UX is to still show invalid modifications in the executive summary
            let results: ProcessCoolingResults = this.getEmptyInvalidResults(modification);
            return results;
          }
        }).filter(result => result !== undefined);
      }
      return modificationResults;
    })
  );

  /**
   * Retrieve assessment results from the Suite API. Represents either baseline or modification results, depending on the context of use
   * @param processCoolingAssessment 
   * @returns Baseline or Modification results
   */
  getProcessCoolingSuiteResults(processCoolingAssessment: ProcessCoolingAssessment, suiteModificationArgs?: SuiteModificationArgs, debugContext?: { group: 'baseline' | 'modification'; id?: string }): ProcessCoolingResults {
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
    if (debugContext) {
      this.recordSuiteDebugData(debugContext, processCoolingAssessment, suiteModificationArgs, results);
    }
    return results;
  }

  private recordSuiteDebugData(
    debugContext: { group: 'baseline' | 'modification'; id?: string },
    processCoolingAssessment: ProcessCoolingAssessment,
    suiteModificationArgs: SuiteModificationArgs | undefined,
    results: ProcessCoolingResults
  ): void {
    const { weatherData, ...assessmentWithoutWeatherData } = processCoolingAssessment;
    const inputEntry = {
      assessment: assessmentWithoutWeatherData,
      suiteModificationArgs: suiteModificationArgs ?? null,
    };
    const outputEntry = results;

    if (debugContext.group === 'baseline') {
      this.debugSuiteInputs.baseline = inputEntry;
      this.debugSuiteOutputs.baseline = outputEntry;
    } else {
      this.debugSuiteInputs.modifications[debugContext.id] = inputEntry;
      this.debugSuiteOutputs.modifications[debugContext.id] = outputEntry;
    }

    // console.log('[DEBUG] Suite Inputs (baseline vs modifications)', this.debugSuiteInputs);
    // console.log('[DEBUG] Suite Outputs (baseline vs modifications)', this.debugSuiteOutputs);
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

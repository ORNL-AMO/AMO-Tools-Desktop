import { computed, inject, Injectable, Signal } from '@angular/core';
import { PHAST, PhastResults } from '../models/phast';
import { CalculatedByPhast, EnergyUseReportData, PHAST as SharedPHAST, ShowResultsCategories } from '../../shared/models/phast/phast';
import { DesignedEnergyResults } from '../../shared/models/phast/designedEnergy';
import { MeteredEnergyResults } from '../../shared/models/phast/meteredEnergy';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from './process-heating-assessment.service';

@Injectable()
export class ProcessHeatingResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly phastResultsService = inject(PhastResultsService);
  private readonly meteredEnergyService = inject(MeteredEnergyService);
  private readonly designedEnergyService = inject(DesignedEnergyService);

  getResults(phast: PHAST, settings: Settings): PhastResults | undefined {
    if (!phast || !settings || !phast.losses) return undefined;
    // The legacy results service still expects the shared, legacy-owned PHAST shape.
    return this.phastResultsService.getResults(phast as unknown as SharedPHAST, settings);
  }

  private readonly scenarioResultsCache = new Map<AssessmentScenario, Signal<PhastResults | undefined>>();

  /**
   * Results shared by every reader of the scenario, recalculated only when its losses or the settings change.
   * Readers must not mutate the returned object.
   * @param scenario 'baseline' or a modification id
   * @returns the scenario's results, or undefined when it has no losses
   */
  scenarioResults(scenario: AssessmentScenario): PhastResults | undefined {
    let cached = this.scenarioResultsCache.get(scenario);
    if (!cached) {
      cached = computed(() => this.getResults(this.assessmentService.scenarioPhastSignal(scenario), this.assessmentService.settingsSignal()));
      this.scenarioResultsCache.set(scenario, cached);
    }
    return cached();
  }

  /**
   * @param settings assessment settings (energy source and furnace type drive visibility)
   * @returns flags for which conditional result rows apply to the configuration
   */
  getResultCategories(settings: Settings): ShowResultsCategories {
    return this.phastResultsService.getResultCategories(settings);
  }

  /**
   * @param baseline results of the baseline scenario
   * @param modification results of the modification being compared
   * @param field emissions basis to compare: annual total or hourly total
   * @returns baseline emissions minus modification emissions, or undefined when either scenario has no emissions output
   */
  getCo2EmissionsSavings(baseline: PhastResults, modification: PhastResults, field: 'totalEmissionOutput' | 'hourlyTotalEmissionOutput'): number | undefined {
    if (!baseline.co2EmissionsOutput || !modification.co2EmissionsOutput) {
      return undefined;
    }
    return baseline.co2EmissionsOutput[field] - modification.co2EmissionsOutput[field];
  }

  /** @returns energy source rows data (fuel name, heating value, energy used) for the Energy Summary */
  getEnergyUseReportData(phast: PHAST, results: PhastResults, settings: Settings): EnergyUseReportData {
    // Legacy reads flueGasLosses[0] whenever the array exists, which throws on an empty array.
    const flueGasLosses = phast.losses.flueGasLosses?.length ? phast.losses.flueGasLosses : undefined;
    const legacyPhast = { ...phast, losses: { ...phast.losses, flueGasLosses } } as unknown as SharedPHAST;
    return this.phastResultsService.getEnergyUseReportData(legacyPhast, results as never, settings);
  }

  /** @returns energy used, energy intensity, and auxiliary electricity calculated by the heat balance */
  getCalculatedByPhast(phast: PHAST, settings: Settings): CalculatedByPhast {
    return this.phastResultsService.calculatedByPhast(phast as unknown as SharedPHAST, settings);
  }

  /** @returns the metered energy comparison, or undefined when no metered energy was entered */
  getMeteredEnergyResults(phast: PHAST, settings: Settings): MeteredEnergyResults | undefined {
    const metered = phast.meteredEnergy;
    if (!metered?.meteredEnergyElectricity && !metered?.meteredEnergySteam && !metered?.meteredEnergyFuel) {
      return undefined;
    }
    return this.meteredEnergyService.calculateMeteredEnergy(phast as unknown as SharedPHAST, settings);
  }

  /** @returns the designed energy comparison, or undefined when no designed energy was entered */
  getDesignedEnergyResults(phast: PHAST, settings: Settings): DesignedEnergyResults | undefined {
    if (!phast.designedEnergy) {
      return undefined;
    }
    return this.designedEnergyService.calculateDesignedEnergy(phast as unknown as SharedPHAST, settings);
  }
}

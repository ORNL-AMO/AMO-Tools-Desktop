import { computed, inject, Injectable, Signal } from '@angular/core';
import { PHAST, PhastResults } from '../models/phast';
import { CalculatedByPhast, EnergyUseReportData, ShowResultsCategories } from '../../shared/models/phast/phast';
import { DesignedEnergyResults } from '../../shared/models/phast/designedEnergy';
import { MeteredEnergyResults } from '../../shared/models/phast/meteredEnergy';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../../phast/phast-results.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { toLegacyPhast } from './legacy-phast.util';

/** Result row flags; Electrical Heat Delivered is split because EAF reports it from a different result field. */
export interface ResultCategories extends ShowResultsCategories {
  showEafElectricalDelivered: boolean;
  showStandardElectricalDelivered: boolean;
}

/**
 * @param categories each scenario's result categories
 * @returns a flag set wherever any scenario sets it, so a table shows every row some column uses
 */
export function combineResultCategories(categories: ResultCategories[]): ResultCategories {
  const [first, ...rest] = categories;
  const combined: ResultCategories = { ...first };
  for (const next of rest) {
    for (const key of Object.keys(next) as (keyof ResultCategories)[]) {
      combined[key] = !!combined[key] || !!next[key];
    }
  }
  return combined;
}

@Injectable()
export class ProcessHeatingResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly phastResultsService = inject(PhastResultsService);
  private readonly meteredEnergyService = inject(MeteredEnergyService);
  private readonly designedEnergyService = inject(DesignedEnergyService);

  getResults(phast: PHAST, settings: Settings): PhastResults | undefined {
    if (!phast || !settings || !phast.losses) return undefined;
    return this.phastResultsService.getResults(toLegacyPhast(phast), settings);
  }

  private readonly scenarioResultsCache = new Map<AssessmentScenario, Signal<PhastResults | undefined>>();

  /**
   * Results shared by every reader of the scenario, recalculated only when its losses or its settings change.
   * Readers must not mutate the returned object.
   * @param scenario 'baseline' or a modification id
   * @returns the scenario's results, or undefined when it has no losses
   */
  scenarioResults(scenario: AssessmentScenario): PhastResults | undefined {
    let cached = this.scenarioResultsCache.get(scenario);
    if (!cached) {
      cached = computed(() => this.getResults(this.assessmentService.scenarioPhastSignal(scenario), this.assessmentService.scenarioSettings(scenario)));
      this.scenarioResultsCache.set(scenario, cached);
    }
    return cached();
  }

  /**
   * @param settings a scenario's settings (energy source and furnace type drive visibility)
   * @returns flags for which conditional result rows apply to the configuration
   */
  getResultCategories(settings: Settings): ResultCategories {
    const categories = { ...this.phastResultsService.getResultCategories(settings), showAuxPower: false };
    const isEaf = settings.furnaceType === 'Electric Arc Furnace (EAF)';
    return {
      ...categories,
      showEafElectricalDelivered: !!categories.showElectricalDelivered && isEaf,
      showStandardElectricalDelivered: !!categories.showElectricalDelivered && !isEaf,
    };
  }

  /**
   * @param scenario 'baseline' or a modification id
   * @returns flags for which conditional result rows apply to the scenario's own energy source
   */
  scenarioResultCategories(scenario: AssessmentScenario): ResultCategories {
    return this.getResultCategories(this.assessmentService.scenarioSettings(scenario));
  }

  /**
   * @param baseline results of the baseline scenario
   * @param modification results of the modification being compared
   * @param field emissions basis to compare: annual total or hourly total
   * @returns baseline emissions minus modification emissions, or undefined when either scenario has no value for the field
   */
  getCo2EmissionsSavings(baseline: PhastResults, modification: PhastResults, field: 'totalEmissionOutput' | 'hourlyTotalEmissionOutput'): number | undefined {
    const baselineEmissions = baseline.co2EmissionsOutput?.[field];
    const modificationEmissions = modification.co2EmissionsOutput?.[field];
    if (baselineEmissions == null || modificationEmissions == null) {
      return undefined;
    }
    return baselineEmissions - modificationEmissions;
  }

  /** @returns energy source rows data (fuel name, heating value, energy used) for the Energy Summary */
  getEnergyUseReportData(phast: PHAST, results: PhastResults, settings: Settings): EnergyUseReportData {
    // Legacy reads flueGasLosses[0] whenever the array exists, which throws on an empty array.
    const flueGasLosses = phast.losses.flueGasLosses?.length ? phast.losses.flueGasLosses : undefined;
    const legacyPhast = toLegacyPhast({ ...phast, losses: { ...phast.losses, flueGasLosses } });
    return this.phastResultsService.getEnergyUseReportData(legacyPhast, results as never, settings);
  }

  /** @returns energy used, energy intensity, and auxiliary electricity calculated by the heat balance */
  getCalculatedByPhast(phast: PHAST, settings: Settings): CalculatedByPhast {
    return this.phastResultsService.calculatedByPhast(toLegacyPhast(phast), settings);
  }

  /** @returns the metered energy comparison, or undefined when no metered energy was entered */
  getMeteredEnergyResults(phast: PHAST, settings: Settings): MeteredEnergyResults | undefined {
    const metered = phast.meteredEnergy;
    if (!metered?.meteredEnergyElectricity && !metered?.meteredEnergySteam && !metered?.meteredEnergyFuel) {
      return undefined;
    }
    return this.meteredEnergyService.calculateMeteredEnergy(toLegacyPhast(phast), settings);
  }

  /** @returns the designed energy comparison, or undefined when no designed energy was entered */
  getDesignedEnergyResults(phast: PHAST, settings: Settings): DesignedEnergyResults | undefined {
    if (!phast.designedEnergy) {
      return undefined;
    }
    return this.designedEnergyService.calculateDesignedEnergy(toLegacyPhast(phast), settings);
  }
}

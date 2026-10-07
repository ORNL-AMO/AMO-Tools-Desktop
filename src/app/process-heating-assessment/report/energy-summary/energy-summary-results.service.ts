import { computed, inject, Injectable, Signal } from '@angular/core';
import { ConvertValue } from '../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

/** Typical electricity heating value, 9,800 Btu/kWh, used by legacy for the Electricity row. */
const ELECTRICITY_HEATING_VALUE_BTU_PER_KWH = 9800;

export interface EnergySourceRow {
  name: string;
  energyUsed?: number;
  energyUsedUnit?: string;
  heatingValue?: number;
  heatingValueUnit?: string;
  costPerUnit?: number;
  costUnit?: string;
}

export interface EnergyComparisonRow {
  label: string;
  unit: string;
  calculated?: number;
  metered?: number;
  designed?: number;
}

export interface EnergySummaryUI {
  sources: EnergySourceRow[];
  comparison: EnergyComparisonRow[];
  equipmentNotes?: string;
  operatingConditions?: string;
  energyPerTimeUnit: string;
}

/** Baseline-only energy sources and calculated vs metered vs designed energy comparison. */
@Injectable()
export class EnergySummaryResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);

  readonly energySummaryUI: Signal<EnergySummaryUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const phast = this.assessmentService.scenarioPhastSignal('baseline');
    const results = this.resultsService.getResults(phast, settings);
    if (!results) {
      return undefined;
    }

    const isEaf = settings.furnaceType === 'Electric Arc Furnace (EAF)';
    const energyUsed = this.resultsService.getEnergyUseReportData(phast, results, settings);
    const baseEnergyUnit = energyUsed.baseEnergyUnit ?? this.getBaseEnergyUnit(settings);
    const energyPerMassUnit = energyUsed.energyPerMassUnit ?? this.getEnergyPerMassUnit(settings);
    const energyPerTimeUnit = `${settings.energyResultUnit}/kWh`;
    const energyCostUnit = settings.unitsOfMeasure === 'Metric' ? '/GJ' : '/MMBtu';
    const costs = phast.operatingCosts;
    const eafHourly = results.hourlyEAFResults;

    const sources: EnergySourceRow[] = [
      {
        name: energyUsed.fuelName || 'Fuel',
        energyUsed: energyUsed.fuelEnergyUsed,
        energyUsedUnit: baseEnergyUnit,
        heatingValue: energyUsed.fuelHeatingValue,
        heatingValueUnit: energyPerMassUnit,
        costPerUnit: costs.fuelCost,
        costUnit: energyCostUnit,
      },
    ];
    if (isEaf && eafHourly) {
      sources.push(
        { name: 'Coal Carbon', energyUsed: eafHourly.coalCarbonUsed, energyUsedUnit: baseEnergyUnit, heatingValue: eafHourly.coalHeatingValue, heatingValueUnit: energyPerMassUnit, costPerUnit: costs.coalCarbonCost, costUnit: energyCostUnit },
        { name: 'Electrode', energyUsed: eafHourly.electrodeEnergyUsed, energyUsedUnit: baseEnergyUnit, heatingValue: eafHourly.electrodeHeatingValue, heatingValueUnit: energyPerMassUnit, costPerUnit: costs.electrodeCost, costUnit: energyCostUnit },
        { name: 'Other Fuels', energyUsed: eafHourly.otherFuelUsed, energyUsedUnit: baseEnergyUnit, costPerUnit: costs.otherFuelCost, costUnit: energyCostUnit },
      );
    }
    if (settings.energySourceType === 'Electricity') {
      sources.push({
        name: 'Electricity',
        energyUsed: energyUsed.electricEnergyUsed,
        energyUsedUnit: 'kW',
        heatingValue: new ConvertValue(ELECTRICITY_HEATING_VALUE_BTU_PER_KWH, 'Btu', settings.energyResultUnit).convertedValue,
        heatingValueUnit: energyPerTimeUnit,
        costPerUnit: costs.electricityCost,
        costUnit: '/kWh',
      });
    }
    const metered = this.resultsService.getMeteredEnergyResults(phast, settings);
    const steamHeatingValue = phast.meteredEnergy?.meteredEnergySteam?.totalHeatSteam;
    sources.push({
      name: 'Steam',
      energyUsed: energyUsed.steamEnergyUsed,
      energyUsedUnit: baseEnergyUnit,
      heatingValue: steamHeatingValue,
      heatingValueUnit: energyPerMassUnit,
      costPerUnit: costs.steamCost,
      costUnit: energyCostUnit,
    });

    const calculated = this.resultsService.getCalculatedByPhast(phast, settings);
    const designed = this.resultsService.getDesignedEnergyResults(phast, settings);
    const comparison: EnergyComparisonRow[] = [
      { label: 'Energy Used', unit: baseEnergyUnit, calculated: calculated.fuelEnergyUsed, metered: metered?.metered.hourlyEnergy, designed: designed?.designed.hourlyEnergy },
      { label: 'Energy Intensity for Charge Materials', unit: energyPerMassUnit, calculated: calculated.energyIntensity, metered: metered?.metered.energyIntensity, designed: designed?.designed.energyIntensity },
      { label: 'Auxiliary Electricity Used', unit: 'kW', calculated: calculated.electricityUsed, metered: metered?.metered.hourlyElectricity, designed: designed?.designed.hourlyElectricity },
    ];

    return {
      sources,
      comparison,
      equipmentNotes: phast.equipmentNotes,
      operatingConditions: phast.operatingHours?.operatingConditions,
      energyPerTimeUnit,
    };
  });

  private getBaseEnergyUnit(settings: Settings): string {
    return settings.energyResultUnit !== 'kWh' && settings.energySourceType !== 'Electricity'
      ? `${settings.energyResultUnit}/hr`
      : settings.energyResultUnit;
  }

  private getEnergyPerMassUnit(settings: Settings): string {
    if (settings.energyResultUnit === 'MMBtu') {
      return 'Btu/lb';
    }
    if (settings.energyResultUnit === 'GJ') {
      return 'kJ/kg';
    }
    return `${settings.energyResultUnit}/${settings.unitsOfMeasure === 'Metric' ? 'kg' : 'lb'}`;
  }
}

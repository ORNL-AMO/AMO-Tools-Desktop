import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DryerOperatingCostInput, DryerOperatingCostOutput } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';

// Density of water, lb/gal, used to express water removed as a volume.
const WATER_DENSITY_LB_PER_GAL = 8.345;

@Injectable()
export class ConvertCompressedAirDryerService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  // General-purpose conversion between any two unit systems, used both for one-off
  // default/example generation and for converting already-entered data in place when
  // the global unitsOfMeasure setting changes while a dryerType input already exists.
  convertStoredInput(input: DryerOperatingCostInput, oldUnitsOfMeasure: string, newUnitsOfMeasure: string): DryerOperatingCostInput {
    if (!input || oldUnitsOfMeasure === newUnitsOfMeasure) return input;
    const oldSettings = { unitsOfMeasure: oldUnitsOfMeasure } as Settings;
    const newSettings = { unitsOfMeasure: newUnitsOfMeasure } as Settings;
    const oldFlowUnit = oldUnitsOfMeasure === 'Imperial' ? 'ft3/min' : 'm3/min';
    const newFlowUnit = newUnitsOfMeasure === 'Imperial' ? 'ft3/min' : 'm3/min';
    const oldPowerUnit = oldUnitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
    const newPowerUnit = newUnitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
    let copy: DryerOperatingCostInput = { ...input };
    copy.flowRate = this.roundVal(this.convertUnitsService.convertValue(copy.flowRate, oldFlowUnit, newFlowUnit));
    copy.purgeFlowRate = this.roundVal(this.convertUnitsService.convertValue(copy.purgeFlowRate, oldFlowUnit, newFlowUnit));
    copy.motorPower = this.roundVal(this.convertUnitsService.convertValue(copy.motorPower, oldPowerUnit, newPowerUnit));
    copy.pressure = this.roundVal(this.convertUnitsService.convertPsigAndBargValue(copy.pressure, oldSettings, newSettings));
    copy.temperature = this.roundVal(this.convertUnitsService.convertTemperatureValue(copy.temperature, oldSettings, newSettings));
    copy.costOfCompressedAir = this.roundVal(this.convertUnitsService.convertDollarsPerFt3AndM3(copy.costOfCompressedAir, oldSettings, newSettings));
    copy.costOfCoolingWater = this.roundVal(this.convertUnitsService.convertDollarsPerGalAndLiter(copy.costOfCoolingWater, oldSettings, newSettings));
    return copy;
  }

  // Metric-entered values -> Imperial, the unit system the calculation engine always expects.
  convertInputsToImperial(input: DryerOperatingCostInput, settings: Settings): DryerOperatingCostInput {
    return this.convertStoredInput(input, settings.unitsOfMeasure, 'Imperial');
  }

  // Imperial defaults/examples -> Metric, for display when the app is in Metric mode.
  convertDefaultsToMetric(input: DryerOperatingCostInput, settings: Settings): DryerOperatingCostInput {
    if (settings.unitsOfMeasure === 'Imperial') return input;
    return this.convertStoredInput(input, 'Imperial', settings.unitsOfMeasure);
  }

  // Imperial calculation output -> display units. Water removed volume is derived in gal/hr from the
  // Suite's lb/hr before any Metric conversion, so both unit systems use the same density.
  convertOutputForDisplay(output: DryerOperatingCostOutput, settings: Settings): DryerOperatingCostOutput {
    if (!output) return output;
    let copy: DryerOperatingCostOutput = { ...output };
    copy.waterRemovedVolume = copy.waterRemoved / WATER_DENSITY_LB_PER_GAL;
    if (settings.unitsOfMeasure === 'Imperial') return copy;
    copy.waterRemovedVolume = this.convertUnitsService.convertValue(copy.waterRemovedVolume, 'gal', 'L');
    copy.waterRemoved = this.convertUnitsService.convertLbAndKgValue(copy.waterRemoved, { ...settings, unitsOfMeasure: 'Imperial' }, settings);
    copy.purgeFlowRate = this.convertUnitsService.convertValue(copy.purgeFlowRate, 'ft3/min', 'm3/min');
    copy.motorPower = this.convertUnitsService.convertValue(copy.motorPower, 'hp', 'kW');
    return copy;
  }

  // Imperial-based validator bounds, converted to Metric equivalents when needed.
  getValidatorRanges(settings: Settings): {
    flowRate: { min: number, max: number },
    pressure: { min: number, max: number },
    temperature: { min: number, max: number },
    costOfElectricity: { min: number, max: number },
    costOfCompressedAir: { min: number, max: number },
    costOfCoolingWater: { min: number, max: number },
    heaterPower: { min: number, max: number },
    heatingHoursPerDay: { min: number, max: number },
    purgeRate: { min: number, max: number },
    purgeFlowRate: { min: number, max: number },
    motorPower: { min: number, max: number },
  } {
    const heaterPower = { min: 0, max: 1000 };
    const heatingHoursPerDay = { min: 0, max: 24 };
    const purgeRate = { min: 0, max: 100 };
    if (settings.unitsOfMeasure === 'Imperial') {
      return {
        flowRate: { min: 1, max: 50000 },
        pressure: { min: 25, max: 150 },
        temperature: { min: 50, max: 120 },
        costOfElectricity: { min: 0.01, max: 0.20 },
        costOfCompressedAir: { min: 0.20, max: 0.50 },
        costOfCoolingWater: { min: 0.25, max: 10.00 },
        heaterPower,
        heatingHoursPerDay,
        purgeRate,
        purgeFlowRate: { min: 0, max: 50000 },
        motorPower: { min: 0, max: 1000 },
      };
    }
    const imperialOverride: Settings = { ...settings, unitsOfMeasure: 'Imperial' };
    return {
      flowRate: {
        min: this.roundVal(this.convertUnitsService.convertValue(1, 'ft3/min', 'm3/min')),
        max: this.roundVal(this.convertUnitsService.convertValue(50000, 'ft3/min', 'm3/min')),
      },
      pressure: {
        min: this.roundVal(this.convertUnitsService.convertPsigAndBargValue(25, imperialOverride, settings)),
        max: this.roundVal(this.convertUnitsService.convertPsigAndBargValue(150, imperialOverride, settings)),
      },
      temperature: {
        min: this.roundVal(this.convertUnitsService.convertTemperatureValue(50, imperialOverride, settings)),
        max: this.roundVal(this.convertUnitsService.convertTemperatureValue(120, imperialOverride, settings)),
      },
      costOfElectricity: { min: 0.01, max: 0.20 },
      costOfCompressedAir: {
        min: this.roundVal(this.convertUnitsService.convertDollarsPerFt3AndM3(0.20, imperialOverride, settings)),
        max: this.roundVal(this.convertUnitsService.convertDollarsPerFt3AndM3(0.50, imperialOverride, settings)),
      },
      costOfCoolingWater: {
        min: this.roundVal(this.convertUnitsService.convertDollarsPerGalAndLiter(0.25, imperialOverride, settings)),
        max: this.roundVal(this.convertUnitsService.convertDollarsPerGalAndLiter(10.00, imperialOverride, settings)),
      },
      heaterPower,
      heatingHoursPerDay,
      purgeRate,
      purgeFlowRate: {
        min: 0,
        max: this.roundVal(this.convertUnitsService.convertValue(50000, 'ft3/min', 'm3/min')),
      },
      motorPower: {
        min: 0,
        max: this.roundVal(this.convertUnitsService.convertValue(1000, 'hp', 'kW')),
      },
    };
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }
}

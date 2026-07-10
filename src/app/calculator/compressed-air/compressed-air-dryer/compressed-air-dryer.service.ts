import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';
import { ConvertCompressedAirDryerService } from './convert-compressed-air-dryer.service';

@Injectable()
export class CompressedAirDryerService {
  baselineInput: DryerOperatingCostInput;
  modificationInput: DryerOperatingCostInput;
  lastUnitsOfMeasure: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private compressedAirDryersSuiteApiService: CompressedAirDryersSuiteApiService,
    private convertCompressedAirDryerService: ConvertCompressedAirDryerService,
  ) { }

  initObject(settings: Settings): DryerOperatingCostInput {
    let input: DryerOperatingCostInput = {
      dryerType: DryerType.Heatless,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      operatingHoursPerDay: 16,
      operatingDaysPerWeek: 5,
      operatingWeeksPerYear: 50,
      costOfElectricity: settings?.electricityCost ?? 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.50,
      heaterPower: 0,
      heatingHoursPerDay: 0,
      purgeRate: 0,
      designDDCPercentage: 0,
    };
    return settings ? this.convertCompressedAirDryerService.convertDefaultsToMetric(input, settings) : input;
  }

  generateExample(settings: Settings): DryerOperatingCostInput {
    let input: DryerOperatingCostInput = {
      dryerType: DryerType.Heatless,
      flowRate: 500,
      pressure: 100,
      temperature: 70,
      operatingHoursPerDay: 24,
      operatingDaysPerWeek: 7,
      operatingWeeksPerYear: 52,
      costOfElectricity: settings?.electricityCost ?? 0.066,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.50,
      heaterPower: 0,
      heatingHoursPerDay: 0,
      purgeRate: 0,
      designDDCPercentage: 0,
    };
    return settings ? this.convertCompressedAirDryerService.convertDefaultsToMetric(input, settings) : input;
  }

  getFormFromObj(inputObj: DryerOperatingCostInput, settings: Settings): UntypedFormGroup {
    const ranges = this.convertCompressedAirDryerService.getValidatorRanges(settings);
    return this.formBuilder.group({
      dryerType:            [inputObj.dryerType, [Validators.required]],
      flowRate:             [inputObj.flowRate, [Validators.required, Validators.min(ranges.flowRate.min), Validators.max(ranges.flowRate.max)]],
      pressure:             [inputObj.pressure, [Validators.required, Validators.min(ranges.pressure.min), Validators.max(ranges.pressure.max)]],
      temperature:          [inputObj.temperature, [Validators.required, Validators.min(ranges.temperature.min), Validators.max(ranges.temperature.max)]],
      operatingHoursPerDay: [inputObj.operatingHoursPerDay, [Validators.required, Validators.min(1), Validators.max(24)]],
      operatingDaysPerWeek: [inputObj.operatingDaysPerWeek, [Validators.required, Validators.min(1), Validators.max(7)]],
      operatingWeeksPerYear:[inputObj.operatingWeeksPerYear, [Validators.required, Validators.min(1), Validators.max(52)]],
      costOfElectricity:    [inputObj.costOfElectricity, [Validators.required, Validators.min(ranges.costOfElectricity.min), Validators.max(ranges.costOfElectricity.max)]],
      costOfCompressedAir:  [inputObj.costOfCompressedAir, [Validators.required, Validators.min(ranges.costOfCompressedAir.min), Validators.max(ranges.costOfCompressedAir.max)]],
      costOfCoolingWater:   [inputObj.costOfCoolingWater, [Validators.required, Validators.min(ranges.costOfCoolingWater.min), Validators.max(ranges.costOfCoolingWater.max)]],
    });
  }

  getObjFromForm(form: UntypedFormGroup): DryerOperatingCostInput {
    return {
      dryerType:            form.controls.dryerType.value,
      flowRate:             form.controls.flowRate.value,
      pressure:             form.controls.pressure.value,
      temperature:          form.controls.temperature.value,
      operatingHoursPerDay: form.controls.operatingHoursPerDay.value,
      operatingDaysPerWeek: form.controls.operatingDaysPerWeek.value,
      operatingWeeksPerYear:form.controls.operatingWeeksPerYear.value,
      costOfElectricity:    form.controls.costOfElectricity.value,
      costOfCompressedAir:  form.controls.costOfCompressedAir.value,
      costOfCoolingWater:   form.controls.costOfCoolingWater.value,
      // heaterPower, heatingHoursPerDay, purgeRate, and designDDCPercentage are always
      // left at 0 so the engine auto-calculates them per dryerType; results-only, not user inputs.
      heaterPower:          0,
      heatingHoursPerDay:   0,
      purgeRate:            0,
      designDDCPercentage:  0,
    };
  }

  calculate(input: DryerOperatingCostInput, settings: Settings): DryerOperatingCostOutput {
    const imperialInput = this.convertCompressedAirDryerService.convertInputsToImperial(input, settings);
    const output = this.compressedAirDryersSuiteApiService.dryerOperatingCost(imperialInput);
    return this.convertCompressedAirDryerService.convertOutputToMetric(output, settings);
  }

  // Converts already-entered baseline/modification data in place when the global
  // unitsOfMeasure setting has changed since this input was last touched, so returning
  // to the calculator shows re-converted values rather than stale numbers under new unit labels.
  convertStoredInputsForUnitChange(settings: Settings): void {
    if (!this.lastUnitsOfMeasure || this.lastUnitsOfMeasure === settings.unitsOfMeasure) return;
    if (this.baselineInput) {
      this.baselineInput = this.convertCompressedAirDryerService.convertStoredInput(this.baselineInput, this.lastUnitsOfMeasure, settings.unitsOfMeasure);
    }
    if (this.modificationInput) {
      this.modificationInput = this.convertCompressedAirDryerService.convertStoredInput(this.modificationInput, this.lastUnitsOfMeasure, settings.unitsOfMeasure);
    }
  }
}

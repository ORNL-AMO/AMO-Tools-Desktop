import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';

@Injectable()
export class CompressedAirDryerService {
  baselineInput: DryerOperatingCostInput;
  modificationInput: DryerOperatingCostInput;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private compressedAirDryersSuiteApiService: CompressedAirDryersSuiteApiService,
  ) { }

  initObject(settings: Settings): DryerOperatingCostInput {
    return {
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
  }

  generateExample(settings: Settings): DryerOperatingCostInput {
    return {
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
  }

  getFormFromObj(inputObj: DryerOperatingCostInput): UntypedFormGroup {
    return this.formBuilder.group({
      dryerType:            [inputObj.dryerType, [Validators.required]],
      flowRate:             [inputObj.flowRate, [Validators.required, Validators.min(1), Validators.max(50000)]],
      pressure:             [inputObj.pressure, [Validators.required, Validators.min(25), Validators.max(150)]],
      temperature:          [inputObj.temperature, [Validators.required, Validators.min(50), Validators.max(120)]],
      operatingHoursPerDay: [inputObj.operatingHoursPerDay, [Validators.required, Validators.min(1), Validators.max(24)]],
      operatingDaysPerWeek: [inputObj.operatingDaysPerWeek, [Validators.required, Validators.min(1), Validators.max(7)]],
      operatingWeeksPerYear:[inputObj.operatingWeeksPerYear, [Validators.required, Validators.min(1), Validators.max(52)]],
      costOfElectricity:    [inputObj.costOfElectricity, [Validators.required, Validators.min(0.01), Validators.max(0.20)]],
      costOfCompressedAir:  [inputObj.costOfCompressedAir, [Validators.required, Validators.min(0.20), Validators.max(0.50)]],
      costOfCoolingWater:   [inputObj.costOfCoolingWater, [Validators.required, Validators.min(0.25), Validators.max(10.00)]],
      heaterPower:          [inputObj.heaterPower, [Validators.min(0), Validators.max(1000)]],
      heatingHoursPerDay:   [inputObj.heatingHoursPerDay, [Validators.min(0), Validators.max(24)]],
      purgeRate:            [inputObj.purgeRate, [Validators.min(0), Validators.max(100)]],
      designDDCPercentage:  [inputObj.designDDCPercentage, [Validators.min(0), Validators.max(100)]],
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
      heaterPower:          form.controls.heaterPower.value,
      heatingHoursPerDay:   form.controls.heatingHoursPerDay.value,
      purgeRate:            form.controls.purgeRate.value,
      designDDCPercentage:  form.controls.designDDCPercentage.value,
    };
  }

  calculate(input: DryerOperatingCostInput): DryerOperatingCostOutput {
    return this.compressedAirDryersSuiteApiService.dryerOperatingCost(input);
  }
}

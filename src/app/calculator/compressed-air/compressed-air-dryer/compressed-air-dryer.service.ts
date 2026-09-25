import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType, PurgeInputMode } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';
import { ConvertCompressedAirDryerService } from './convert-compressed-air-dryer.service';
import { DryerTypeConfig, getDryerTypeConfig, getDryerTypeDefaults } from './compressed-air-dryer-type-config';

export type DryerSizingSelection = 'auto' | 'manual';

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

  getTypeConfig(dryerType: DryerType): DryerTypeConfig {
    return getDryerTypeConfig(dryerType);
  }

  getTypeDefaults(dryerType: DryerType): Partial<DryerOperatingCostInput> {
    return getDryerTypeDefaults(dryerType);
  }

  initObject(settings: Settings, operatingHours?: OperatingHours): DryerOperatingCostInput {
    const dryerType = DryerType.Heatless;
    let input: DryerOperatingCostInput = {
      dryerType,
      annualOperatingHours: operatingHours?.hoursPerYear ?? 4000,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      costOfElectricity: settings?.electricityCost ?? 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.50,
      ...this.getTypeDefaults(dryerType),
    } as DryerOperatingCostInput;
    return settings ? this.convertCompressedAirDryerService.convertDefaultsToMetric(input, settings) : input;
  }

  generateExample(settings: Settings): DryerOperatingCostInput {
    const dryerType = DryerType.Heatless;
    let input: DryerOperatingCostInput = {
      dryerType,
      annualOperatingHours: 8736,
      flowRate: 500,
      pressure: 100,
      temperature: 70,
      costOfElectricity: settings?.electricityCost ?? 0.066,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.50,
      ...this.getTypeDefaults(dryerType),
    } as DryerOperatingCostInput;
    return settings ? this.convertCompressedAirDryerService.convertDefaultsToMetric(input, settings) : input;
  }

  getFormFromObj(inputObj: DryerOperatingCostInput, settings: Settings): UntypedFormGroup {
    const ranges = this.convertCompressedAirDryerService.getValidatorRanges(settings);
    const form = this.formBuilder.group({
      dryerType:               [inputObj.dryerType, [Validators.required]],
      annualOperatingHours:    [inputObj.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      flowRate:                [inputObj.flowRate, [Validators.required, Validators.min(ranges.flowRate.min), Validators.max(ranges.flowRate.max)]],
      pressure:                [inputObj.pressure, [Validators.required, Validators.min(ranges.pressure.min), Validators.max(ranges.pressure.max)]],
      temperature:             [inputObj.temperature, [Validators.required, Validators.min(ranges.temperature.min), Validators.max(ranges.temperature.max)]],
      costOfElectricity:       [inputObj.costOfElectricity, [Validators.required, Validators.min(ranges.costOfElectricity.min), Validators.max(ranges.costOfElectricity.max)]],
      costOfCompressedAir:     [inputObj.costOfCompressedAir, [Validators.required, Validators.min(ranges.costOfCompressedAir.min), Validators.max(ranges.costOfCompressedAir.max)]],
      costOfCoolingWater:      [inputObj.costOfCoolingWater, [Validators.required, Validators.min(ranges.costOfCoolingWater.min), Validators.max(ranges.costOfCoolingWater.max)]],
      purgeInputMode:          [inputObj.purgeInputMode ?? PurgeInputMode.PercentOfDryerCapacity, [Validators.required]],
      purgeRate:               [inputObj.purgeRate, [Validators.required, Validators.min(ranges.purgeRate.min), Validators.max(ranges.purgeRate.max)]],
      purgeFlowRate:           [inputObj.purgeFlowRate, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.purgeFlowRate.max)]],
      // Heater/motor modes are form-only: the Suite treats a zero power as "size automatically".
      heaterMode:              [inputObj.heaterPower > 0 ? 'manual' : 'auto'],
      heaterPower:             [inputObj.heaterPower, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.heaterPower.max)]],
      heatingHoursPerDay:      [inputObj.heatingHoursPerDay, [Validators.required, Validators.min(ranges.heatingHoursPerDay.min), Validators.max(ranges.heatingHoursPerDay.max)]],
      motorMode:               [inputObj.motorPower > 0 ? 'manual' : 'auto'],
      motorPower:              [inputObj.motorPower, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.motorPower.max)]],
      designDDCPercentage:     [inputObj.designDDCPercentage, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      regenerationCycleLength: [inputObj.regenerationCycleLength, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(24)]],
    });
    this.setConditionalControls(form);
    return form;
  }

  // Resets type-specific assumptions and auto/manual modes; shared operating and utility values are kept.
  applyTypeDefaults(form: UntypedFormGroup): void {
    const defaults = this.getTypeDefaults(form.controls.dryerType.value);
    form.patchValue({ ...defaults, heaterMode: 'auto', motorMode: 'auto' }, { emitEvent: false });
    this.setConditionalControls(form);
  }

  // Disabled controls are hidden in the template and skipped by form validation.
  setConditionalControls(form: UntypedFormGroup): void {
    const config = this.getTypeConfig(form.controls.dryerType.value);
    const hasPurge = config.purgeRate !== null;
    const isDirectFlow = form.controls.purgeInputMode.value === PurgeInputMode.DirectFlow;
    const heaterSelectable = config.heater === 'autoManual';
    const motorSelectable = config.motor === 'autoManual';

    this.setEnabled(form.controls.costOfCoolingWater, config.showCoolingWater);
    this.setEnabled(form.controls.purgeInputMode, hasPurge);
    this.setEnabled(form.controls.purgeRate, hasPurge && !isDirectFlow);
    this.setEnabled(form.controls.purgeFlowRate, hasPurge && isDirectFlow);
    this.setEnabled(form.controls.heaterMode, heaterSelectable);
    this.setEnabled(form.controls.heaterPower, heaterSelectable && form.controls.heaterMode.value === 'manual');
    this.setEnabled(form.controls.heatingHoursPerDay, config.heatingHoursPerDay !== null);
    this.setEnabled(form.controls.motorMode, motorSelectable);
    this.setEnabled(form.controls.motorPower, motorSelectable && form.controls.motorMode.value === 'manual');
    this.setEnabled(form.controls.designDDCPercentage, config.designDDCPercentage !== null);
    this.setEnabled(form.controls.regenerationCycleLength, config.regenerationCycleLength !== null);
  }

  private setEnabled(control: AbstractControl, enabled: boolean): void {
    if (enabled && control.disabled) {
      control.enable({ emitEvent: false });
    } else if (!enabled && control.enabled) {
      control.disable({ emitEvent: false });
    }
  }

  getObjFromForm(form: UntypedFormGroup): DryerOperatingCostInput {
    const controls = form.controls;
    // Inactive type-specific fields send 0; the cooling-water rate is a shared utility value and is always kept.
    const activeValue = (name: string): number => controls[name].enabled ? controls[name].value : 0;
    return {
      dryerType:               controls.dryerType.value,
      annualOperatingHours:    controls.annualOperatingHours.value,
      flowRate:                controls.flowRate.value,
      pressure:                controls.pressure.value,
      temperature:             controls.temperature.value,
      costOfElectricity:       controls.costOfElectricity.value,
      costOfCompressedAir:     controls.costOfCompressedAir.value,
      costOfCoolingWater:      controls.costOfCoolingWater.value,
      purgeInputMode:          controls.purgeInputMode.enabled ? controls.purgeInputMode.value : PurgeInputMode.PercentOfDryerCapacity,
      purgeRate:               activeValue('purgeRate'),
      purgeFlowRate:           activeValue('purgeFlowRate'),
      heaterPower:             activeValue('heaterPower'),
      heatingHoursPerDay:      activeValue('heatingHoursPerDay'),
      motorPower:              activeValue('motorPower'),
      designDDCPercentage:     activeValue('designDDCPercentage'),
      regenerationCycleLength: activeValue('regenerationCycleLength'),
    };
  }

  calculate(input: DryerOperatingCostInput, settings: Settings): DryerOperatingCostOutput {
    const imperialInput = this.convertCompressedAirDryerService.convertInputsToImperial(input, settings);
    const output = this.compressedAirDryersSuiteApiService.dryerOperatingCost(imperialInput);
    return this.convertCompressedAirDryerService.convertOutputForDisplay(output, settings);
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

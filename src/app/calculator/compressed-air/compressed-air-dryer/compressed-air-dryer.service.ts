import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
    return this.getExampleInput({
      dryerType: DryerType.Heatless,
      flowRate: 1752,
      pressure: 50,
      temperature: 100,
      costOfElectricity: 0.08,
      costOfCompressedAir: 0.20,
      costOfCoolingWater: 0.25,
    }, settings);
  }

  generateExampleModification(settings: Settings): DryerOperatingCostInput {
    return this.getExampleInput({
      dryerType: DryerType.Refrigerated,
      flowRate: 500,
      pressure: 100,
      temperature: 70,
      costOfElectricity: 0.066,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.25,
    }, settings);
  }

  // Example values are Imperial; type-specific assumptions use the dryer type's defaults.
  private getExampleInput(values: Pick<DryerOperatingCostInput, 'dryerType' | 'flowRate' | 'pressure' | 'temperature'
    | 'costOfElectricity' | 'costOfCompressedAir' | 'costOfCoolingWater'>, settings: Settings): DryerOperatingCostInput {
    const input: DryerOperatingCostInput = {
      ...values,
      annualOperatingHours: 8736,
      ...this.getTypeDefaults(values.dryerType),
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
      costOfElectricity:       [inputObj.costOfElectricity, [Validators.required, Validators.min(0)]],
      costOfCompressedAir:     [inputObj.costOfCompressedAir, [Validators.required, Validators.min(0)]],
      costOfCoolingWater:      [inputObj.costOfCoolingWater, [Validators.required, Validators.min(0)]],
      purgeInputMode:          [inputObj.purgeInputMode ?? PurgeInputMode.PercentOfDryerCapacity, [Validators.required]],
      purgeRate:               [inputObj.purgeRate, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.purgeRate.max)]],
      purgeFlowRate:           [inputObj.purgeFlowRate, [Validators.required, GreaterThanValidator.greaterThan(0), this.maxFlowRateValidator]],
      // Heater/motor modes are form-only: the Suite treats a zero power as "size automatically".
      heaterMode:              [inputObj.heaterPower > 0 ? 'manual' : 'auto'],
      heaterPower:             [inputObj.heaterPower, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.heaterPower.max)]],
      heatingHoursPerDay:      [inputObj.heatingHoursPerDay, [Validators.required, Validators.min(ranges.heatingHoursPerDay.min), Validators.max(ranges.heatingHoursPerDay.max)]],
      motorMode:               [inputObj.motorPower > 0 ? 'manual' : 'auto'],
      motorPower:              [inputObj.motorPower, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(ranges.motorPower.max)]],
      designDDCPercentage:     [inputObj.designDDCPercentage, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      regenerationCycleLength: [inputObj.regenerationCycleLength, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(24)]],
    });
    // The flow rate limit reads the sibling control, which doesn't exist until the group is built.
    form.controls.purgeFlowRate.updateValueAndValidity({ emitEvent: false });
    this.setConditionalControls(form);
    return form;
  }

  // Purge air can't exceed the air entering the dryer.
  private maxFlowRateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const flowRate = control.parent?.get('flowRate')?.value;
    return flowRate === null || flowRate === undefined ? null : Validators.max(flowRate)(control);
  };

  // Re-checks purge flow against a changed flow rate and shows the error if it now exceeds it.
  validatePurgeFlowRate(form: UntypedFormGroup): void {
    const purgeFlowRate = form.controls.purgeFlowRate;
    purgeFlowRate.updateValueAndValidity({ emitEvent: false });
    if (purgeFlowRate.enabled && purgeFlowRate.invalid) {
      purgeFlowRate.markAsDirty();
    }
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
    if (!input || !this.getFormFromObj(input, settings).valid) {
      return this.getEmptyOutput();
    }
    const imperialInput = this.convertCompressedAirDryerService.convertInputsToImperial(input, settings);
    const output = this.compressedAirDryersSuiteApiService.dryerOperatingCost(imperialInput);
    return this.convertCompressedAirDryerService.convertOutputForDisplay(output, settings);
  }

  getEmptyOutput(): DryerOperatingCostOutput {
    return {
      waterRemoved: 0,
      waterRemovedVolume: 0,
      totalCostPerYear: 0,
      heaterPower: 0,
      heatingHoursPerDay: 0,
      purgeRate: 0,
      designDDCPercentage: 0,
      purgeFlowRate: 0,
      motorPower: 0,
      regenerationCycleLength: 0,
    };
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

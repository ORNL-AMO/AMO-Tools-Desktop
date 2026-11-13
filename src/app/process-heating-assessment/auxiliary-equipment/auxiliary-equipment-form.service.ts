import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';

export type MultimeterForm = FormGroup<{
  numberOfPhases: FormControl<number | null>;
  supplyVoltage: FormControl<number | null>;
  averageCurrent: FormControl<number | null>;
  powerFactor: FormControl<number | null>;
}>;

export type NameplateForm = FormGroup<{
  ratedMotorPower: FormControl<number | null>;
  variableSpeedMotor: FormControl<boolean>;
  operationalFrequency: FormControl<number | null>;
  lineFrequency: FormControl<number | null>;
  motorAndDriveEfficiency: FormControl<number | null>;
  loadFactor: FormControl<number | null>;
}>;

export type AuxiliaryEquipmentForm = FormGroup<{
  operatingHours: FormControl<number | null>;
  measurementMethod: FormControl<AuxiliaryEquipmentMeasurementMethod>;
  multimeterData: MultimeterForm;
  nameplateData: NameplateForm;
  powerMeterData: FormGroup<{ power: FormControl<number | null> }>;
  otherMethodData: FormGroup<{ energy: FormControl<number | null> }>;
  units: FormControl<number | null>;
  userSelectedHP: FormControl<boolean>;
}>;

/** Annual hours in a year, the most an item can run. */
const HOURS_PER_YEAR = 8760;

/**
 * Starting values for a new item, matching the Electricity Reduction calculator defaults.
 * @param hoursPerYear the scenario's annual operating hours
 * @param isImperial whether nameplate power starts in hp (otherwise kW)
 * @returns item values without id or name
 */
export function newAuxiliaryEquipmentItem(hoursPerYear: number, isImperial: boolean): Omit<AuxiliaryEquipmentItem, 'id' | 'name'> {
  return {
    operatingHours: hoursPerYear,
    measurementMethod: AuxiliaryEquipmentMeasurementMethod.MULTIMETER,
    multimeterData: { numberOfPhases: 3, supplyVoltage: 0, averageCurrent: 0, powerFactor: 0.85 },
    nameplateData: {
      // 200 hp, or its kW equivalent
      ratedMotorPower: isImperial ? 200 : 149.14,
      variableSpeedMotor: true,
      operationalFrequency: 50,
      lineFrequency: 60,
      motorAndDriveEfficiency: 100,
      loadFactor: 10,
    },
    powerMeterData: { power: 50 },
    otherMethodData: { energy: 400000 },
    units: 1,
    userSelectedHP: isImperial,
  };
}

@Injectable()
export class AuxiliaryEquipmentFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * Only the measurement method's own inputs are enabled, so validity covers just what the selected method uses;
   * the other methods' values are kept for switching back.
   * @param item saved or new item
   * @returns the item's form
   */
  getForm(item: Omit<AuxiliaryEquipmentItem, 'id' | 'name'>): AuxiliaryEquipmentForm {
    const form: AuxiliaryEquipmentForm = this.fb.group({
      operatingHours: [item.operatingHours ?? null, [Validators.required, Validators.min(0), Validators.max(HOURS_PER_YEAR)]],
      measurementMethod: this.fb.nonNullable.control<AuxiliaryEquipmentMeasurementMethod>(
        (item.measurementMethod ?? AuxiliaryEquipmentMeasurementMethod.MULTIMETER) as AuxiliaryEquipmentMeasurementMethod),
      multimeterData: this.fb.group({
        numberOfPhases: [item.multimeterData?.numberOfPhases ?? null, Validators.required],
        supplyVoltage: [item.multimeterData?.supplyVoltage ?? null, [Validators.required, Validators.min(0)]],
        averageCurrent: [item.multimeterData?.averageCurrent ?? null, [Validators.required, Validators.min(0)]],
        powerFactor: [item.multimeterData?.powerFactor ?? null, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(1)]],
      }),
      nameplateData: this.fb.group({
        ratedMotorPower: [item.nameplateData?.ratedMotorPower ?? null, [Validators.required, Validators.min(0)]],
        variableSpeedMotor: this.fb.nonNullable.control(item.nameplateData?.variableSpeedMotor ?? false),
        operationalFrequency: [item.nameplateData?.operationalFrequency ?? null, [Validators.required, Validators.min(0)]],
        lineFrequency: [item.nameplateData?.lineFrequency ?? null, Validators.required],
        motorAndDriveEfficiency: [item.nameplateData?.motorAndDriveEfficiency ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
        loadFactor: [item.nameplateData?.loadFactor ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      }),
      powerMeterData: this.fb.group({
        power: [item.powerMeterData?.power ?? null, [Validators.required, Validators.min(0)]],
      }),
      otherMethodData: this.fb.group({
        energy: [item.otherMethodData?.energy ?? null, [Validators.required, Validators.min(0)]],
      }),
      units: [item.units ?? null, [Validators.required, Validators.min(1)]],
      userSelectedHP: this.fb.nonNullable.control(item.userSelectedHP ?? false),
    });
    this.setEnabledControls(form);
    // Runs before the form's own valueChanges, so a save triggered by the switch sees the updated validity.
    form.controls.measurementMethod.valueChanges.subscribe(() => this.setEnabledControls(form));
    form.controls.nameplateData.controls.variableSpeedMotor.valueChanges.subscribe(() => this.setEnabledControls(form));
    return form;
  }

  /**
   * @param form item form
   * @returns the item's saved values; without a variable speed motor the motor runs at line frequency
   */
  buildItem(form: AuxiliaryEquipmentForm): Omit<AuxiliaryEquipmentItem, 'id' | 'name'> {
    const values = form.getRawValue();
    const nameplate = values.nameplateData;
    return {
      operatingHours: values.operatingHours ?? undefined,
      measurementMethod: values.measurementMethod,
      multimeterData: {
        numberOfPhases: values.multimeterData.numberOfPhases ?? undefined,
        supplyVoltage: values.multimeterData.supplyVoltage ?? undefined,
        averageCurrent: values.multimeterData.averageCurrent ?? undefined,
        powerFactor: values.multimeterData.powerFactor ?? undefined,
      },
      nameplateData: {
        ratedMotorPower: nameplate.ratedMotorPower ?? undefined,
        variableSpeedMotor: nameplate.variableSpeedMotor,
        operationalFrequency: (nameplate.variableSpeedMotor ? nameplate.operationalFrequency : nameplate.lineFrequency) ?? undefined,
        lineFrequency: nameplate.lineFrequency ?? undefined,
        motorAndDriveEfficiency: nameplate.motorAndDriveEfficiency ?? undefined,
        loadFactor: nameplate.loadFactor ?? undefined,
      },
      powerMeterData: { power: values.powerMeterData.power ?? undefined },
      otherMethodData: { energy: values.otherMethodData.energy ?? undefined },
      units: values.units ?? undefined,
      userSelectedHP: values.userSelectedHP,
    };
  }

  /**
   * @param item saved item
   * @returns whether the item has everything its measurement method needs
   */
  isValid(item: AuxiliaryEquipmentItem): boolean {
    return this.getForm(item).valid;
  }

  private setEnabledControls(form: AuxiliaryEquipmentForm): void {
    const method = form.controls.measurementMethod.value;
    const { multimeterData, nameplateData, powerMeterData, otherMethodData, units } = form.controls;
    setEnabled(multimeterData, method === AuxiliaryEquipmentMeasurementMethod.MULTIMETER);
    setEnabled(nameplateData, method === AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
    setEnabled(powerMeterData, method === AuxiliaryEquipmentMeasurementMethod.POWER_METER);
    setEnabled(otherMethodData, method === AuxiliaryEquipmentMeasurementMethod.OTHER);
    setEnabled(units, method !== AuxiliaryEquipmentMeasurementMethod.OTHER);
    if (nameplateData.enabled) {
      setEnabled(nameplateData.controls.operationalFrequency, nameplateData.controls.variableSpeedMotor.value);
    }
  }
}

function setEnabled(control: AbstractControl, enabled: boolean): void {
  if (enabled) {
    control.enable({ emitEvent: false });
  } else {
    control.disable({ emitEvent: false });
  }
}

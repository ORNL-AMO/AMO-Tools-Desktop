import { Injectable } from '@angular/core';
import { MotorItem } from '../../motor-inventory.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SuiteDbMotor } from '../../../shared/models/materials';
import { motorEfficiencyConstants } from '../../../psat/psatConstants';

@Injectable()
export class MotorCatalogService {

  selectedDepartmentId: BehaviorSubject<string>;
  constructor(private formBuilder: FormBuilder) {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
  }

  getFormFromMotorItem(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      id: [motorItem.id],
      departmentId: [motorItem.departmentId],
      suiteDbItemId: [motorItem.suiteDbItemId],
      name: [motorItem.name],
      motorRpm: [motorItem.motorRpm, [Validators.required]],
      description: [motorItem.description, [Validators.required]],
      lineFrequency: [motorItem.lineFrequency, [Validators.required]],
      ratedMotorPower: [motorItem.ratedMotorPower, [Validators.required]],
      efficiencyClass: [motorItem.efficiencyClass, [Validators.required]],
      nominalEfficiency: [motorItem.nominalEfficiency, [Validators.required]],
      ratedVoltage: [motorItem.ratedVoltage, [Validators.required]],
      fullLoadAmps: [motorItem.fullLoadAmps, [Validators.required]],
      annualOperatingHours: [motorItem.annualOperatingHours, [Validators.required]],
      percentLoad: [motorItem.percentLoad, [Validators.required]],
      driveType: [motorItem.driveType],
      isVFD: [motorItem.isVFD],
      hasLoggerData: [motorItem.hasLoggerData],
      frameType: [motorItem.frameType],
      numberOfPhases: [motorItem.numberOfPhases],

      motorType: [motorItem.motorType],
      nemaTable: [motorItem.nemaTable],
      poles: [motorItem.poles],
      synchronousSpeed: [motorItem.synchronousSpeed]
    })
  }

  getMotorItemFromForm(form: FormGroup): MotorItem {
    return {
      id: form.controls.id.value,
      departmentId: form.controls.departmentId.value,
      suiteDbItemId: form.controls.suiteDbItemId.value,
      name: form.controls.name.value,
      description: form.controls.description.value,
      lineFrequency: form.controls.lineFrequency.value,
      ratedMotorPower: form.controls.ratedMotorPower.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      nominalEfficiency: form.controls.nominalEfficiency.value,
      ratedVoltage: form.controls.ratedVoltage.value,
      fullLoadAmps: form.controls.fullLoadAmps.value,
      annualOperatingHours: form.controls.annualOperatingHours.value,
      percentLoad: form.controls.percentLoad.value,
      driveType: form.controls.driveType.value,
      isVFD: form.controls.isVFD.value,
      hasLoggerData: form.controls.hasLoggerData.value,
      frameType: form.controls.frameType.value,
      numberOfPhases: form.controls.numberOfPhases.value,
      motorRpm: form.controls.motorRpm.value,
      motorType: form.controls.motorType.value,
      nemaTable: form.controls.nemaTable.value,
      poles: form.controls.poles.value,
      synchronousSpeed: form.controls.synchronousSpeed.value
    }
  }

  setSuiteDbMotorProperties(motor: SuiteDbMotor, form: FormGroup) {
    let efficiencyClass: number;
    if (motor.efficiencyType == 'Energy Efficient') {
      efficiencyClass = 1;
    } else if (motor.efficiencyType == 'Premium Efficiency') {
      efficiencyClass = 2;
    } else if (motor.efficiencyType == 'Standard Efficiency') {
      efficiencyClass = 0;
    }
    // motor.catalog
    form.controls.efficiencyClass.patchValue(efficiencyClass);
    form.controls.ratedMotorPower.patchValue(motor.hp);
    form.controls.lineFrequency.patchValue(motor.hz);
    form.controls.motorType.patchValue(motor.motorType);
    form.controls.nemaTable.patchValue(motor.nemaTable);
    form.controls.nominalEfficiency.patchValue(motor.nominalEfficiency);
    form.controls.poles.patchValue(motor.poles);
    form.controls.synchronousSpeed.patchValue(motor.synchronousSpeed);
    form.controls.ratedVoltage.patchValue(motor.voltageLimit);
  }
}

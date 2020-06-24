import { Injectable } from '@angular/core';
import { MotorItem } from '../../motor-inventory.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class MotorCatalogService {

  constructor(private formBuilder: FormBuilder) { }

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
      numberOfPhases: [motorItem.numberOfPhases]
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
      motorRpm: form.controls.motorRpm.value
    }
  }
}

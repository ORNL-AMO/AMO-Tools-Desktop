import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SuiteDbMotor } from '../../../shared/models/materials';
import { MotorItem } from '../../motor-inventory';

@Injectable()
export class MotorCatalogService {

  selectedDepartmentId: BehaviorSubject<string>;
  selectedMotorItem: BehaviorSubject<MotorItem>;
  constructor(private formBuilder: FormBuilder) {
    this.selectedDepartmentId = new BehaviorSubject<string>(undefined);
    this.selectedMotorItem = new BehaviorSubject<MotorItem>(undefined);
  }

  getRequiredFormFromMotorItem(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      lineFrequency: [motorItem.lineFrequency, [Validators.required]],
      ratedMotorPower: [motorItem.ratedMotorPower, [Validators.required]],
      efficiencyClass: [motorItem.efficiencyClass, [Validators.required]],
      nominalEfficiency: [motorItem.nominalEfficiency, [Validators.required]],
      synchronousSpeed: [motorItem.synchronousSpeed, [Validators.required]]
    })
  }

  getOptionalFormFromMotorItem(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      ratedVoltage: [motorItem.ratedVoltage],
      annualOperatingHours: [motorItem.annualOperatingHours],
      percentLoad: [motorItem.percentLoad],
      driveType: [motorItem.driveType],
      isVFD: [motorItem.isVFD],
      hasLoggerData: [motorItem.hasLoggerData],
      numberOfPhases: [motorItem.numberOfPhases],
      enclosureType: [motorItem.enclosureType],
      poles: [motorItem.poles],
      manufacturer: [motorItem.manufacturer],
      model: [motorItem.model],
      catalogId: [motorItem.catalogId],
      motorType: [motorItem.motorType],
      ratedSpeed: [motorItem.ratedSpeed],
      fullLoadSpeed: [motorItem.fullLoadSpeed],
      frameNumber: [motorItem.frameNumber],
      purpose: [motorItem.purpose],
      uFrame: [motorItem.uFrame],
      cFace: [motorItem.cFace],
      verticalShaft: [motorItem.verticalShaft],
      dFlange: [motorItem.dFlange],
      serviceFactor: [motorItem.serviceFactor],
      insulationClass: [motorItem.insulationClass],
      weight: [motorItem.weight],
      listPrice: [motorItem.listPrice],
      windingResistance: [motorItem.windingResistance],
      warranty: [motorItem.warranty],
      rotorBars: [motorItem.rotorBars],
      statorSlots: [motorItem.statorSlots],
      efficiency75: [motorItem.efficiency75],
      efficiency50: [motorItem.efficiency50],
      efficiency25: [motorItem.efficiency25],
      powerFactor100: [motorItem.powerFactor100],
      powerFactor75: [motorItem.powerFactor75],
      powerFactor50: [motorItem.powerFactor50],
      powerFactor25: [motorItem.powerFactor25],
      torqueFullLoad: [motorItem.torqueFullLoad],
      torqueBreakDown: [motorItem.torqueBreakDown],
      torqueLockedRotor: [motorItem.torqueLockedRotor],
      ampsIdle: [motorItem.ampsIdle],
      ampsLockedRotor: [motorItem.ampsLockedRotor],
      stalledRotorTimeHot: [motorItem.stalledRotorTimeHot],
      stalledRotorTimeCold: [motorItem.stalledRotorTimeCold],
      voltageConnectionType: [motorItem.voltageConnectionType],
      currentType: [motorItem.currentType],
      averageLoadFactor: [motorItem.averageLoadFactor],
      utilizationFactor: [motorItem.utilizationFactor]
    })
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
      frameNumber: [motorItem.frameNumber],
      numberOfPhases: [motorItem.numberOfPhases],
      enclosureType: [motorItem.enclosureType],
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
      frameNumber: form.controls.frameNumber.value,
      numberOfPhases: form.controls.numberOfPhases.value,
      motorRpm: form.controls.motorRpm.value,
      enclosureType: form.controls.enclosureType.value,
      nemaTable: form.controls.nemaTable.value,
      poles: form.controls.poles.value,
      synchronousSpeed: form.controls.synchronousSpeed.value
    }
  }

  setSuiteDbMotorProperties(motor: SuiteDbMotor, form: FormGroup) {
    // let efficiencyClass: number;
    // if (motor.efficiencyType == 'Energy Efficient') {
    //   efficiencyClass = 1;
    // } else if (motor.efficiencyType == 'Premium Efficiency') {
    //   efficiencyClass = 2;
    // } else if (motor.efficiencyType == 'Standard Efficiency') {
    //   efficiencyClass = 0;
    // }
    // motor.catalog
    form.controls.efficiencyClass.patchValue(motor.efficiencyClass);
    form.controls.ratedMotorPower.patchValue(motor.hp);
    form.controls.lineFrequency.patchValue(motor.lineFrequency);
    form.controls.enclosureType.patchValue(motor.enclosureType);
    form.controls.nemaTable.patchValue(motor.nemaTable);
    form.controls.nominalEfficiency.patchValue(motor.nominalEfficiency);
    form.controls.poles.patchValue(motor.poles);
    form.controls.synchronousSpeed.patchValue(motor.synchronousSpeed);
    form.controls.ratedVoltage.patchValue(motor.voltageLimit);
  }
}

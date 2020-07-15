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
      synchronousSpeed: [motorItem.synchronousSpeed, [Validators.required]],
      fullLoadAmps: [motorItem.fullLoadAmps, [Validators.required]]
    });
  }

  updateMotorItemFromRequiredForm(form: FormGroup, motorItem: MotorItem): MotorItem {
    motorItem.lineFrequency = form.controls.lineFrequency.value;
    motorItem.ratedMotorPower = form.controls.ratedMotorPower.value;
    motorItem.efficiencyClass = form.controls.efficiencyClass.value;
    motorItem.nominalEfficiency = form.controls.nominalEfficiency.value;
    motorItem.synchronousSpeed = form.controls.synchronousSpeed.value;
    motorItem.fullLoadAmps = form.controls.fullLoadAmps.value;
    return motorItem;
  }


  getOptionalFormFromMotorItem(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      ratedVoltage: [motorItem.ratedVoltage],
      // annualOperatingHours: [motorItem.annualOperatingHours],
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
      utilizationFactor: [motorItem.utilizationFactor],
    });
  }

  getMotorBasicsForm(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      name: [motorItem.name],
      description: [motorItem.description],
      annualOperatingHours: [motorItem.annualOperatingHours],
    });
  }

  // getFormFromMotorItem(motorItem: MotorItem): FormGroup {
  //   return this.formBuilder.group({
  //     id: [motorItem.id],
  //     departmentId: [motorItem.departmentId],
  //     suiteDbItemId: [motorItem.suiteDbItemId],
  //     name: [motorItem.name],
  //     motorRpm: [motorItem.motorRpm, [Validators.required]],
  //     description: [motorItem.description, [Validators.required]],
  //     lineFrequency: [motorItem.lineFrequency, [Validators.required]],
  //     ratedMotorPower: [motorItem.ratedMotorPower, [Validators.required]],
  //     efficiencyClass: [motorItem.efficiencyClass, [Validators.required]],
  //     nominalEfficiency: [motorItem.nominalEfficiency, [Validators.required]],
  //     ratedVoltage: [motorItem.ratedVoltage, [Validators.required]],
  //     fullLoadAmps: [motorItem.fullLoadAmps, [Validators.required]],
  //     annualOperatingHours: [motorItem.annualOperatingHours, [Validators.required]],
  //     percentLoad: [motorItem.percentLoad, [Validators.required]],
  //     driveType: [motorItem.driveType],
  //     isVFD: [motorItem.isVFD],
  //     hasLoggerData: [motorItem.hasLoggerData],
  //     frameNumber: [motorItem.frameNumber],
  //     numberOfPhases: [motorItem.numberOfPhases],
  //     enclosureType: [motorItem.enclosureType],
  //     nemaTable: [motorItem.nemaTable],
  //     poles: [motorItem.poles],
  //     synchronousSpeed: [motorItem.synchronousSpeed]
  //   })
  // }

  updateMotorItemFromBasicsForm(form: FormGroup, motorItem: MotorItem): MotorItem {
    motorItem.description = form.controls.description.value;
    motorItem.name = form.controls.name.value;
    motorItem.description = form.controls.description.value;
    motorItem.annualOperatingHours = form.controls.annualOperatingHours.value;
    return motorItem;
  }

  updateMotorItemFromOptionalForm(form: FormGroup, motorItem: MotorItem): MotorItem {
    motorItem.ratedVoltage = form.controls.ratedVoltage.value;
    motorItem.percentLoad = form.controls.percentLoad.value;
    motorItem.driveType = form.controls.driveType.value;
    motorItem.isVFD = form.controls.isVFD.value;
    motorItem.hasLoggerData = form.controls.hasLoggerData.value;
    motorItem.numberOfPhases = form.controls.numberOfPhases.value;
    motorItem.enclosureType = form.controls.enclosureType.value;
    motorItem.poles = form.controls.poles.value;
    motorItem.manufacturer = form.controls.manufacturer.value;
    motorItem.model = form.controls.model.value;
    motorItem.catalogId = form.controls.catalogId.value;
    motorItem.motorType = form.controls.motorType.value;
    motorItem.ratedSpeed = form.controls.ratedSpeed.value;
    motorItem.fullLoadSpeed = form.controls.fullLoadSpeed.value;
    motorItem.frameNumber = form.controls.frameNumber.value;
    motorItem.purpose = form.controls.purpose.value;
    motorItem.uFrame = form.controls.uFrame.value;
    motorItem.cFace = form.controls.cFace.value;
    motorItem.verticalShaft = form.controls.verticalShaft.value;
    motorItem.dFlange = form.controls.dFlange.value;
    motorItem.serviceFactor = form.controls.serviceFactor.value;
    motorItem.insulationClass = form.controls.insulationClass.value;
    motorItem.weight = form.controls.weight.value;
    motorItem.listPrice = form.controls.listPrice.value;
    motorItem.windingResistance = form.controls.windingResistance.value;
    motorItem.warranty = form.controls.warranty.value;
    motorItem.rotorBars = form.controls.rotorBars.value;
    motorItem.statorSlots = form.controls.statorSlots.value;
    motorItem.efficiency75 = form.controls.efficiency75.value;
    motorItem.efficiency50 = form.controls.efficiency50.value;
    motorItem.efficiency25 = form.controls.efficiency25.value;
    motorItem.powerFactor100 = form.controls.powerFactor100.value;
    motorItem.powerFactor75 = form.controls.powerFactor75.value;
    motorItem.powerFactor50 = form.controls.powerFactor50.value;
    motorItem.powerFactor25 = form.controls.powerFactor25.value;
    motorItem.torqueFullLoad = form.controls.torqueFullLoad.value;
    motorItem.torqueBreakDown = form.controls.torqueBreakDown.value;
    motorItem.torqueLockedRotor = form.controls.torqueLockedRotor.value;
    motorItem.ampsIdle = form.controls.ampsIdle.value;
    motorItem.ampsLockedRotor = form.controls.ampsLockedRotor.value;
    motorItem.stalledRotorTimeHot = form.controls.stalledRotorTimeHot.value;
    motorItem.stalledRotorTimeCold = form.controls.stalledRotorTimeCold.value;
    motorItem.voltageConnectionType = form.controls.voltageConnectionType.value;
    motorItem.currentType = form.controls.currentType.value;
    motorItem.averageLoadFactor = form.controls.averageLoadFactor.value;
    motorItem.utilizationFactor = form.controls.utilizationFactor.value;
    return motorItem;
  }


  setSuiteDbMotorProperties(motor: SuiteDbMotor, motorItem: MotorItem) {
    motorItem.efficiencyClass = motor.efficiencyClass;
    motorItem.ratedMotorPower = motor.hp;
    motorItem.lineFrequency = motor.lineFrequency;
    motorItem.enclosureType = motor.enclosureType;
    motorItem.nemaTable = motor.nemaTable;
    motorItem.nominalEfficiency = motor.nominalEfficiency;
    motorItem.poles = motor.poles;
    motorItem.synchronousSpeed = motor.synchronousSpeed;
    motorItem.ratedVoltage = motor.voltageLimit;
    return motorItem;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MotorItem, MotorInventoryDepartment, MotorInventoryData, MotorPropertyDisplayOptions } from './motor-inventory';

@Injectable()
export class MotorInventoryService {

  setupTab: BehaviorSubject<string>;
  motorInventoryData: BehaviorSubject<MotorInventoryData>;
  focusedField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  constructor() {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    let inventoryData: MotorInventoryData = this.initInventoryData();
    this.motorInventoryData = new BehaviorSubject<MotorInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initInventoryData(): MotorInventoryData {
    let initialDepartment: MotorInventoryDepartment = this.getNewDepartment(1);
    let displayOptions: MotorPropertyDisplayOptions = this.getDefaultDisplayOptions();
    return {
      departments: [initialDepartment],
      displayOptions: displayOptions
    }
  }

  getNewDepartment(departmentNum: number): MotorInventoryDepartment {
    let departmentId: string = Math.random().toString(36).substr(2, 9);
    let initMotor: MotorItem = this.getNewMotor(departmentId);
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: departmentId,
      catalog: [initMotor]
    }
  }

  getNewMotor(departmentId: string): MotorItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      departmentId: departmentId,
      suiteDbItemId: undefined,
      description: '',
      name: 'New Motor',
      lineFrequency: 60,
      motorRpm: 1780,
      ratedMotorPower: undefined,
      efficiencyClass: 1,
      nominalEfficiency: undefined,
      ratedVoltage: undefined,
      fullLoadAmps: undefined,
      annualOperatingHours: 8760,
      percentLoad: undefined,
      driveType: undefined,
      isVFD: false,
      hasLoggerData: false,
      numberOfPhases: undefined,
      enclosureType: undefined,
      nemaTable: undefined,
      poles: undefined,
      synchronousSpeed: undefined
    }
  }

  getDefaultDisplayOptions(): MotorPropertyDisplayOptions {
    return {
      ratedVoltage: true,
      annualOperatingHours: true,
      percentLoad: true,
      driveType: true,
      isVFD: true,
      hasLoggerData: true,
      numberOfPhases: true,
      enclosureType: true,
      poles: true,
      manufacturer: true,
      model: true,
      catalogId: true,
      motorType: true,
      ratedSpeed: true,
      fullLoadSpeed: true,
      frameNumber: true,
      purpose: true,
      uFrame: true,
      cFace: true,
      verticalShaft: true,
      dFlange: true,
      serviceFactor: true,
      insulationClass: true,
      weight: true,
      listPrice: true,
      windingResistance: true,
      warranty: true,
      rotorBars: true,
      statorSlots: true,
      efficiency75: true,
      efficiency50: true,
      efficiency25: true,
      powerFactor100: true,
      powerFactor75: true,
      powerFactor50: true,
      powerFactor25: true,
      torqueFullLoad: true,
      torqueBreakDown: true,
      torqueLockedRotor: true,
      ampsIdle: true,
      ampsLockedRotor: true,
      stalledRotorTimeHot: true,
      stalledRotorTimeCold: true,
      voltageConnectionType: true,
      currentType: true,
      averageLoadFactor: true,
      utilizationFactor: true
    }
  }
}



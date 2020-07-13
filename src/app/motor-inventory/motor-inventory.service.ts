import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
    return {
      departments: [initialDepartment]
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
      efficiencyClass: undefined,
      nominalEfficiency: undefined,
      ratedVoltage: undefined,
      fullLoadAmps: undefined,
      annualOperatingHours: 8760,
      percentLoad: undefined,
      driveType: undefined,
      isVFD: false,
      hasLoggerData: false,
      frameType: undefined,
      numberOfPhases: undefined,
      enclosureType: undefined,
      nemaTable: undefined,
      poles: undefined,
      synchronousSpeed: undefined
    }
  }
}



export interface MotorInventoryData {
  departments: Array<MotorInventoryDepartment>,
}

export interface MotorInventoryDepartment {
  name: string,
  operatingHours: number,
  description: string,
  id: string,
  catalog: Array<MotorItem>
}

export interface MotorItem {
  id: string,
  suiteDbItemId?: number,
  departmentId?: string,
  description: string,
  //required properties
  lineFrequency: number,
  motorRpm: number,
  ratedMotorPower: number,
  efficiencyClass: number,
  nominalEfficiency: number,
  ratedVoltage: number,
  fullLoadAmps: number,
  annualOperatingHours: number,
  percentLoad: number,
  //optional properties
  driveType?: number,
  isVFD?: boolean,
  hasLoggerData?: boolean,
  frameType?: string,
  numberOfPhases?: number,
  name: string,
  enclosureType?: string,
  nemaTable?: string,
  poles?: number,
  synchronousSpeed?: number
  //additional from excel
  manufacturer?: string,
  model?: string,
  catalogId?: string,
  motorType?: string,
  speed?: number,
  fullLoadSpeed?: number,
  //excel says frameNumber = string..
  frameNumber?: number
  voltageRating?: number,
  purpose?: string
  uFrame?: number,
  cFace?: number,
  verticalShaft?: number,
  dFlange?: number,
  serviceFactor?: number,
  insulationClass?: number,
  weight?: number,
  listPrice?: number,
  windingResistance?: number,
  //should warranty = boolean?
  warranty?: number,
  rotoBars?: number,
  statorSlots?: number,
  efficiency75?: number,
  efficiency50?: number,
  efficiency25?: number,
  powerFactor100?: number,
  powerFactor75?: number,
  powerFactor50?: number,
  powerFactor25?: number,
  torqueFullLoad?: number,
  torqueBreakDown?: number,
  torqueLockedRotor?: number,
  ampsIdle?: number,
  ampsLockedRotor?: number,
  stalledRotorTimeHot?: number,
  stalledRotorTimeCold?: number
}
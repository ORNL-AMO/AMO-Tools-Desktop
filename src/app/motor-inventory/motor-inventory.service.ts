import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MotorInventoryService {

  setupTab: BehaviorSubject<string>;
  motorInventoryData: BehaviorSubject<MotorInventoryData>;
  constructor() {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    let inventoryData: MotorInventoryData = this.initInventoryData();
    this.motorInventoryData = new BehaviorSubject<MotorInventoryData>(inventoryData);
  }

  initInventoryData(): MotorInventoryData {
    let initialDepartment: MotorInventoryDepartment = this.getNewDepartment(1);
    return {
      departments: [initialDepartment]
    }
  }

  getNewDepartment(departmentNum: number): MotorInventoryDepartment{
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: Math.random().toString(36).substr(2, 9),
      catalog: new Array<MotorItem>()
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
  suiteDbItemId?: number,
  description: string,
  lineFrequency: number,
  ratedMotorPower: number,
  efficiencyClass: number,
  nominalEfficiency: number,
  ratedVoltage: number,
  fullLoadAmps: number,
  annualOperatingHours: number,
  percentLoad: number,
  driveType: number,
  isVFD: boolean,
  hasLoggerData: boolean,
  frameType: string,
  numberOfPhases: number
}
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

  updateMotorItem(selectedMotor: MotorItem){
    let motorInventoryData: MotorInventoryData = this.motorInventoryData.getValue();
    let selectedDepartmentIndex: number = motorInventoryData.departments.findIndex(department => { return department.id == selectedMotor.departmentId });
    let catalogItemIndex: number = motorInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(motorItem => { return motorItem.id == selectedMotor.id; });
    motorInventoryData.departments[selectedDepartmentIndex].catalog[catalogItemIndex] = selectedMotor;
    this.motorInventoryData.next(motorInventoryData);
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
      batchAnalysisOptions: {
        modifiedCost: true,
        modifiedPower: true,
        modifiedEfficiency: true,
        modifiedPercentLoad: true,
        rewindCost: true,
        rewindEfficiencyLoss: true
      },
      loadCharactersticOptions: {
        efficiency75: true,
        efficiency50: true,
        efficiency25: true,
        powerFactor100: true,
        powerFactor75: true,
        powerFactor50: true,
        powerFactor25: true,
        ampsIdle: true,
      },
      manualSpecificationOptions: {
        frameNumber: true,
        uFrame: true,
        cFace: true,
        verticalShaft: true,
        dFlange: true,
        windingResistance: true,
        rotorBars: true,
        statorSlots: true,
        ampsLockedRotor: true,
        stalledRotorTimeHot: true,
        stalledRotorTimeCold: true,
        poles: true,
        currentType: true,
      },
      nameplateDataOptions: {
        manufacturer: true,
        model: true,
        motorType: true,
        enclosureType: true,
        ratedVoltage: true,
        serviceFactor: true,
        insulationClass: true,
        weight: true,
        numberOfPhases: true,
        fullLoadSpeed: true,
      },
      operationDataOptions: {
        ratedSpeed: true,
        purpose: true,
        annualOperatingHours: true,
        averageLoadFactor: true,
        utilizationFactor: true,
        percentLoad: true,
        powerFactorAtLoad: true
      },
      otherOptions: {
        driveType: true,
        isVFD: true,
        hasLoggerData: true,
        voltageConnectionType: true,
      },
      purchaseInformationOptions: {
        catalogId: true,
        listPrice: true,
        warranty: true,
        directReplacementCost: true
      },
      torqueOptions: {
        torqueFullLoad: true,
        torqueBreakDown: true,
        torqueLockedRotor: true,
      }
    }
  }
}



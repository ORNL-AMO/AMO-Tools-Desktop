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

  updateMotorItem(selectedMotor: MotorItem) {
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
      nemaTable: undefined,
      voltageLimit: undefined,
      batchAnalysisData: {
        modifiedCost: undefined,
        modifiedPower: undefined,
        modifiedEfficiency: undefined,
        modifiedPercentLoad: undefined,
        rewindCost: undefined,
        rewindEfficiencyLoss: undefined
      },
      loadCharacteristicData: {
        efficiency75: undefined,
        efficiency50: undefined,
        efficiency25: undefined,
        powerFactor100: undefined,
        powerFactor75: undefined,
        powerFactor50: undefined,
        powerFactor25: undefined,
        ampsIdle: undefined,
      },
      manualSpecificationData:  {
        synchronousSpeed: undefined,
        frame: undefined,
        shaftPosiion: undefined,
        windingResistance: undefined,
        rotorBars: undefined,
        statorSlots: undefined,
        ampsLockedRotor: undefined,
        stalledRotorTimeHot: undefined,
        stalledRotorTimeCold: undefined,
        poles: undefined,
        currentType: undefined,
        ratedSpeed: undefined    
      },
      nameplateData:  {
        ratedMotorPower: undefined,
        efficiencyClass: 1,
        lineFrequency: 60,
        nominalEfficiency: undefined,
        manufacturer: undefined,
        model: undefined,
        motorType: undefined,
        enclosureType: undefined,
        ratedVoltage: undefined,
        serviceFactor: undefined,
        insulationClass: undefined,
        weight: undefined,
        numberOfPhases: undefined,
        fullLoadSpeed: undefined,
        fullLoadAmps: undefined,
        motorRpm: 1780
      },
      operationData:  {
        location: undefined,
        annualOperatingHours: 8760,
        averageLoadFactor: undefined,
        utilizationFactor: undefined,
        efficiencyAtAverageLoad: undefined,
        powerFactorAtLoad: undefined
      },
      otherData:  {
        driveType: undefined,
        isVFD: undefined,
        hasLoggerData: undefined,
        voltageConnectionType: undefined,
      },
      purchaseInformationData:  {
        catalogId: undefined,
        listPrice: undefined,
        warranty: undefined,
        //Add
        directReplacementCost: undefined
      },
      torqueData:  {
        torqueFullLoad: undefined,
        torqueBreakDown: undefined,
        torqueLockedRotor: undefined,
      }
    }
  }

  getDefaultDisplayOptions(): MotorPropertyDisplayOptions {
    return {
      batchAnalysisOptions: {
        displayBatchAnalysis: false,
        modifiedCost: false,
        modifiedPower: false,
        modifiedEfficiency: false,
        modifiedPercentLoad: false,
        rewindCost: false,
        rewindEfficiencyLoss: false
      },
      loadCharactersticOptions: {
        displayLoadCharacteristics: false,
        efficiency75: false,
        efficiency50: false,
        efficiency25: false,
        powerFactor100: false,
        powerFactor75: false,
        powerFactor50: false,
        powerFactor25: false,
        ampsIdle: false,
      },
      manualSpecificationOptions: {
        displayManualSpecifications: false,
        frame: false,
        shaftPosiion: false,
        windingResistance: false,
        rotorBars: false,
        statorSlots: false,
        ampsLockedRotor: false,
        stalledRotorTimeHot: false,
        stalledRotorTimeCold: false,
        poles: false,
        currentType: false,
        ratedSpeed: false,
      },
      nameplateDataOptions: {
        displayNameplateData: true,
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
        fullLoadAmps: true
      },
      operationDataOptions: {
        displayOperationData: false,
        location: false,
        annualOperatingHours: false,
        averageLoadFactor: false,
        utilizationFactor: false,
        efficiencyAtAverageLoad: false,
        powerFactorAtLoad: false
      },
      otherOptions: {
        displayOther: false,
        driveType: false,
        isVFD: false,
        hasLoggerData: false,
        voltageConnectionType: false,
      },
      purchaseInformationOptions: {
        displayPurchaseInformation: false,
        catalogId: false,
        listPrice: false,
        warranty: false,
        directReplacementCost: false
      },
      torqueOptions: {
        displayTorque: false,
        torqueFullLoad: false,
        torqueBreakDown: false,
        torqueLockedRotor: false,
      }
    }
  }
}



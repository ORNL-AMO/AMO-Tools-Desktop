import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MotorItem, MotorInventoryDepartment, MotorInventoryData, MotorPropertyDisplayOptions, FilterInventorySummary } from './motor-inventory';
import { Settings } from '../shared/models/settings';
import * as _ from 'lodash';
@Injectable()
export class MotorInventoryService {

  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  summaryTab: BehaviorSubject<string>;
  motorInventoryData: BehaviorSubject<MotorInventoryData>;
  focusedField: BehaviorSubject<string>;
  focusedDataGroup: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  helpPanelTab: BehaviorSubject<string>;
  filterInventorySummary: BehaviorSubject<FilterInventorySummary>;
  constructor() {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    this.mainTab = new BehaviorSubject<string>('setup');
    let inventoryData: MotorInventoryData = this.initInventoryData();
    this.motorInventoryData = new BehaviorSubject<MotorInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<string>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.filterInventorySummary = new BehaviorSubject({
      selectedDepartmentIds: new Array(),
      efficiencyClasses: new Array(),
      ratedPower: new Array(),
      ratedVoltage: new Array()
    });
  }

  updateMotorItem(selectedMotor: MotorItem) {
    let motorInventoryData: MotorInventoryData = this.motorInventoryData.getValue();
    let selectedDepartmentIndex: number = motorInventoryData.departments.findIndex(department => { return department.id == selectedMotor.departmentId });
    let catalogItemIndex: number = motorInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(motorItem => { return motorItem.id == selectedMotor.id; });
    motorInventoryData.departments[selectedDepartmentIndex].catalog[catalogItemIndex] = selectedMotor;
    this.motorInventoryData.next(motorInventoryData);
  }

  deleteMotorItem(selectedMotor: MotorItem) {
    let motorInventoryData: MotorInventoryData = this.motorInventoryData.getValue();
    let selectedDepartmentIndex: number = motorInventoryData.departments.findIndex(department => { return department.id == selectedMotor.departmentId });
    let motorItemIndex: number = motorInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(motorItem => {return motorItem.id == selectedMotor.id});
    motorInventoryData.departments[selectedDepartmentIndex].catalog.splice(motorItemIndex, 1);
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
      manualSpecificationData: {
        synchronousSpeed: undefined,
        frame: undefined,
        shaftPosiion: undefined,
        windingResistance: undefined,
        rotorBars: undefined,
        statorSlots: undefined,
        ampsLockedRotor: undefined,
        poles: undefined,
        currentType: undefined,
        ratedSpeed: undefined
      },
      nameplateData: {
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
        fullLoadAmps: undefined
      },
      operationData: {
        location: undefined,
        annualOperatingHours: 8760,
        averageLoadFactor: undefined,
        utilizationFactor: undefined,
        efficiencyAtAverageLoad: undefined,
        powerFactorAtLoad: undefined,
        currentAtLoad: undefined,
        operatingHours: {
          weeksPerYear: 52.14,
          daysPerWeek: 7,
          hoursPerDay: 24,
          minutesPerHour: 60,
          secondsPerMinute: 60,
          hoursPerYear: 8760
        }
      },
      otherData: {
        driveType: undefined,
        isVFD: undefined,
        hasLoggerData: undefined,
        voltageConnectionType: undefined,
      },
      purchaseInformationData: {
        catalogId: undefined,
        listPrice: undefined,
        warranty: undefined,
        //Add
        directReplacementCost: undefined
      },
      torqueData: {
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
        poles: false,
        currentType: false,
        ratedSpeed: false,
      },
      nameplateDataOptions: {
        displayNameplateData: true,
        manufacturer: false,
        model: false,
        motorType: false,
        enclosureType: false,
        ratedVoltage: true,
        serviceFactor: false,
        insulationClass: false,
        weight: false,
        numberOfPhases: false,
        fullLoadSpeed: true,
        fullLoadAmps: true
      },
      operationDataOptions: {
        displayOperationData: true,
        location: false,
        annualOperatingHours: true,
        averageLoadFactor: true,
        utilizationFactor: true,
        efficiencyAtAverageLoad: true,
        powerFactorAtLoad: false,
        currentAtLoad: false
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
  filterMotorInventoryData(inventoryData: MotorInventoryData, filterInventorySummary: FilterInventorySummary): MotorInventoryData {
    let filteredInventoryData: MotorInventoryData = JSON.parse(JSON.stringify(inventoryData));
    if (filterInventorySummary.selectedDepartmentIds.length != 0) {
      filteredInventoryData.departments = _.filter(filteredInventoryData.departments, (department) => {
        return _.find(filterInventorySummary.selectedDepartmentIds, (id) => { return department.id == id }) != undefined;
      });
    }
    if (filterInventorySummary.efficiencyClasses.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.efficiencyClasses, motorItem.nameplateData.efficiencyClass);
        })
      });
    }
    if (filterInventorySummary.ratedPower.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.ratedPower, motorItem.nameplateData.ratedMotorPower);
        })
      });
    }
    if (filterInventorySummary.ratedVoltage.length != 0) {
      filteredInventoryData.departments.forEach(department => {
        department.catalog = _.filter(department.catalog, (motorItem) => {
          return _.includes(filterInventorySummary.ratedVoltage, motorItem.nameplateData.ratedVoltage);
        })
      });
    }
    return filteredInventoryData;
  }
}



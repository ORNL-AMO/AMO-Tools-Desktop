import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventoryDepartment, CompressedAirItem, CompressedAirPropertyDisplayOptions } from './compressed-air-inventory';

@Injectable()
export class CompressedAirInventoryService {

  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  summaryTab: BehaviorSubject<string>;
  compressedAirInventoryData: BehaviorSubject<CompressedAirInventoryData>;
  focusedField: BehaviorSubject<string>;
  focusedDataGroup: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  helpPanelTab: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;
  currentInventoryId: number;

  constructor() {
    this.setupTab = new BehaviorSubject<string>('plant-setup');
    this.mainTab = new BehaviorSubject<string>('setup');
    let inventoryData: CompressedAirInventoryData; //= this.initInventoryData();
    this.compressedAirInventoryData = new BehaviorSubject<CompressedAirInventoryData>(inventoryData);
    this.focusedField = new BehaviorSubject<string>('default');
    this.focusedDataGroup = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.summaryTab = new BehaviorSubject<string>('overview');
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.helpPanelTab = new BehaviorSubject<string>(undefined);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    // this.filterInventorySummary = new BehaviorSubject({
    //   selectedDepartmentIds: new Array(),
    //   pumpTypes: new Array(),
    //   motorRatedPowerValues: new Array(),
    //   statusValues: new Array()
    // });
  }

  initInventoryData(): CompressedAirInventoryData {
    let initialDepartment: CompressedAirInventoryDepartment = this.getNewDepartment(1);
    let displayOptions: CompressedAirPropertyDisplayOptions = this.getDefaultDisplayOptions();
    return {
      departments: [initialDepartment],
      displayOptions: displayOptions
    }
  }


  setIsValidInventory(compressedAirInventoryData: CompressedAirInventoryData) {
    let isValid: boolean = true;
    // if (pumpInventoryData) {
    //   pumpInventoryData.departments.forEach(dept => {
    //     let isValidDepartment: boolean = true;
    //     dept.catalog.map(pumpItem => {
    //       pumpItem.validPump = this.isPumpValid(pumpItem);
    //       if (!pumpItem.validPump.isValid) {
    //         isValid = false;
    //         isValidDepartment = false;
    //       }
    //     })
    //     dept.isValid = isValidDepartment
    //   });
    // }
    compressedAirInventoryData.isValid = isValid;
  }

  getNewDepartment(departmentNum: number): CompressedAirInventoryDepartment {
    let departmentId: string = Math.random().toString(36).substr(2, 9);
    let initPump: CompressedAirItem = this.getNewCompressor(departmentId);
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: departmentId,
      catalog: [initPump]
    }
  }

  getNewCompressor(departmentId: string): CompressedAirItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      departmentId: departmentId,
      suiteDbItemId: undefined,
      description: '',
      notes: '',
      name: 'New Pump',
      nameplateData: {
        compressorType: undefined,
        fullLoadOperatingPressure: undefined,
        fullLoadRatedCapacity: undefined,
        totalPackageInputPower: undefined
      },
      compressedAirMotor: {
        motorPower: undefined,
        motorFullLoadAmps: undefined,
      },
      compressedAirControlsProperties: {
        controlType: undefined,
        unloadPointCapacity: undefined,
        numberOfUnloadSteps: undefined,
        automaticShutdown: undefined,
        unloadSumpPressure: undefined,
      },
      compressedAirDesignDetailsProperties: {
        blowdownTime: undefined,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        designEfficiency: undefined,
        serviceFactor: undefined,
        noLoadPowerFM: undefined,
        noLoadPowerUL: undefined,
        maxFullFlowPressure: undefined
      },
      compressedAirPerformancePointsProperties: {
        fullLoad: {
          dischargePressure: 100,
          isDefaultPower: true,
          airflow: 1857,
          isDefaultAirFlow: true,
          power: 290.1,
          isDefaultPressure: true
        },
        maxFullFlow: {
          dischargePressure: 110,
          isDefaultPower: true,
          airflow: 1843,
          isDefaultAirFlow: true,
          power: 305.9,
          isDefaultPressure: true
        },
        unloadPoint: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        noLoad: {
          dischargePressure: 15,
          isDefaultPower: true,
          airflow: 0,
          isDefaultAirFlow: true,
          power: 59.5,
          isDefaultPressure: true
        },
        blowoff: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        midTurndown: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        },
        turndown: {
          isDefaultPower: true,
          isDefaultAirFlow: true,
          isDefaultPressure: true,
          power: undefined,
          airflow: undefined,
          dischargePressure: undefined,
        }
      },
    }
  }


  getDefaultDisplayOptions(): CompressedAirPropertyDisplayOptions {
    return {
      nameplateDataOptions: {
        displayNameplateData: true,
        compressorType: true,
        fullLoadOperatingPressure: true,
        fullLoadRatedCapacity: true,
        totalPackageInputPower: true
      },
      compressedAirMotorPropertiesOptions: {
        displayCompressedAirMotorProperties: true,
        motorPower: true,
        motorFullLoadAmps: true,
      },
      compressedAirControlsPropertiesOptions: {
        displayCompressedAirControlsProperties: true,
        controlType: true,
        unloadPointCapacity: true,
        numberOfUnloadSteps: true,
        automaticShutdown: true,
        unloadSumpPressure: true,
      },
      compressedAirDesignDetailsPropertiesOptions: {
        displayCompressedAirDesignDetailsProperties: true,
        blowdownTime: true,
        modulatingPressureRange: true,
        inputPressure: true,
        designEfficiency: true,
        serviceFactor: true,
        noLoadPowerFM: true,
        noLoadPowerUL: true,
        maxFullFlowPressure: true
      },
      compressedAirPerformancePointsPropertiesOptions: {
        displayCompressedAirPerformancePointsProperties: true
      }
    }

  }





}

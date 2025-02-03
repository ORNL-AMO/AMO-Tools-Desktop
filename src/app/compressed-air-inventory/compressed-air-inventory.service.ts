import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventoryDepartment, CompressedAirItem, CompressedAirPropertyDisplayOptions, ValidCompressedAir } from './compressed-air-inventory';
import { UntypedFormGroup } from '@angular/forms';

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
    // if (compressedAirInventoryData) {
    //   compressedAirInventoryData.departments.forEach(dept => {
    //     let isValidDepartment: boolean = true;
    //     dept.catalog.map(compressedAirItem => {
    //       compressedAirItem.validCompressedAir = this.isCompressedAirValid(compressedAirItem);
    //       if (!compressedAirItem.validCompressedAir.isValid) {
    //         isValid = false;
    //         isValidDepartment = false;
    //       }
    //     })
    //     dept.isValid = isValidDepartment
    //   });
    // }
    compressedAirInventoryData.isValid = isValid;
  }

  /*
  isValid: boolean,
  nameplateDataValid: boolean,
  compressedAirMotorValid: boolean,
  compressedAirControlsValid: boolean,
  compressedAirDesignDetailsValid: boolean,
  compressedAirPerformancePointsValid: boolean
  */

  // isCompressedAirValid(pump: CompressedAirItem): ValidCompressedAir {
  //   let pumpMotorForm: UntypedFormGroup = this.motorCatalogService.getFormFromPumpMotor(pump.pumpMotor);
  //   let fieldMeasurementsForm: UntypedFormGroup = this.fieldCatalogService.getFormFromFieldMeasurements(pump.fieldMeasurements);
  //   let equipmentForm: UntypedFormGroup = this.pumpEquipmentService.getFormFromPumpEquipmentProperties(pump.pumpEquipment);
  //   return {
  //     isValid: pumpMotorForm.valid && fieldMeasurementsForm.valid && equipmentForm.valid,
  //     pumpMotorValid: pumpMotorForm.valid,
  //     fieldMeasurementsValid: fieldMeasurementsForm.valid,
  //     equipmentValid: equipmentForm.valid
  //   }
  // }

  getNewDepartment(departmentNum: number): CompressedAirInventoryDepartment {
    let departmentId: string = Math.random().toString(36).substr(2, 9);
    let initCompressor: CompressedAirItem = this.getNewCompressor(departmentId);
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: departmentId,
      catalog: [initCompressor]
    }
  }

  getNewCompressor(departmentId: string): CompressedAirItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      departmentId: departmentId,
      suiteDbItemId: undefined,
      description: '',
      notes: '',
      name: 'New Compressor',
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
      centrifugalSpecifics: {
        surgeAirflow: null,
        maxFullLoadPressure: null,
        maxFullLoadCapacity: null,
        minFullLoadPressure: null,
        minFullLoadCapacity: null
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

  async deleteCompressedAirItem(selectedCompressedAir: CompressedAirItem) {
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
    let selectedDepartmentIndex: number = compressedAirInventoryData.departments.findIndex(department => { return department.id == selectedCompressedAir.departmentId });
    let compressedAirItemIndex: number = compressedAirInventoryData.departments[selectedDepartmentIndex].catalog.findIndex(compressedAirItem => { return compressedAirItem.id == selectedCompressedAir.id });
    compressedAirInventoryData.departments[selectedDepartmentIndex].catalog.splice(compressedAirItemIndex, 1);
    // if (selectedCompressedAir.connectedItem) {
    //  await this.motorIntegrationService.removeMotorConnectedItem(selectedCompressedAir);
    //  compressedAirInventoryData.hasConnectedInventoryItems = false;
    // }
    this.setIsValidInventory(compressedAirInventoryData);
    this.compressedAirInventoryData.next(compressedAirInventoryData);
  }

  updateCompressedAirItem(selectedCompressedAir: CompressedAirItem) {
    let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryData.getValue();
    let isValid: boolean = true;
    compressedAirInventoryData.departments.map(dept => {
      let isValidDepartment: boolean = true;
      dept.catalog.map(compressedAirItem => {
        if (selectedCompressedAir.id === compressedAirItem.id) {
          compressedAirItem = selectedCompressedAir;
        }
        // let isValidCompressedAir = this.isCompressedAirValid(compressedAirItem);
        // compressedAirItem.validCompressedAir = isValidCompressedAir;
        // if (!isValidCompressedAir.isValid) {
        //   isValid = false;
        //   isValidDepartment = false;
        // }
      })
      dept.isValid = isValidDepartment;
    });
    compressedAirInventoryData.isValid = isValid;
    this.compressedAirInventoryData.next(compressedAirInventoryData);
  }





}

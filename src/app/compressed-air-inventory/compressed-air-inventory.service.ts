import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventoryDepartment, CompressedAirItem } from './compressed-air-inventory';

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
    //let displayOptions: PumpPropertyDisplayOptions = this.getDefaultDisplayOptions();
    return {
      departments: [initialDepartment],
      //displayOptions: displayOptions
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
    let initPump: CompressedAirItem = this.getNewPump(departmentId);
    return {
      name: 'Department ' + departmentNum,
      operatingHours: 8760,
      description: '',
      id: departmentId,
      catalog: [initPump]
    }
  }

  getNewPump(departmentId: string): CompressedAirItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      departmentId: departmentId,
      suiteDbItemId: undefined,
      description: '',
      notes: '',
      name: 'New Pump',
    }
  }
}

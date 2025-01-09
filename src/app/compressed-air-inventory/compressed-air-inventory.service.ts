import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData } from './compressed-air-inventory';

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
}

import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ProcessCoolingAssessment, SystemInformation } from '../shared/models/process-cooling-assessment';
import { getNewIdString } from '../shared/helperFunctions';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingService {

  settings: BehaviorSubject<Settings>;
  settingsSignal: WritableSignal<Settings>;

  processCooling: BehaviorSubject<ProcessCoolingAssessment>;
  processCoolingSignal: WritableSignal<ProcessCoolingAssessment>;

  mainTab: BehaviorSubject<ProcessCoolingMainTabString>;
  setupTab: BehaviorSubject<ProcessCoolingSetupTabString>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  selectedModificationId: BehaviorSubject<string>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  setupTabs: Array<ProcessCoolingSetupTabString> = [
    'assessment-settings',
    'system-information',
    'inventory',
    'operating-schedule', 
    'load-schedule'
  ];
  constructor() {
    this.settingsSignal = signal<Settings>(undefined);
    this.processCoolingSignal = signal<ProcessCoolingAssessment>(undefined);

    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<ProcessCoolingMainTabString>('baseline');
    this.setupTab = new BehaviorSubject<ProcessCoolingSetupTabString>('assessment-settings');
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    this.processCooling = new BehaviorSubject<ProcessCoolingAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
  }

  updateProcessCooling(assessment: ProcessCoolingAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      this.setIsSetupDone(assessment)  
    }
    this.processCooling.next(assessment);
    this.processCoolingSignal.set(this.processCooling.getValue());
  }

  emitProcessCoolingUpdate(processCooling: ProcessCoolingAssessment) {
    console.log('[ProcessCoolingService] processCooling:', processCooling);
    this.processCooling.next(processCooling);
    this.processCoolingSignal.set(processCooling);
  }

  // * prefer immutability, don't mutate the current object, return new (like React )
  updateProcessCoolingProperty<K extends ProcessCoolingDataProperty>(key: K, value: ProcessCoolingAssessment[K]) {
    if (this.processCooling.getValue()) {
      let updatedProcessCooling = { ...this.processCooling.getValue() };
      updatedProcessCooling[key] = value;
      this.emitProcessCoolingUpdate(updatedProcessCooling);
    }
  }

  updateSystemInformation<K extends ProcessCoolingSystemInformationProperty>(key: K, value: SystemInformation[K]) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.systemInformation[key] = value;
    this.emitProcessCoolingUpdate(updatedProcessCooling);
  }



  setIsSetupDone(assessment: ProcessCoolingAssessment) {
    // let settings: Settings = this.settings.getValue();
    // let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(assessment.systemInformation, settings).valid;
    let hasValidSystemSetup = true;
    let hasValidInventory = true;
    assessment.setupDone = hasValidSystemSetup && hasValidInventory;
  }

  continue() {
    let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTab.getValue();
    if (tmpSetupTab === 'load-schedule') {
      this.mainTab.next('assessment');
    } else {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex + 1];
      this.setupTab.next(nextTab);
    }
  }

  back() {
    let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTab.getValue();
    if (tmpSetupTab !== 'assessment-settings' && this.mainTab.getValue() == 'baseline') {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex - 1];
      this.setupTab.next(nextTab);
    } else if (this.mainTab.getValue() == 'assessment') {
      this.mainTab.next('baseline');
    }
  }

}

export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';

export type ProcessCoolingDataProperty = keyof Pick<ProcessCoolingAssessment, 'systemBasics' | 'systemInformation' | 'inventory' | 'modifications'>;
export type ProcessCoolingSystemInformationProperty = keyof Pick<SystemInformation, 'operations' | 'co2SavingsData' | 'airCooledSystemInput' | 'pumpInput' | 'towerInput' | 'waterCooledSystemInput'>;

export type FormControlIds<T> = {
  [K in keyof T]: string;
};


export const generateFormControlIds = <T extends Record<string, any>>(obj: T): FormControlIds<T> => {
  const result = {} as FormControlIds<T>;
  const idString = getNewIdString();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = `${idString}_${key}`;
    }
  }
  return result;
}

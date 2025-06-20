import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<ProcessCoolingMainTabString>;
  setupTab: BehaviorSubject<ProcessCoolingSetupTabString>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  processCooling: BehaviorSubject<ProcessCoolingAssessment>;
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

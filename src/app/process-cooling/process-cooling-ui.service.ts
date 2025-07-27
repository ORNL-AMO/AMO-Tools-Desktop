import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingUiService {
  mainTabSignal: WritableSignal<ProcessCoolingMainTabString> = signal<ProcessCoolingMainTabString>('baseline');
  assessmentTabSignal: WritableSignal<ProcessCoolingAssessmentTabString> = signal<ProcessCoolingAssessmentTabString>('explore-opportunities');
  setupTabSignal: WritableSignal<ProcessCoolingSetupTabString> = signal<ProcessCoolingSetupTabString>('assessment-settings');
  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  selectedModificationIdSignal: WritableSignal<string> = signal<string>('');
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  setupTabs: Array<ProcessCoolingSetupTabString> = [
    'assessment-settings',
    'system-information',
    'inventory',
    'operating-schedule', 
    'load-schedule'
  ];
  constructor() {}

  continue() {
    let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTabSignal();
    if (tmpSetupTab === 'load-schedule') {
      this.mainTabSignal.set('assessment');
    } else {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex + 1];
      this.setupTabSignal.set(nextTab);
    }
  }

  back() {
    let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTabSignal();
    if (tmpSetupTab !== 'assessment-settings' && this.mainTabSignal() == 'baseline') {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex - 1];
      this.setupTabSignal.set(nextTab);
    } else if (this.mainTabSignal() == 'assessment') {
      this.mainTabSignal.set('baseline');
    }
  }

}

export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';
export type ProcessCoolingAssessmentTabString = 'explore-opportunities';


export enum SetupView {
  ASSESSMENT_SETTINGS = 'assessment-settings',
  SYSTEM_INFORMATION = 'system-information',
  INVENTORY = 'chiller-inventory',
  OPERATING_SCHEDULE = 'operating-schedule',
  LOAD_SCHEDULE = 'load-schedule',
}

export interface SetupViewLink {
  setupView: SetupView;
  label: string;
}

export const LINKS: SetupViewLink[] = [
  {
    setupView: SetupView.ASSESSMENT_SETTINGS,
    label: 'Assessment Settings',
  },
  {
    setupView: SetupView.SYSTEM_INFORMATION,
    label: 'System Information',
  },
  {
    setupView: SetupView.INVENTORY,
    label: 'Inventory',
  },
  {
    setupView: SetupView.OPERATING_SCHEDULE,
    label: 'Operating Schedule',
  },
  {
    setupView: SetupView.LOAD_SCHEDULE,
    label: 'Load Schedule',
  },
]

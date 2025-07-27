import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingUiService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  selectedModificationIdSignal: WritableSignal<string> = signal<string>('');
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  // setupTabs: Array<ProcessCoolingSetupTabString> = [
  //   'assessment-settings',
  //   'system-information',
  //   'inventory',
  //   'operating-schedule', 
  //   'load-schedule'
  // ];

  readonly mainView: Signal<string> = toSignal(
    this.route.url.pipe(
      map(segments => segments[0]?.path || '')
    ),
    { initialValue: '' }
  );

    readonly setupView: Signal<string> = toSignal(
    this.route.url.pipe(
      map(segments => segments[1]?.path || '')
    ),
    { initialValue: '' }
  );

  readonly currentMainView: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Get the main segment from the current URL
        const urlSegments = this.router.url.split('/').filter(s => s);
        return urlSegments[0] || '';
      }),
      startWith(this.getCurrentMainView()) // Initialize with current value
    ),
    { initialValue: '' }
  );

  private getCurrentMainView(): string {
    const urlSegments = this.router.url.split('/').filter(s => s);
    return urlSegments[0] || '';
  }

  constructor() { }

  // continue() {
  //   let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTabSignal();
  //   if (tmpSetupTab === 'load-schedule') {
  //     this.mainTabSignal.set('assessment');
  //   } else {
  //     let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
  //     let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex + 1];
  //     this.setupTabSignal.set(nextTab);
  //   }
  // }

  // back() {
  //   let tmpSetupTab: ProcessCoolingSetupTabString = this.setupTabSignal();
  //   if (tmpSetupTab !== 'assessment-settings' && this.mainTabSignal() == 'baseline') {
  //     let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
  //     let nextTab: ProcessCoolingSetupTabString = this.setupTabs[assessmentTabIndex - 1];
  //     this.setupTabSignal.set(nextTab);
  //   } else if (this.mainTabSignal() == 'assessment') {
  //     this.mainTabSignal.set('baseline');
  //   }
  // }

}

export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';
export type ProcessCoolingAssessmentTabString = 'explore-opportunities';

export enum MainView 
{
  BASELINE = 'baseline',
  ASSESSMENT = 'assessment',
  REPORT = 'report',
}

export enum SetupView {
  ASSESSMENT_SETTINGS = 'assessment-settings',
  SYSTEM_INFORMATION = 'system-information',
  INVENTORY = 'chiller-inventory',
  OPERATING_SCHEDULE = 'operating-schedule',
  LOAD_SCHEDULE = 'load-schedule',
}

export interface ViewLink {
  view: SetupView | MainView;
  label: string;
}

export const MAIN_VIEW_LINKS: ViewLink[] = [
  {
    view: MainView.BASELINE,
    label: 'Baseline',
  },
  {
    view: MainView.ASSESSMENT,
    label: 'Assessment',
  },
  {
    view: MainView.REPORT,
    label: 'Report',
  },
];

export const SETUP_VIEW_LINKS: ViewLink[] = [
  {
    view: SetupView.ASSESSMENT_SETTINGS,
    label: 'Assessment Settings',
  },
  {
    view: SetupView.SYSTEM_INFORMATION,
    label: 'System Information',
  },
  {
    view: SetupView.INVENTORY,
    label: 'Inventory',
  },
  {
    view: SetupView.OPERATING_SCHEDULE,
    label: 'Operating Schedule',
  },
  {
    view: SetupView.LOAD_SCHEDULE,
    label: 'Load Schedule',
  },
]

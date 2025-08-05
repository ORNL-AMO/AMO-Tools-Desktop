import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';

@Injectable()
export class ProcessCoolingUiService {
  private router = inject(Router);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  selectedModificationIdSignal: WritableSignal<string> = signal<string>('');
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);

  private readonly urlSegmentIndex = {
    assessmentURL: 0,
    assessmentId: 1,
    main: 2,
    setup: 3,
    subview: 4
  };

  private readonly STEPPED_ROUTES = [
    {
      view: ROUTE_TOKENS.assessmentSettings,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.assessmentSettings}`
    },
    {
      view: ROUTE_TOKENS.systemInformation,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}`
    },
    {
      view: ROUTE_TOKENS.chillerInventory,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.chillerInventory}`
    },
    {
      view: ROUTE_TOKENS.assessment,
      path: `${ROUTE_TOKENS.assessment}/${ROUTE_TOKENS.exploreOpportunities}`
    },
    {
      view: ROUTE_TOKENS.report,
      path: `${ROUTE_TOKENS.report}`
    },
  ];


  readonly mainView: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const mainView = this.getCurrentMainView();
        console.log('mainView:', mainView);
        return mainView;
      }),
      startWith(this.getCurrentMainView())
    ),
    { initialValue: '' }
  );

  readonly childView: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const childView = this.getCurrentChildView();
        console.log('childView:', childView);
        return childView;
      }),
      startWith(this.getCurrentChildView())
    ),
    { initialValue: '' }
  );

  readonly setupSubView: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const subView = this.getSetupSubView();
        console.log('subView:', subView);
        return subView;
      }),
      startWith(this.getSetupSubView())
    ),
    { initialValue: '' }
  );


  // * return full route without process-cooling/assessmentId:
  readonly fullSubroute: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        return this.getFullSubroute();
      }),
      startWith(this.getFullSubroute())
    ),
    { initialValue: '' }
  );


  private getCurrentMainView(): string {
    const urlSegments = this.router.url.split('/').filter(s => s);
    return urlSegments[this.urlSegmentIndex.main] || '';
  }

  private getCurrentChildView(): string {
    const urlSegments = this.router.url.split('/').filter(s => s);
    return urlSegments[this.urlSegmentIndex.setup] || '';
  }

   private getSetupSubView(): string {
    const urlSegments = this.router.url.split('/').filter(s => s);
    return urlSegments[this.urlSegmentIndex.subview] || '';
  }

  private getFullSubroute(): string {
    const urlSegments = this.router.url.split('/').filter(s => s);
    urlSegments.splice(0, 2);
    const fullSubroute = urlSegments.join('/');
    return fullSubroute;
  }

  private buildUrl(path: string): string {
    const id = this.processCoolingAssessmentService.assessmentId;
    return `/process-cooling/${id}/${path}`;
  }

  getCurrentStepIndex(): number {
    return this.STEPPED_ROUTES.findIndex(route => this.fullSubroute() === route.path);
  }

  canContinue(): boolean {
    const currentIndex = this.getCurrentStepIndex();
    return this.canVisitView(currentIndex + 1);
  }

  canGoBack(): boolean {
    return this.getCurrentStepIndex() > 0;
  }

  continue(): void {
    const currentIndex = this.getCurrentStepIndex();
    const nextIndex = currentIndex + 1;
    if (this.STEPPED_ROUTES[nextIndex] && this.canContinue()) {
      const url = this.buildUrl(this.STEPPED_ROUTES[nextIndex].path);
      this.router.navigateByUrl(url);
    }
  }

  back(): void {
    const currentIndex = this.getCurrentStepIndex();
    const prevIndex = currentIndex - 1;
    if (this.STEPPED_ROUTES[prevIndex]) {
      const url = this.buildUrl(this.STEPPED_ROUTES[prevIndex].path);
      this.router.navigateByUrl(url);
    }
  }

  canVisitView(index: number): boolean {
    switch (index) {
      case 0: return true;
      case 1: return true;
      case 2: return this.processCoolingAssessmentService.isSystemInformationValid();
      case 3: return this.processCoolingAssessmentService.isChillerInventoryValid();
      default: return false;
    }
  }

}

export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';
export type ProcessCoolingAssessmentTabString = 'explore-opportunities';

export enum MainView {
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

export enum SystemInformationView {
  OPERATIONS = 'operations',
  PUMP = 'pump',
  CONDENSER_COOLING_SYSTEM_INPUT = 'condenser-cooling-system'
}

export enum AssessmentView {
 EXPLORE_OPPORTUNITIES = 'explore-opportunities',
}

export enum ReportView {
  EXECUTIVE_SUMMARY = 'executive-summary',
  PUMP_SUMMARY = 'pump-summary',
  TOWER_SUMMARY = 'tower-summary',
  GRAPHS = 'graphs',
}


export interface ViewLink {
  view: SetupView | MainView | ReportView | AssessmentView | SystemInformationView;
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

// todo get is route available via filter pipe
export const SYSTEM_INFORMATION_VIEW_LINKS: ViewLink[] = [
  {
    view: SystemInformationView.OPERATIONS,
    label: 'Operations',
  },
  {
    view: SystemInformationView.PUMP,
    label: 'Pump',
  },
  {
    view: SystemInformationView.CONDENSER_COOLING_SYSTEM_INPUT,
    label: 'Condenser Cooling'
  },

]

export const ASSESSMENT_VIEW_LINKS: ViewLink[] = [
  {
    view: AssessmentView.EXPLORE_OPPORTUNITIES,
    label: 'Explore Opportunities',
  },
]

export const REPORT_VIEW_LINKS: ViewLink[] = [
  {
    view: ReportView.EXECUTIVE_SUMMARY,
    label: 'Executive Summary',
  },
  {
    view: ReportView.PUMP_SUMMARY,
    label: 'Pump Summary',
  },
  {
    view: ReportView.TOWER_SUMMARY,
    label: 'Tower Summary',
  },
  {
    view: ReportView.GRAPHS,
    label: 'Graphs',
  },
]
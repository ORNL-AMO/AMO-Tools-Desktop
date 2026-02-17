import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { WEATHER_CONTEXT } from '../../shared/modules/weather-data/weather-context.token';
import { SystemInformationFormService } from '../system-information/system-information-form.service';
import { ROUTE_TOKENS as WEATHER_ROUTE_TOKENS } from '../../shared/modules/weather-data/models/routes';
import { ModificationService } from './modification.service';

@Injectable()
export class ProcessCoolingUiService {
  private router = inject(Router);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  // todo move this service out when we revise valid handling in the assessment service
  private systemInformationFormService = inject(SystemInformationFormService);
  private weatherContextService = inject(WEATHER_CONTEXT);

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
      view: ROUTE_TOKENS.operations,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.operations}`
    },
    {
      view: ROUTE_TOKENS.weather,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.weather}`
    },
    {
      view: ROUTE_TOKENS.waterPump,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.waterPump}`
    },
    {
      view: ROUTE_TOKENS.condenserCoolingSystem,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.condenserCoolingSystem}`
    },
    {
      view: ROUTE_TOKENS.tower,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.tower}`
    },
    {
      view: ROUTE_TOKENS.chillerInventory,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.chillerInventory}`
    },
    {
      view: ROUTE_TOKENS.operatingSchedule,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.operatingSchedule}`
    },
    {
      view: ROUTE_TOKENS.loadSchedule,
      path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.loadSchedule}`
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


  // todo 8129 optimization - called on every rerender. 
  // todo this pattern should be changed or improved when we get concrete information on what is required for results calculation. memoize, or map/array of vals to Observable
  canVisitSteppedView(steppedRouteIndex: number): boolean {
    const processCooling = this.processCoolingAssessmentService.processCoolingSignal();
    const settings = this.processCoolingAssessmentService.settingsSignal();

    const isWeatherDataValid = this.weatherContextService.isValidWeatherData();
    switch (steppedRouteIndex) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        const canVisitPump = isWeatherDataValid;
        return canVisitPump;
      case 4:
        const canVisitCondenser = isWeatherDataValid && this.systemInformationFormService.isPumpValid(processCooling.systemInformation, settings);
        return canVisitCondenser;
      case 5:
        const canVisitTower = isWeatherDataValid && this.systemInformationFormService.isCondenserSystemInputValid(processCooling.systemInformation, settings);
        return canVisitTower;
      case 6:
        const canVisitInventory = isWeatherDataValid && this.systemInformationFormService.isSystemInformationValid(processCooling.systemInformation, settings);
        return canVisitInventory;
      case 7:
        const canVisitOperatingSchedule = isWeatherDataValid
          && this.systemInformationFormService.isSystemInformationValid(processCooling.systemInformation, settings)
          && this.processCoolingAssessmentService.isChillerInventoryValid();
        return canVisitOperatingSchedule;
      case 8:
        const canVisitLoadSchedule = isWeatherDataValid
          && this.systemInformationFormService.isSystemInformationValid(processCooling.systemInformation, settings)
          && this.processCoolingAssessmentService.isChillerInventoryValid()
          && this.processCoolingAssessmentService.isOperatingScheduleValid(processCooling.weeklyOperatingSchedule, processCooling.monthlyOperatingSchedule);
        return canVisitLoadSchedule;
      case 9:
        const canVisitAssessment = isWeatherDataValid
          && this.systemInformationFormService.isSystemInformationValid(processCooling.systemInformation, settings)
          && this.processCoolingAssessmentService.isChillerInventoryValid()
          && this.processCoolingAssessmentService.isOperatingScheduleValid(processCooling.weeklyOperatingSchedule, processCooling.monthlyOperatingSchedule);
        return canVisitAssessment;
      case 10:
        // todo if isAssessmentValid
        const canVisitReport = isWeatherDataValid
          && this.systemInformationFormService.isSystemInformationValid(processCooling.systemInformation, settings)
          && this.processCoolingAssessmentService.isChillerInventoryValid()
          && this.processCoolingAssessmentService.isOperatingScheduleValid(processCooling.weeklyOperatingSchedule, processCooling.monthlyOperatingSchedule)
          && this.modificationService.isModificationValid();
        return canVisitReport;
      default:
        // * route does not need protection (ex. baseline)
        return true;
    }
  }



  readonly mainView: Signal<string> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const mainView = this.getCurrentMainView();
        // console.log('mainView:', mainView);
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
        // console.log('childView:', childView);
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
        // console.log('subView:', subView);
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

  /**
   * Get stepped index number from full subroute
   * Ex. 'baseline/system-information/operations' => 1
   */
  getCurrentStepIndex(): number {
    const fullSubroute = this.getFullSubroute();
    return this.STEPPED_ROUTES.findIndex(route => {
      const isWeatherRouteMatch = fullSubroute.includes(ROUTE_TOKENS.weather) && route.path.includes(ROUTE_TOKENS.weather);
      if (isWeatherRouteMatch) {
        return true;
      }
      return fullSubroute === route.path;
    });
  }

  canContinue(): boolean {
    const currentIndex = this.getCurrentStepIndex();
    return this.canVisitSteppedView(currentIndex + 1);
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

  canVisitView(view: ProcessCoolingView): boolean {
    let steppedViewIndex = this.STEPPED_ROUTES.findIndex(route => route.view === view);
    if (view === SetupView.SYSTEM_INFORMATION) {
      return true;
    }
    return this.canVisitSteppedView(steppedViewIndex);
  }

  navigateSystemInformationTab(link: ViewLink): void {
    if (link.view === SystemInformationView.WEATHER) {
      let weatherRoute: string = WEATHER_ROUTE_TOKENS.stations;
      if (this.weatherContextService.isValidWeatherData()) {
        weatherRoute = WEATHER_ROUTE_TOKENS.annualStation;
      }

      const url = this.buildUrl(`${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemInformation}/${ROUTE_TOKENS.weather}/${weatherRoute}`);
      this.router.navigateByUrl(url);
    } else {
      const routeConfig = this.STEPPED_ROUTES.find(route => route.view === link.view);
      if (routeConfig) {
        const url = this.buildUrl(routeConfig.path);
        this.router.navigateByUrl(url);
      }
    }
  }

}

// todo move below out to models/types folder
export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';
export type ProcessCoolingAssessmentTabString = 'explore-opportunities';
export type ProcessCoolingView = SetupView | MainView | ReportView | AssessmentView | SystemInformationView;

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
  WEATHER = 'weather',
  PUMP = 'pump',
  CONDENSER_COOLING_SYSTEM_INPUT = 'condenser-cooling-system',
  TOWER = 'tower',
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
  view: ProcessCoolingView;
  label: string;
  param?: string | number;
  meta?: {
    disabled?: boolean;
  };
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
    view: SystemInformationView.WEATHER,
    label: 'Weather',
  },
  {
    view: SystemInformationView.PUMP,
    label: 'Pump',
  },
  {
    view: SystemInformationView.CONDENSER_COOLING_SYSTEM_INPUT,
    label: 'Condenser Cooling'
  },
  {
    view: SystemInformationView.TOWER,
    label: 'Tower',
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
    meta: {
      disabled: true
    }
  },
  {
    view: ReportView.TOWER_SUMMARY,
    label: 'Tower Summary',
    meta: {
      disabled: true
    }
  },
  {
    view: ReportView.GRAPHS,
    label: 'Graphs',
    meta: {
      disabled: true
    }
  },
]
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { WEATHER_CONTEXT } from '../../shared/modules/weather-data/weather-context.token';
import { ROUTE_TOKENS as WEATHER_ROUTE_TOKENS } from '../../shared/modules/weather-data/models/routes';
import { SummaryView } from './executive-summary-results.service';
import { ProfileView } from './system-profile.service';
import { ProcessCoolingView, SetupView, SystemInformationView, ViewLink } from '../models/views';
export { ProcessCoolingMainTabString, ProcessCoolingSetupTabString, ProcessCoolingAssessmentTabString, ProcessCoolingView, MainView, SetupView, SystemInformationView, AssessmentView, ReportView, ViewLink, MAIN_VIEW_LINKS, SETUP_VIEW_LINKS, SYSTEM_INFORMATION_VIEW_LINKS, ASSESSMENT_VIEW_LINKS, REPORT_VIEW_LINKS } from '../models/views';

interface ProcessCoolingRouteData {
  mainView?: string;
  childView?: string;
  setupSubView?: string;
  stepIndex?: number;
}

@Injectable()
export class ProcessCoolingUiService {
  private router = inject(Router);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private weatherContextService = inject(WEATHER_CONTEXT);

  private readonly isWeatherDataValidSignal = toSignal(this.processCoolingAssessmentService.isWeatherDataValid$, { initialValue: false });
  private readonly isPumpValidSignal = toSignal(this.processCoolingAssessmentService.isPumpValid$, { initialValue: false });
  private readonly isCondenserValidSignal = toSignal(this.processCoolingAssessmentService.isCondenserValid$, { initialValue: false });
  private readonly isSystemInformationValidSignal = toSignal(this.processCoolingAssessmentService.isSystemInformationValid$, { initialValue: false });
  private readonly isChillerInventoryValidSignal = toSignal(this.processCoolingAssessmentService.isChillerInventoryValid$, { initialValue: false });
  private readonly isOperatingScheduleValidSignal = toSignal(this.processCoolingAssessmentService.isOperatingScheduleValid$, { initialValue: false });

  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  selectedModificationIdSignal: WritableSignal<string> = signal<string>('');
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  
  executiveSummaryViewSignal: WritableSignal<SummaryView> = signal<SummaryView>('baseline-panel');
  profileViewSignal: WritableSignal<ProfileView> = signal<ProfileView>('baseline');

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


  private canVisitSteppedView(steppedRouteIndex: number): boolean {
    switch (steppedRouteIndex) {
      case 0:
      case 1:
      case 2:
        return true;
      case 3:
        return this.isWeatherDataValidSignal();
      case 4:
        return this.isWeatherDataValidSignal() && this.isPumpValidSignal();
      case 5:
        return this.isWeatherDataValidSignal() && this.isCondenserValidSignal();
      case 6:
        return this.isSystemInformationValidSignal();
      case 7:
        return this.isSystemInformationValidSignal() && this.isChillerInventoryValidSignal();
      case 8:
      case 9:
      case 10:
        return this.isSystemInformationValidSignal()
          && this.isChillerInventoryValidSignal()
          && this.isOperatingScheduleValidSignal();
      default:
        return true;
    }
  }



  private getActiveRouteData(): ProcessCoolingRouteData {
    let snapshot = this.router.routerState.snapshot.root;
    let merged: ProcessCoolingRouteData = {};
    while (snapshot) {
      merged = { ...merged, ...snapshot.data };
      snapshot = snapshot.firstChild;
    }
    return merged;
  }

  private readonly routeData: Signal<ProcessCoolingRouteData> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getActiveRouteData()),
      startWith(this.getActiveRouteData())
    ),
    { initialValue: {} }
  );

  readonly mainView: Signal<string> = computed(() => this.routeData().mainView ?? '');
  readonly childView: Signal<string> = computed(() => this.routeData().childView ?? '');
  readonly setupSubView: Signal<string> = computed(() => this.routeData().setupSubView ?? '');

  readonly currentStepIndex: Signal<number> = computed(() => this.routeData().stepIndex ?? -1);

  readonly canContinue: Signal<boolean> = computed(() => this.canVisitSteppedView(this.currentStepIndex() + 1));
  readonly canGoBack: Signal<boolean> = computed(() => this.currentStepIndex() > 0);

  private buildUrl(path: string): string {
    const id = this.processCoolingAssessmentService.assessmentId;
    return `/process-cooling/${id}/${path}`;
  }

  continue(): void {
    const nextIndex = this.currentStepIndex() + 1;
    if (this.STEPPED_ROUTES[nextIndex] && this.canContinue()) {
      const url = this.buildUrl(this.STEPPED_ROUTES[nextIndex].path);
      this.router.navigateByUrl(url);
    }
  }

  back(): void {
    const prevIndex = this.currentStepIndex() - 1;
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

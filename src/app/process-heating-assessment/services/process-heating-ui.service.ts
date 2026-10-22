import { computed, inject, Injectable, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { AssessmentView, EXPERT_VIEW_LOSS_VIEWS, HEAT_BALANCE_VIEW_LINKS, HeatingEquipmentConfiguration, isViewVisibleForConfiguration, MainView, ProcessHeatingView, ReportView, ViewLink } from '../models/views';
import { ProcessHeatingRouteData, STEPPED_ROUTES } from '../routing/stepped-routes';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingValidityService } from './process-heating-validity.service';
export { MainView, BaselineView, AssessmentView, ReportView, LossView, HeatingEquipmentConfiguration, ProcessHeatingView, ViewLink, MAIN_VIEW_LINKS, BASELINE_VIEW_LINKS, HEAT_BALANCE_VIEW_LINKS, REPORT_VIEW_LINKS } from '../models/views';

@Injectable()
export class ProcessHeatingUiService {
  private readonly router = inject(Router);
  private readonly processHeatingAssessmentService = inject(ProcessHeatingAssessmentService);
  private readonly validityService = inject(ProcessHeatingValidityService);

  private readonly STEPPED_ROUTES = inject(STEPPED_ROUTES);

  private readonly REQUIRES_VALID_BASELINE_VIEWS: ReadonlySet<string> = new Set<string>([
    MainView.ASSESSMENT, MainView.REPORT, ...Object.values(AssessmentView), ...Object.values(ReportView),
  ]);

  // Derived from assessment settings — energySourceType + furnaceType determine the active tab set
  readonly heatingSystemConfigurationSignal: Signal<HeatingEquipmentConfiguration> =
    this.processHeatingAssessmentService.heatingEquipmentConfiguration;
    
  activeModificationIdSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  // UI state signals
  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);

  readonly isAssessmentSettingsValidSignal: Signal<boolean> = this.validityService.isAssessmentSettingsValid;
  readonly isHeatBalanceValidSignal: Signal<boolean> = computed(() => this.validityService.scenarioValidity('baseline').isValid);

  // Loss tabs filtered to the active HeatingSystemConfiguration
  readonly visibleHeatBalanceTabs: Signal<ViewLink[]> = computed(() =>
    HEAT_BALANCE_VIEW_LINKS.filter(link => this.isTabVisibleForHeatingEquipmentConfiguration(link.view))
  );

  readonly visibleExpertViewTabs: Signal<ViewLink[]> = computed(() =>
    this.visibleHeatBalanceTabs().filter(link => EXPERT_VIEW_LOSS_VIEWS.has(link.view))
  );

  // Service-held so the selection survives leaving and returning to Expert View. Falls back to the
  // first tab when a configuration change hides the selected one.
  private readonly _selectedExpertViewTab = linkedSignal<ViewLink[], ProcessHeatingView | undefined>({
    source: this.visibleExpertViewTabs,
    computation: (tabs, previous) =>
      tabs.some(link => link.view === previous?.value) ? previous.value : tabs[0]?.view,
  });
  readonly selectedExpertViewTab: Signal<ProcessHeatingView | undefined> = this._selectedExpertViewTab.asReadonly();

  selectExpertViewTab(view: ProcessHeatingView): void {
    this._selectedExpertViewTab.set(view);
  }

  private getActiveRouteData(): ProcessHeatingRouteData {
    let snapshot = this.router.routerState.snapshot.root;
    let merged: ProcessHeatingRouteData = {};
    while (snapshot) {
      merged = { ...merged, ...snapshot.data };
      snapshot = snapshot.firstChild;
    }
    return merged;
  }

  private readonly routeData: Signal<ProcessHeatingRouteData> = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getActiveRouteData()),
      startWith(this.getActiveRouteData())
    ),
    { initialValue: {} }
  );

  readonly mainView: Signal<string> = computed(() => this.routeData().mainView ?? '');
  readonly childView: Signal<string> = computed(() => this.routeData().childView ?? '');
  readonly lossSubView: Signal<string> = computed(() => this.routeData().lossSubView ?? '');
  readonly currentStepIndex: Signal<number> = computed(() => this.routeData().stepIndex ?? -1);

  readonly canContinue: Signal<boolean> = computed(() => {
    const nextIndex = this.findNextVisibleStep(this.currentStepIndex() + 1, 'forward');
    return nextIndex !== -1 && this.canVisitView(this.STEPPED_ROUTES[nextIndex].view);
  });
  readonly canGoBack: Signal<boolean> = computed(() =>
    this.findNextVisibleStep(this.currentStepIndex() - 1, 'back') !== -1
  );

  readonly showResultsPanel: Signal<boolean> = computed(() =>
    this.childView() !== ROUTE_TOKENS.heatBalance
  );

  private get assessmentId(): string {
    let snapshot = this.router.routerState.snapshot.root;
    while (snapshot) {
      if (snapshot.params['assessmentId']) return snapshot.params['assessmentId'];
      snapshot = snapshot.firstChild;
    }
    return '';
  }

  private buildUrl(path: string): string {
    return `/process-heating/${this.assessmentId}/${path}`;
  }

  private isTabVisibleForHeatingEquipmentConfiguration(view: string): boolean {
    return isViewVisibleForConfiguration(view, this.heatingSystemConfigurationSignal());
  }

  private findNextVisibleStep(startIndex: number, direction: 'forward' | 'back'): number {
    const step = direction === 'forward' ? 1 : -1;
    let i = startIndex;
    while (i >= 0 && i < this.STEPPED_ROUTES.length) {
      if (this.isTabVisibleForHeatingEquipmentConfiguration(this.STEPPED_ROUTES[i].view)) {
        return i;
      }
      i += step;
    }
    return -1;
  }

  continue(): void {
    const nextIndex = this.findNextVisibleStep(this.currentStepIndex() + 1, 'forward');
    if (nextIndex !== -1 && this.canVisitView(this.STEPPED_ROUTES[nextIndex].view)) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[nextIndex].path));
    }
  }

  back(): void {
    const prevIndex = this.findNextVisibleStep(this.currentStepIndex() - 1, 'back');
    if (prevIndex !== -1) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[prevIndex].path));
    }
  }

  /** Assessment and Report need valid baseline inputs, since they present results built from them. */
  canVisitView(view: string): boolean {
    if (!this.isTabVisibleForHeatingEquipmentConfiguration(view)) return false;
    return !this.REQUIRES_VALID_BASELINE_VIEWS.has(view) || (this.isAssessmentSettingsValidSignal() && this.isHeatBalanceValidSignal());
  }
}

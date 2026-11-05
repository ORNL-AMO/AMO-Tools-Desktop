import { computed, inject, Injectable, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { Losses, Notes } from '../models/phast';
import { AssessmentView, BaselineView, EXPERT_VIEW_LOSS_VIEWS, HEAT_BALANCE_VIEW_LINKS, HeatingEquipmentConfiguration, isViewVisibleForConfiguration, LossView, MainView, ProcessHeatingView, ReportView, ViewLink } from '../models/views';
import { ProcessHeatingRouteData, STEPPED_ROUTES } from '../routing/stepped-routes';
import { AssessmentScenario, ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingValidityService } from './process-heating-validity.service';
export { MainView, BaselineView, AssessmentView, ReportView, LossView, HeatingEquipmentConfiguration, ProcessHeatingView, ViewLink, MAIN_VIEW_LINKS, BASELINE_VIEW_LINKS, HEAT_BALANCE_VIEW_LINKS, REPORT_VIEW_LINKS } from '../models/views';

@Injectable()
export class ProcessHeatingUiService {
  private readonly router = inject(Router);
  private readonly processHeatingAssessmentService = inject(ProcessHeatingAssessmentService);
  private readonly validityService = inject(ProcessHeatingValidityService);

  private readonly STEPPED_ROUTES = inject(STEPPED_ROUTES);

  private readonly REQUIRES_VALID_BASELINE_VIEWS: ReadonlySet<string> = new Set<string>([
    MainView.ASSESSMENT, MainView.DIAGRAM, MainView.REPORT, MainView.SANKEY, ...Object.values(AssessmentView), ...Object.values(ReportView),
  ]);

  private readonly LOSS_VIEW_KEYS: Partial<Record<string, keyof Losses>> = {
    [LossView.CHARGE_MATERIAL]: 'chargeMaterials',
    [LossView.FLUE_GAS]: 'flueGasLosses',
    [LossView.WALL_LOSSES]: 'wallLosses',
    [LossView.EXTENDED_SURFACE]: 'extendedSurfaces',
    [LossView.ATMOSPHERE]: 'atmosphereLosses',
    [LossView.FIXTURE]: 'fixtureLosses',
    [LossView.COOLING]: 'coolingLosses',
    [LossView.OPENING]: 'openingLosses',
    [LossView.OTHER]: 'otherLosses',
    [LossView.GAS_LEAKAGE]: 'leakageLosses',
    [LossView.AUXILIARY_POWER]: 'auxiliaryPowerLosses',
    [LossView.ENERGY_INPUT_EXHAUST_GAS]: 'energyInputExhaustGasLoss',
    [LossView.ENERGY_INPUT]: 'energyInputEAF',
    [LossView.EXHAUST_GAS]: 'exhaustGasEAF',
    [LossView.SLAG]: 'slagLosses',
  };

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

  private readonly exploreNotesFocus = signal<{ modificationId: string | undefined; key: keyof Notes } | undefined>(undefined);

  /** Notes field of the Explore Opportunities section last focused for the active modification. */
  readonly exploreNotesKey: Signal<keyof Notes | undefined> = computed(() => {
    const focus = this.exploreNotesFocus();
    return focus?.modificationId === this.activeModificationIdSignal() ? focus?.key : undefined;
  });

  setExploreNotesKey(key: keyof Notes): void {
    this.exploreNotesFocus.set({ modificationId: this.activeModificationIdSignal(), key });
  }

  readonly isAssessmentSettingsValidSignal: Signal<boolean> = this.validityService.isAssessmentSettingsValid;
  readonly isHeatBalanceValidSignal: Signal<boolean> = computed(() => this.validityService.scenarioValidity('baseline').isValid);

  /** Why Assessment, Diagram, Report and Sankey are disabled; undefined while the settings and baseline are valid. */
  readonly blockedReason: Signal<string | undefined> = computed(() => {
    const invalidSteps = [
      ...(this.isAssessmentSettingsValidSignal() ? [] : ['Assessment Settings']),
      ...this.validityService.invalidStepLabels('baseline'),
    ];
    return invalidSteps.length ? `Fix invalid inputs in: ${invalidSteps.join(', ')}` : undefined;
  });

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
    if (!this.canContinue()) return;
    const nextIndex = this.findNextVisibleStep(this.currentStepIndex() + 1, 'forward');
    this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[nextIndex].path));
  }

  back(): void {
    const prevIndex = this.findNextVisibleStep(this.currentStepIndex() - 1, 'back');
    if (prevIndex !== -1) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[prevIndex].path));
    }
  }

  /** Marks the Baseline and Heat Balance tabs whose invalid inputs block Assessment and Report. */
  isViewInvalid(view: string): boolean {
    switch (view) {
      case BaselineView.ASSESSMENT_SETTINGS:
        return !this.isAssessmentSettingsValidSignal();
      case BaselineView.HEAT_BALANCE:
        return !this.isHeatBalanceValidSignal();
      default:
        return !this.validityService.isStepValid('baseline', view);
    }
  }

  /**
   * @param view heat balance step
   * @param scenario 'baseline' or a modification id
   * @returns how many entries the scenario's step holds; undefined for a step that doesn't hold entries
   */
  lossCount(view: string, scenario: AssessmentScenario = 'baseline'): number | undefined {
    if (view === LossView.HEAT_SYSTEM_EFFICIENCY) {
      return this.processHeatingAssessmentService.scenarioPhastSignal(scenario)?.systemEfficiency ? 1 : 0;
    }
    const lossKey = this.LOSS_VIEW_KEYS[view];
    return lossKey ? this.processHeatingAssessmentService.lossSignal(scenario, lossKey)?.length ?? 0 : undefined;
  }

  /** Assessment, Diagram, Report and Sankey need valid baseline inputs, since they present results built from them. */
  canVisitView(view: string): boolean {
    if (!this.isTabVisibleForHeatingEquipmentConfiguration(view)) return false;
    return !this.REQUIRES_VALID_BASELINE_VIEWS.has(view) || (this.isAssessmentSettingsValidSignal() && this.isHeatBalanceValidSignal());
  }
}

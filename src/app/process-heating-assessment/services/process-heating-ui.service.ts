import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { HEAT_BALANCE_VIEW_LINKS, HeatingEquipmentConfiguration, ProcessHeatingView, ViewLink } from '../models/views';
export { MainView, BaselineView, AssessmentView, ReportView, LossView, HeatingEquipmentConfiguration, ProcessHeatingView, ViewLink, MAIN_VIEW_LINKS, BASELINE_VIEW_LINKS, HEAT_BALANCE_VIEW_LINKS, REPORT_VIEW_LINKS } from '../models/views';

interface ProcessHeatingRouteData {
  mainView?: string;
  childView?: string;
  lossSubView?: string;
  stepIndex?: number;
}

@Injectable()
export class ProcessHeatingUiService {
  private readonly router = inject(Router);

  private readonly HEAT_BALANCE_BASE = `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.heatBalance}`;

  private readonly STEPPED_ROUTES = [
    // index 0
    { view: ROUTE_TOKENS.systemBasics,          path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.systemBasics}` },
    // indices 1-16: heat balance loss tabs
    { view: ROUTE_TOKENS.chargeMaterial,        path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.chargeMaterial}` },
    { view: ROUTE_TOKENS.wallLosses,            path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.wallLosses}` },
    { view: ROUTE_TOKENS.extendedSurface,       path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.extendedSurface}` },
    { view: ROUTE_TOKENS.atmosphere,            path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.atmosphere}` },
    { view: ROUTE_TOKENS.fixture,               path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.fixture}` },
    { view: ROUTE_TOKENS.cooling,               path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.cooling}` },
    { view: ROUTE_TOKENS.opening,               path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.opening}` },
    { view: ROUTE_TOKENS.other,                 path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.other}` },
    { view: ROUTE_TOKENS.flueGas,               path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.flueGas}` },
    { view: ROUTE_TOKENS.gasLeakage,            path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.gasLeakage}` },
    { view: ROUTE_TOKENS.auxiliaryPower,        path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.auxiliaryPower}` },
    { view: ROUTE_TOKENS.energyInputExhaustGas, path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.energyInputExhaustGas}` },
    { view: ROUTE_TOKENS.energyInput,           path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.energyInput}` },
    { view: ROUTE_TOKENS.exhaustGas,            path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.exhaustGas}` },
    { view: ROUTE_TOKENS.slag,                  path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.slag}` },
    { view: ROUTE_TOKENS.heatSystemEfficiency,  path: `${this.HEAT_BALANCE_BASE}/${ROUTE_TOKENS.heatSystemEfficiency}` },
    // indices 17-21: remaining baseline and top-level tabs
    { view: ROUTE_TOKENS.auxiliaryEquipment,    path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.auxiliaryEquipment}` },
    { view: ROUTE_TOKENS.designedEnergy,        path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.designedEnergy}` },
    { view: ROUTE_TOKENS.meteredEnergy,         path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.meteredEnergy}` },
    { view: ROUTE_TOKENS.assessment,            path: `${ROUTE_TOKENS.assessment}/${ROUTE_TOKENS.exploreOpportunities}` },
    { view: ROUTE_TOKENS.report,                path: `${ROUTE_TOKENS.report}` },
  ];

  // HeatingEquipmentConfiguration-specific loss tab sets
  private readonly FUEL_FIRED_ONLY = new Set<string>([ROUTE_TOKENS.flueGas, ROUTE_TOKENS.gasLeakage]);
  private readonly ELECTRO_STANDARD_ONLY = new Set<string>([ROUTE_TOKENS.auxiliaryPower, ROUTE_TOKENS.energyInputExhaustGas]);
  private readonly EAF_ONLY = new Set<string>([ROUTE_TOKENS.energyInput, ROUTE_TOKENS.exhaustGas, ROUTE_TOKENS.slag]);
  private readonly STEAM_CUSTOM_ONLY = new Set<string>([ROUTE_TOKENS.heatSystemEfficiency]);

  // HeatingEquipmentConfiguration and modification state — will be driven by assessment service in Step 3
  heatingSystemConfigurationSignal: WritableSignal<HeatingEquipmentConfiguration> = signal<HeatingEquipmentConfiguration>(HeatingEquipmentConfiguration.FUEL_FIRED);
  activeModificationIndexSignal: WritableSignal<number> = signal<number>(0);

  // UI state signals
  focusedFieldSignal: WritableSignal<string> = signal<string>('default');
  helpTextFieldSignal: WritableSignal<string> = signal<string>('default');
  modalOpenSignal: WritableSignal<boolean> = signal<boolean>(false);
  showModificationListModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showAddModificationModalSignal: WritableSignal<boolean> = signal<boolean>(false);
  showExportModalSignal: WritableSignal<boolean> = signal<boolean>(false);

  // Per-step validity signals — stubbed true, wired to assessment service in Step 3
  private readonly isSystemBasicsValidSignal: WritableSignal<boolean> = signal<boolean>(true);
  private readonly isHeatBalanceValidSignal: WritableSignal<boolean> = signal<boolean>(true);

  // Loss tabs filtered to the active HeatingSystemConfiguration
  readonly visibleHeatBalanceTabs: Signal<ViewLink[]> = computed(() =>
    HEAT_BALANCE_VIEW_LINKS.filter(link => this.isTabVisibleForHeatingEquipmentConfiguration(link.view))
  );

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

  readonly canContinue: Signal<boolean> = computed(() =>
    this.findNextVisibleStep(this.currentStepIndex() + 1, 'forward') !== -1
  );
  readonly canGoBack: Signal<boolean> = computed(() =>
    this.findNextVisibleStep(this.currentStepIndex() - 1, 'back') !== -1
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
    const heatingSystemConfiguration = this.heatingSystemConfigurationSignal();
    if (this.FUEL_FIRED_ONLY.has(view)) return heatingSystemConfiguration === HeatingEquipmentConfiguration.FUEL_FIRED;
    if (this.ELECTRO_STANDARD_ONLY.has(view)) return heatingSystemConfiguration === HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD;
    if (this.EAF_ONLY.has(view)) return heatingSystemConfiguration === HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF;
    if (this.STEAM_CUSTOM_ONLY.has(view)) {
      return heatingSystemConfiguration === HeatingEquipmentConfiguration.STEAM || heatingSystemConfiguration === HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY;
    }
    return true;
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
    if (nextIndex !== -1) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[nextIndex].path));
    }
  }

  back(): void {
    const prevIndex = this.findNextVisibleStep(this.currentStepIndex() - 1, 'back');
    if (prevIndex !== -1) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[prevIndex].path));
    }
  }

  canVisitView(view: ProcessHeatingView): boolean {
    return this.isTabVisibleForHeatingEquipmentConfiguration(view);
  }
}

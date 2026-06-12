import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ProcessHeatingView, ViewLink } from '../models/views';

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

  readonly canContinue: Signal<boolean> = computed(() => this.currentStepIndex() < this.STEPPED_ROUTES.length - 1);
  readonly canGoBack: Signal<boolean> = computed(() => this.currentStepIndex() > 0);

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

  continue(): void {
    const nextIndex = this.currentStepIndex() + 1;
    if (this.STEPPED_ROUTES[nextIndex] && this.canContinue()) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[nextIndex].path));
    }
  }

  back(): void {
    const prevIndex = this.currentStepIndex() - 1;
    if (this.STEPPED_ROUTES[prevIndex]) {
      this.router.navigateByUrl(this.buildUrl(this.STEPPED_ROUTES[prevIndex].path));
    }
  }

  // All views open in Step 1 — validity gates added in Step 2
  canVisitView(_view: ProcessHeatingView): boolean {
    return true;
  }
}

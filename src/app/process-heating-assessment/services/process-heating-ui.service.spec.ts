import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { BaselineView, HeatingEquipmentConfiguration, LossView, MainView, ReportView } from '../models/views';
import { STEPPED_ROUTES } from '../routing/stepped-routes';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingUiService } from './process-heating-ui.service';
import { ProcessHeatingValidityService } from './process-heating-validity.service';

const VALID_BASELINE = {
  isAssessmentSettingsValid: signal(true),
  scenarioValidity: () => ({ isValid: true }),
};

describe('ProcessHeatingUiService fuel-fired gating', () => {
  let service: ProcessHeatingUiService;
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;

  beforeEach(() => {
    configuration = signal<HeatingEquipmentConfiguration>(HeatingEquipmentConfiguration.FUEL_FIRED);
    const router = {
      events: new Subject(),
      routerState: { snapshot: { root: { params: {}, data: {}, firstChild: null } } },
    };
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingUiService,
        { provide: Router, useValue: router },
        { provide: ProcessHeatingAssessmentService, useValue: { heatingEquipmentConfiguration: configuration } },
        { provide: STEPPED_ROUTES, useValue: [] },
        { provide: ProcessHeatingValidityService, useValue: VALID_BASELINE },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  const fuelFiredViews = [LossView.FLUE_GAS, LossView.GAS_LEAKAGE];
  const otherConfigurations = Object.values(HeatingEquipmentConfiguration)
    .filter(value => value !== HeatingEquipmentConfiguration.FUEL_FIRED);

  it('shows Flue Gas and Gas Leakage in heat balance and Expert View for fuel-fired', () => {
    const heatBalance = service.visibleHeatBalanceTabs().map(link => link.view);
    const expertView = service.visibleExpertViewTabs().map(link => link.view);

    for (const view of fuelFiredViews) {
      expect(heatBalance).toContain(view);
      expect(expertView).toContain(view);
    }
  });

  for (const otherConfiguration of otherConfigurations) {
    it(`hides Flue Gas and Gas Leakage for ${otherConfiguration}`, () => {
      configuration.set(otherConfiguration);

      const heatBalance = service.visibleHeatBalanceTabs().map(link => link.view);
      const expertView = service.visibleExpertViewTabs().map(link => link.view);

      for (const view of fuelFiredViews) {
        expect(heatBalance).not.toContain(view);
        expect(expertView).not.toContain(view);
      }
    });
  }

  it('uses the same route tokens the gating set is keyed on', () => {
    expect(LossView.FLUE_GAS).toBe(ROUTE_TOKENS.flueGas);
    expect(LossView.GAS_LEAKAGE).toBe(ROUTE_TOKENS.gasLeakage);
  });
});

describe('ProcessHeatingUiService electrotechnology-standard gating', () => {
  let service: ProcessHeatingUiService;
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;

  beforeEach(() => {
    configuration = signal<HeatingEquipmentConfiguration>(HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD);
    const router = {
      events: new Subject(),
      routerState: { snapshot: { root: { params: {}, data: {}, firstChild: null } } },
    };
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingUiService,
        { provide: Router, useValue: router },
        { provide: ProcessHeatingAssessmentService, useValue: { heatingEquipmentConfiguration: configuration } },
        { provide: STEPPED_ROUTES, useValue: [] },
        { provide: ProcessHeatingValidityService, useValue: VALID_BASELINE },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  const electroStandardViews = [LossView.AUXILIARY_POWER, LossView.ENERGY_INPUT_EXHAUST_GAS];
  const hiddenConfigurations = [
    HeatingEquipmentConfiguration.FUEL_FIRED,
    HeatingEquipmentConfiguration.STEAM,
    HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF,
    HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY,
  ];

  it('covers every configuration other than electrotechnology-standard', () => {
    const expected = Object.values(HeatingEquipmentConfiguration)
      .filter(value => value !== HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD);

    expect(hiddenConfigurations.slice().sort()).toEqual(expected.slice().sort());
  });

  it('shows Auxiliary Power and Energy Input Exhaust Gas in heat balance and Expert View for electrotechnology-standard', () => {
    const heatBalance = service.visibleHeatBalanceTabs().map(link => link.view);
    const expertView = service.visibleExpertViewTabs().map(link => link.view);

    for (const view of electroStandardViews) {
      expect(heatBalance).toContain(view);
      expect(expertView).toContain(view);
    }
  });

  for (const hiddenConfiguration of hiddenConfigurations) {
    it(`hides Auxiliary Power and Energy Input Exhaust Gas for ${hiddenConfiguration}`, () => {
      configuration.set(hiddenConfiguration);

      const heatBalance = service.visibleHeatBalanceTabs().map(link => link.view);
      const expertView = service.visibleExpertViewTabs().map(link => link.view);

      for (const view of electroStandardViews) {
        expect(heatBalance).not.toContain(view);
        expect(expertView).not.toContain(view);
      }
    });
  }

  it('uses the same route tokens the gating set is keyed on', () => {
    expect(LossView.AUXILIARY_POWER).toBe(ROUTE_TOKENS.auxiliaryPower);
    expect(LossView.ENERGY_INPUT_EXHAUST_GAS).toBe(ROUTE_TOKENS.energyInputExhaustGas);
  });
});

describe('ProcessHeatingUiService EAF and heat system efficiency gating', () => {
  let service: ProcessHeatingUiService;
  let configuration: WritableSignal<HeatingEquipmentConfiguration>;

  beforeEach(() => {
    configuration = signal<HeatingEquipmentConfiguration>(HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF);
    const router = {
      events: new Subject(),
      routerState: { snapshot: { root: { params: {}, data: {}, firstChild: null } } },
    };
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingUiService,
        { provide: Router, useValue: router },
        { provide: ProcessHeatingAssessmentService, useValue: { heatingEquipmentConfiguration: configuration } },
        { provide: STEPPED_ROUTES, useValue: [] },
        { provide: ProcessHeatingValidityService, useValue: VALID_BASELINE },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  const eafViews = [LossView.ENERGY_INPUT, LossView.EXHAUST_GAS, LossView.SLAG];
  const steamCustomViews = [LossView.HEAT_SYSTEM_EFFICIENCY];

  function visibleViews(): { heatBalance: unknown[]; expertView: unknown[] } {
    return {
      heatBalance: service.visibleHeatBalanceTabs().map(link => link.view),
      expertView: service.visibleExpertViewTabs().map(link => link.view),
    };
  }

  for (const config of Object.values(HeatingEquipmentConfiguration)) {
    it(`shows EAF forms only and Heat System Efficiency only per gating for ${config}`, () => {
      configuration.set(config);
      const { heatBalance, expertView } = visibleViews();
      const eafVisible = config === HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF;
      const steamCustomVisible = config === HeatingEquipmentConfiguration.STEAM || config === HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY;

      for (const view of eafViews) {
        expect(heatBalance.includes(view)).toBe(eafVisible);
        expect(expertView.includes(view)).toBe(eafVisible);
      }
      for (const view of steamCustomViews) {
        expect(heatBalance.includes(view)).toBe(steamCustomVisible);
        expect(expertView.includes(view)).toBe(steamCustomVisible);
      }
    });
  }

  it('uses the same route tokens the gating sets are keyed on', () => {
    expect(LossView.ENERGY_INPUT).toBe(ROUTE_TOKENS.energyInput);
    expect(LossView.EXHAUST_GAS).toBe(ROUTE_TOKENS.exhaustGas);
    expect(LossView.SLAG).toBe(ROUTE_TOKENS.slag);
    expect(LossView.HEAT_SYSTEM_EFFICIENCY).toBe(ROUTE_TOKENS.heatSystemEfficiency);
  });
});

describe('ProcessHeatingUiService validity gating', () => {
  const STEPS = [
    { view: BaselineView.METERED_ENERGY, path: 'baseline/metered-energy' },
    { view: MainView.ASSESSMENT, path: 'assessment' },
    { view: MainView.REPORT, path: 'report' },
  ];
  let service: ProcessHeatingUiService;
  let router: { events: Subject<unknown>; routerState: unknown; navigateByUrl: jasmine.Spy };
  let routeData: { stepIndex: number };
  let settingsValid: WritableSignal<boolean>;
  let baselineValid: WritableSignal<boolean>;

  beforeEach(() => {
    settingsValid = signal(true);
    baselineValid = signal(true);
    routeData = { stepIndex: 0 };
    router = {
      events: new Subject(),
      routerState: { snapshot: { root: { params: { assessmentId: '7' }, data: routeData, firstChild: null } } },
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingUiService,
        { provide: Router, useValue: router },
        { provide: ProcessHeatingAssessmentService, useValue: { heatingEquipmentConfiguration: signal(HeatingEquipmentConfiguration.FUEL_FIRED) } },
        { provide: STEPPED_ROUTES, useValue: STEPS },
        {
          provide: ProcessHeatingValidityService,
          useValue: { isAssessmentSettingsValid: settingsValid, scenarioValidity: () => ({ isValid: baselineValid() }) },
        },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  it('exposes the validity of the settings and the baseline heat balance', () => {
    expect(service.isAssessmentSettingsValidSignal()).toBeTrue();
    expect(service.isHeatBalanceValidSignal()).toBeTrue();

    settingsValid.set(false);
    baselineValid.set(false);

    expect(service.isAssessmentSettingsValidSignal()).toBeFalse();
    expect(service.isHeatBalanceValidSignal()).toBeFalse();
  });

  it('allows Assessment and Report when settings and baseline are valid', () => {
    expect(service.canVisitView(MainView.ASSESSMENT)).toBeTrue();
    expect(service.canVisitView(MainView.REPORT)).toBeTrue();
  });

  for (const [name, invalidate] of [
    ['the settings are', () => settingsValid.set(false)],
    ['the baseline heat balance is', () => baselineValid.set(false)],
  ] as const) {
    it(`blocks Assessment and Report views while ${name} invalid`, () => {
      invalidate();

      expect(service.canVisitView(MainView.ASSESSMENT)).toBeFalse();
      expect(service.canVisitView(MainView.REPORT)).toBeFalse();
      expect(service.canVisitView(ReportView.EXECUTIVE_SUMMARY)).toBeFalse();
    });

    it(`keeps Baseline views reachable while ${name} invalid`, () => {
      invalidate();

      expect(service.canVisitView(MainView.BASELINE)).toBeTrue();
      expect(service.canVisitView(LossView.WALL_LOSSES)).toBeTrue();
    });

    it(`stops Continue at the end of Baseline while ${name} invalid`, () => {
      invalidate();

      expect(service.canContinue()).toBeFalse();
      service.continue();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  }

  it('continues from the end of Baseline to Assessment when valid', () => {
    expect(service.canContinue()).toBeTrue();

    service.continue();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/process-heating/7/assessment');
  });
});

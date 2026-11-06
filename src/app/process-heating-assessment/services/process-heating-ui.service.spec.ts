import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { WallLoss } from '../../shared/models/phast/losses/wallLoss';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { Losses, PHAST } from '../models/phast';
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
  let invalidBaselineSteps: WritableSignal<string[]>;

  beforeEach(() => {
    settingsValid = signal(true);
    baselineValid = signal(true);
    invalidBaselineSteps = signal<string[]>([]);
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
          useValue: {
            isAssessmentSettingsValid: settingsValid,
            scenarioValidity: () => ({ isValid: baselineValid() }),
            isStepValid: (scenario: string, view: string) => scenario !== 'baseline' || !invalidBaselineSteps().includes(view),
            invalidStepLabels: () => invalidBaselineSteps(),
          },
        },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  it('explains nothing while the settings and baseline are valid', () => {
    expect(service.blockedReason()).toBeUndefined();
  });

  it('names the invalid settings step in the blocked reason', () => {
    settingsValid.set(false);
    expect(service.blockedReason()).toBe('Fix invalid inputs in: Assessment Settings');
  });

  it('names the invalid baseline steps in the blocked reason', () => {
    invalidBaselineSteps.set(['Wall', 'Cooling']);
    expect(service.blockedReason()).toBe('Fix invalid inputs in: Wall, Cooling');
  });

  it('lists the settings step before the invalid baseline steps', () => {
    settingsValid.set(false);
    invalidBaselineSteps.set(['Wall']);
    expect(service.blockedReason()).toBe('Fix invalid inputs in: Assessment Settings, Wall');
  });

  it('returns the explore notes key only for the modification it was set on', () => {
    service.activeModificationIdSignal.set('mod1');
    service.setExploreNotesKey('wallNotes');
    expect(service.exploreNotesKey()).toBe('wallNotes');

    service.activeModificationIdSignal.set('mod2');
    expect(service.exploreNotesKey()).toBeUndefined();

    service.activeModificationIdSignal.set('mod1');
    expect(service.exploreNotesKey()).toBe('wallNotes');
  });

  it('exposes the validity of the settings and the baseline heat balance', () => {
    expect(service.isAssessmentSettingsValidSignal()).toBeTrue();
    expect(service.isHeatBalanceValidSignal()).toBeTrue();

    settingsValid.set(false);
    baselineValid.set(false);

    expect(service.isAssessmentSettingsValidSignal()).toBeFalse();
    expect(service.isHeatBalanceValidSignal()).toBeFalse();
  });

  it('allows Assessment, Diagram, Report and Sankey when settings and baseline are valid', () => {
    expect(service.canVisitView(MainView.ASSESSMENT)).toBeTrue();
    expect(service.canVisitView(MainView.REPORT)).toBeTrue();
    expect(service.canVisitView(MainView.DIAGRAM)).toBeTrue();
    expect(service.canVisitView(MainView.SANKEY)).toBeTrue();
  });

  for (const [name, invalidate] of [
    ['the settings are', () => settingsValid.set(false)],
    ['the baseline heat balance is', () => baselineValid.set(false)],
  ] as const) {
    it(`blocks Assessment, Diagram, Report and Sankey views while ${name} invalid`, () => {
      invalidate();

      expect(service.canVisitView(MainView.ASSESSMENT)).toBeFalse();
      expect(service.canVisitView(MainView.REPORT)).toBeFalse();
      expect(service.canVisitView(MainView.DIAGRAM)).toBeFalse();
      expect(service.canVisitView(MainView.SANKEY)).toBeFalse();
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

  it('marks no tab invalid when settings and baseline are valid', () => {
    expect(service.isViewInvalid(BaselineView.ASSESSMENT_SETTINGS)).toBeFalse();
    expect(service.isViewInvalid(BaselineView.HEAT_BALANCE)).toBeFalse();
    expect(service.isViewInvalid(LossView.WALL_LOSSES)).toBeFalse();
  });

  it('marks the Assessment Settings tab invalid when the settings are', () => {
    settingsValid.set(false);

    expect(service.isViewInvalid(BaselineView.ASSESSMENT_SETTINGS)).toBeTrue();
    expect(service.isViewInvalid(BaselineView.HEAT_BALANCE)).toBeFalse();
  });

  it('marks the Heat Balance tab and only the failing loss tab invalid when a baseline step is', () => {
    baselineValid.set(false);
    invalidBaselineSteps.set([LossView.WALL_LOSSES]);

    expect(service.isViewInvalid(BaselineView.HEAT_BALANCE)).toBeTrue();
    expect(service.isViewInvalid(LossView.WALL_LOSSES)).toBeTrue();
    expect(service.isViewInvalid(LossView.FIXTURE)).toBeFalse();
    expect(service.isViewInvalid(BaselineView.ASSESSMENT_SETTINGS)).toBeFalse();
  });

  it('continues from the end of Baseline to Assessment when valid', () => {
    expect(service.canContinue()).toBeTrue();

    service.continue();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/process-heating/7/assessment');
  });
});

describe('ProcessHeatingUiService loss counts', () => {
  let service: ProcessHeatingUiService;
  let baseline: WritableSignal<PHAST>;
  let modification: WritableSignal<PHAST>;
  const scenarioPhast = (scenario: string): PHAST => scenario === 'baseline' ? baseline() : modification();

  beforeEach(() => {
    baseline = signal<PHAST>({ losses: { wallLosses: [{}, {}] as WallLoss[] }, systemEfficiency: 80 });
    modification = signal<PHAST>({ losses: { wallLosses: [{}, {}, {}] as WallLoss[] } });
    const router = {
      events: new Subject(),
      routerState: { snapshot: { root: { params: {}, data: {}, firstChild: null } } },
    };
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingUiService,
        { provide: Router, useValue: router },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            heatingEquipmentConfiguration: signal(HeatingEquipmentConfiguration.FUEL_FIRED),
            scenarioPhastSignal: scenarioPhast,
            lossSignal: (scenario: string, lossKey: keyof Losses) => scenarioPhast(scenario).losses?.[lossKey],
          },
        },
        { provide: STEPPED_ROUTES, useValue: [] },
        { provide: ProcessHeatingValidityService, useValue: VALID_BASELINE },
      ],
    });
    service = TestBed.inject(ProcessHeatingUiService);
  });

  it('counts the baseline entries a loss step holds', () => {
    expect(service.lossCount(LossView.WALL_LOSSES)).toBe(2);
    expect(service.lossCount(LossView.FIXTURE)).toBe(0);
  });

  it('counts a set system efficiency as one entry', () => {
    expect(service.lossCount(LossView.HEAT_SYSTEM_EFFICIENCY)).toBe(1);

    baseline.set({ losses: {} });

    expect(service.lossCount(LossView.HEAT_SYSTEM_EFFICIENCY)).toBe(0);
  });

  it('has no count for Operations, which holds no entries', () => {
    expect(service.lossCount(LossView.OPERATIONS)).toBeUndefined();
  });

  it('counts the entries of the given modification', () => {
    expect(service.lossCount(LossView.WALL_LOSSES, 'mod-1')).toBe(3);
    expect(service.lossCount(LossView.HEAT_SYSTEM_EFFICIENCY, 'mod-1')).toBe(0);
  });
});

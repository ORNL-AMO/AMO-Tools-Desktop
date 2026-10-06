import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { HeatingEquipmentConfiguration, LossView } from '../models/views';
import { STEPPED_ROUTES } from '../routing/stepped-routes';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingUiService } from './process-heating-ui.service';

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

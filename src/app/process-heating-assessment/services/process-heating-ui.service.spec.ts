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

  it('shows Flue Gas and Gas Leakage in heat balance, and Gas Leakage in Expert View, for fuel-fired', () => {
    const heatBalance = service.visibleHeatBalanceTabs().map(link => link.view);
    const expertView = service.visibleExpertViewTabs().map(link => link.view);

    for (const view of fuelFiredViews) {
      expect(heatBalance).toContain(view);
    }
    expect(expertView).toContain(LossView.GAS_LEAKAGE);
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

import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { ROUTE_TOKENS } from '../../constants/process-heating-routes';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { HelpPanelComponent } from './help-panel.component';

const LOSS_HELP_SELECTORS: Record<string, string> = {
  [ROUTE_TOKENS.operations]: 'app-operations-help',
  [ROUTE_TOKENS.chargeMaterial]: 'app-charge-material-help',
  [ROUTE_TOKENS.wallLosses]: 'app-wall-losses-help',
  [ROUTE_TOKENS.extendedSurface]: 'app-extended-surface-losses-help',
  [ROUTE_TOKENS.atmosphere]: 'app-atmosphere-losses-help',
  [ROUTE_TOKENS.fixture]: 'app-fixture-losses-help',
  [ROUTE_TOKENS.cooling]: 'app-cooling-losses-help',
  [ROUTE_TOKENS.opening]: 'app-opening-losses-help',
  [ROUTE_TOKENS.other]: 'app-other-losses-help',
  [ROUTE_TOKENS.flueGas]: 'app-flue-gas-losses-help',
  [ROUTE_TOKENS.gasLeakage]: 'app-gas-leakage-losses-help',
  [ROUTE_TOKENS.auxiliaryPower]: 'app-auxiliary-power-losses-help',
  [ROUTE_TOKENS.energyInputExhaustGas]: 'app-energy-input-exhaust-gas-losses-help',
  [ROUTE_TOKENS.energyInput]: 'app-energy-input-help',
  [ROUTE_TOKENS.exhaustGas]: 'app-exhaust-gas-help',
  [ROUTE_TOKENS.slag]: 'app-slag-help',
  [ROUTE_TOKENS.heatSystemEfficiency]: 'app-heat-system-efficiency-help',
};

describe('HelpPanelComponent', () => {
  let fixture: ComponentFixture<HelpPanelComponent>;
  let childView: WritableSignal<string>;
  let lossSubView: WritableSignal<string>;

  function render(view: string, subView = ''): HTMLElement {
    childView.set(view);
    lossSubView.set(subView);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => {
    childView = signal('');
    lossSubView = signal('');
    TestBed.configureTestingModule({
      declarations: [HelpPanelComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: { childView, lossSubView } },
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: signal<Partial<Settings>>({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HelpPanelComponent);
  });

  describe('heat balance loss routes', () => {
    Object.entries(LOSS_HELP_SELECTORS).forEach(([subView, selector]) => {
      it(`renders ${selector} for "${subView}" and nothing else`, () => {
        const element = render(ROUTE_TOKENS.heatBalance, subView);
        expect(element.querySelector(selector)).not.toBeNull();
        expect(element.querySelectorAll('.help-panel > *').length).toBe(1);
      });
    });

    it('shows the fallback for an unknown loss sub-view', () => {
      expect(render(ROUTE_TOKENS.heatBalance, 'unknown').querySelector('[data-testid="no-help"]')).not.toBeNull();
    });

    it('shows the fallback on the heat balance root with no sub-view', () => {
      expect(render(ROUTE_TOKENS.heatBalance).querySelector('[data-testid="no-help"]')).not.toBeNull();
    });
  });

  describe('other routes', () => {
    it('shows Explore Opportunities help', () => {
      expect(render(ROUTE_TOKENS.exploreOpportunities).textContent).toContain('Explore Opportunities Help');
    });

    [ROUTE_TOKENS.assessmentSettings, ROUTE_TOKENS.expertView, ''].forEach((view) => {
      it(`shows the fallback for "${view}"`, () => {
        expect(render(view).querySelector('[data-testid="no-help"]')).not.toBeNull();
      });
    });
  });

  describe('reactivity', () => {
    it('swaps content when the loss sub-view changes', () => {
      const element = render(ROUTE_TOKENS.heatBalance, ROUTE_TOKENS.slag);
      expect(element.querySelector('app-slag-help')).not.toBeNull();
      lossSubView.set(ROUTE_TOKENS.wallLosses);
      fixture.detectChanges();
      expect(element.querySelector('app-slag-help')).toBeNull();
      expect(element.querySelector('app-wall-losses-help')).not.toBeNull();
    });
  });
});

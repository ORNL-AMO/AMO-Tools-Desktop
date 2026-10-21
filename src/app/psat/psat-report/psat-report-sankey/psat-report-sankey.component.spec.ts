import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PsatReportSankeyComponent } from './psat-report-sankey.component';
import { PSAT, PsatValid, Modification } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';

const MOCK_SETTINGS: Settings = {} as Settings;

function makeValid(overrides: Partial<PsatValid> = {}): PsatValid {
  return { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true, ...overrides };
}

function makePsat(name: string, annualCost: number, validOverrides: Partial<PsatValid> = {}): PSAT {
  return {
    name,
    outputs: { annual_cost: annualCost },
    valid: makeValid(validOverrides),
  } as PSAT;
}

function makeModification(psat: PSAT, id = 'mod-1'): Modification {
  return { id, psat } as Modification;
}

function makeAssessment(psat: PSAT): Assessment {
  return { id: 1, name: 'Test Assessment', psat, type: 'PSAT' } as Assessment;
}

describe('PsatReportSankeyComponent', () => {
  let component: PsatReportSankeyComponent;
  let fixture: ComponentFixture<PsatReportSankeyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PsatReportSankeyComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PsatReportSankeyComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('builds a single scenario for the baseline when there are no modifications', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psatOptions).toEqual([{ name: 'Baseline', value: baseline }]);
      expect(component.sankeyScenarios).toEqual([{ scenario: baseline, costSavings: 0, isBaseline: true }]);
    });

    it('treats a missing modifications array as no modifications', () => {
      const baseline = makePsat('Baseline', 1000);
      baseline.modifications = undefined;
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psatOptions.length).toBe(1);
      expect(component.sankeyScenarios.length).toBe(1);
    });

    it('adds a scenario and option for each modification, in order', () => {
      const baseline = makePsat('Baseline', 1000);
      const modA = makePsat('Mod A', 800);
      const modB = makePsat('Mod B', 900);
      baseline.modifications = [makeModification(modA, 'mod-1'), makeModification(modB, 'mod-2')];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psatOptions).toEqual([
        { name: 'Baseline', value: baseline },
        { name: 'Mod A', value: modA },
        { name: 'Mod B', value: modB },
      ]);
      expect(component.sankeyScenarios.map(s => s.scenario)).toEqual([baseline, modA, modB]);
    });

    it('marks only the assessment baseline psat as the baseline scenario', () => {
      const baseline = makePsat('Baseline', 1000);
      const modPsat = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modPsat)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.sankeyScenarios[0].isBaseline).toBeTrue();
      expect(component.sankeyScenarios[1].isBaseline).toBeFalse();
    });

    it('computes cost savings for a valid modification relative to the baseline', () => {
      const baseline = makePsat('Baseline', 1000);
      const modPsat = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modPsat)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.sankeyScenarios[1].costSavings).toBe(200);
    });

    it('includes invalid modifications as their own scenario with undefined cost savings', () => {
      const baseline = makePsat('Baseline', 1000);
      const invalidMod = makePsat('Invalid Mod', 900, { isValid: false });
      baseline.modifications = [makeModification(invalidMod)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.sankeyScenarios.length).toBe(2);
      expect(component.sankeyScenarios[1].scenario).toBe(invalidMod);
      expect(component.sankeyScenarios[1].costSavings).toBeUndefined();
    });
  });

  describe('getCostSavings', () => {
    it('returns the annual cost difference from the baseline when the selected psat is valid', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();

      expect(component.getCostSavings(makePsat('Mod A', 850))).toBe(150);
    });

    it('returns undefined when the selected psat is invalid', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();

      expect(component.getCostSavings(makePsat('Invalid Mod', 850, { isValid: false }))).toBeUndefined();
    });

    it('returns undefined when the selected psat has no outputs', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();

      const noOutputsPsat = makePsat('No Outputs', 850);
      noOutputsPsat.outputs = undefined;
      expect(component.getCostSavings(noOutputsPsat)).toBeUndefined();
    });

    it('returns undefined when the assessment baseline has no outputs', () => {
      const baseline = makePsat('Baseline', 1000);
      baseline.outputs = undefined;
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.getCostSavings(makePsat('Mod A', 850))).toBeUndefined();
    });
  });

  describe('setPsat', () => {
    it('updates the scenario, baseline flag, and cost savings to the newly selected psat', () => {
      const baseline = makePsat('Baseline', 1000);
      const modA = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modA)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const scenario = component.sankeyScenarios[0];
      const modB = makePsat('Mod B', 600);
      component.setPsat(scenario, modB);

      expect(scenario.scenario).toBe(modB);
      expect(scenario.isBaseline).toBeFalse();
      expect(scenario.costSavings).toBe(400);
    });

    it('marks the scenario as the baseline when the baseline itself is selected', () => {
      const baseline = makePsat('Baseline', 1000);
      const modA = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modA)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const scenario = component.sankeyScenarios[1];
      component.setPsat(scenario, baseline);

      expect(scenario.isBaseline).toBeTrue();
      expect(scenario.costSavings).toBe(0);
    });

    it('sets cost savings to undefined when the newly selected psat is invalid', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const scenario = component.sankeyScenarios[0];
      component.setPsat(scenario, makePsat('Invalid Mod', 900, { isValid: false }));

      expect(scenario.costSavings).toBeUndefined();
    });
  });

  describe('template', () => {
    it('renders one scenario picker per sankey scenario', () => {
      const baseline = makePsat('Baseline', 1000);
      baseline.modifications = [makeModification(makePsat('Mod A', 800)), makeModification(makePsat('Mod B', 900))];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const pickers = fixture.nativeElement.querySelectorAll('app-sankey-scenario-picker');
      expect(pickers.length).toBe(3);
    });

    it('passes the shared psatOptions and per-scenario selection and cost savings to each picker', () => {
      const baseline = makePsat('Baseline', 1000);
      const modPsat = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modPsat)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const pickers = fixture.nativeElement.querySelectorAll('app-sankey-scenario-picker');
      expect(pickers[0].options).toBe(component.psatOptions);
      expect(pickers[0].selected).toBe(baseline);
      expect(pickers[0].costSavings).toBe(0);
      expect(pickers[1].selected).toBe(modPsat);
      expect(pickers[1].costSavings).toBe(200);
    });

    it('projects an app-psat-sankey per scenario with the scenario psat, settings, and baseline flag', () => {
      const baseline = makePsat('Baseline', 1000);
      const modPsat = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modPsat)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      const sankeys = fixture.nativeElement.querySelectorAll('app-psat-sankey');
      expect(sankeys.length).toBe(2);
      expect(sankeys[0].psat).toBe(baseline);
      expect(sankeys[0].settings).toBe(MOCK_SETTINGS);
      expect(sankeys[0].isBaseline).toBeTrue();
      expect(sankeys[1].psat).toBe(modPsat);
      expect(sankeys[1].isBaseline).toBeFalse();
    });
  });
});

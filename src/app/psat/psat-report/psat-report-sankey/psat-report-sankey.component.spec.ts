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

function makePsat(name: string, annualCost: number, validOverrides: Partial<PsatValid> = {}, modifications: Modification[] = []): PSAT {
  return {
    name,
    outputs: { annual_cost: annualCost },
    valid: makeValid(validOverrides),
    modifications,
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

    it('sets psat1 to the assessment baseline and marks it as the baseline selection', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psat1).toBe(baseline);
      expect(component.psat1Baseline).toBeTrue();
      expect(component.psat1CostSavings).toBe(0);
    });

    it('does not set psat2 when there are no modifications', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();

      expect(component.psat2).toBeUndefined();
    });

    it('sets psat2 to the first valid modification and computes its cost savings', () => {
      const baseline = makePsat('Baseline', 1000);
      const modPsat = makePsat('Mod A', 800);
      baseline.modifications = [makeModification(modPsat)];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psat2).toBe(modPsat);
      expect(component.psat2Baseline).toBeFalse();
      expect(component.psat2CostSavings).toBe(200);
    });

    it('skips invalid modifications when selecting the first valid one for psat2', () => {
      const baseline = makePsat('Baseline', 1000);
      const invalidMod = makePsat('Invalid Mod', 900, { isValid: false });
      const validMod = makePsat('Valid Mod', 700);
      baseline.modifications = [makeModification(invalidMod, 'mod-1'), makeModification(validMod, 'mod-2')];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      expect(component.psat2).toBe(validMod);
    });
  });

  describe('setPsat1', () => {
    it('marks psat1 as the baseline when its name matches the assessment baseline name', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      component.psat1 = makePsat('Baseline', 1000);
      component.setPsat1();

      expect(component.psat1Baseline).toBeTrue();
      expect(component.psat1CostSavings).toBe(0);
    });

    it('marks psat1 as not the baseline and computes cost savings when a different psat is selected', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      component.psat1 = makePsat('Mod A', 850);
      component.setPsat1();

      expect(component.psat1Baseline).toBeFalse();
      expect(component.psat1CostSavings).toBe(150);
    });
  });

  describe('setPsat2', () => {
    it('marks psat2 as not the baseline and computes cost savings when a modification is selected', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      component.psat2 = makePsat('Mod B', 600);
      component.setPsat2();

      expect(component.psat2Baseline).toBeFalse();
      expect(component.psat2CostSavings).toBe(400);
    });

    it('marks psat2 as the baseline when the baseline itself is selected', () => {
      const baseline = makePsat('Baseline', 1000);
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      component.psat2 = baseline;
      component.setPsat2();

      expect(component.psat2Baseline).toBeTrue();
      expect(component.psat2CostSavings).toBe(0);
    });
  });

  describe('template visibility', () => {
    it('shows the cost savings text for psat1 when it is valid', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Cost Savings');
    });

    it('hides the cost savings text for psat1 when it is invalid', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000, { isValid: false }));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Cost Savings');
    });

    it('hides the entire second sankey row when there is no psat2', () => {
      component.assessment = makeAssessment(makePsat('Baseline', 1000));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#psatSelect2')).toBeNull();
    });

    it('shows the second sankey row when psat2 is set', () => {
      const baseline = makePsat('Baseline', 1000);
      baseline.modifications = [makeModification(makePsat('Mod A', 800))];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#psatSelect2')).not.toBeNull();
    });

    it('shows the cost savings text for psat2 when it is valid', () => {
      const baseline = makePsat('Baseline', 1000);
      baseline.modifications = [makeModification(makePsat('Mod A', 800))];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();
      const secondRow = fixture.nativeElement.querySelector('#psatSelect2').closest('.d-flex');
      expect(secondRow.textContent).toContain('Cost Savings');
    });

    it('hides the cost savings text for psat2 when it is invalid', () => {
      const baseline = makePsat('Baseline', 1000);
      const invalidMod = makePsat('Invalid Mod', 900, { isValid: false });
      const validMod = makePsat('Valid Mod', 700);
      baseline.modifications = [makeModification(invalidMod, 'mod-1'), makeModification(validMod, 'mod-2')];
      component.assessment = makeAssessment(baseline);
      fixture.detectChanges();

      component.psat2 = invalidMod;
      fixture.detectChanges();

      const secondRow = fixture.nativeElement.querySelector('#psatSelect2').closest('.d-flex');
      expect(secondRow.textContent).not.toContain('Cost Savings');
    });
  });
});

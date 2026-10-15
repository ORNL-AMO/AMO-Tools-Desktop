import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { HeatSystemEfficiencyOpportunityComponent } from './heat-system-efficiency-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  systemEfficiency: 80,
  losses: {},
  modifications: [],
};

describe('HeatSystemEfficiencyOpportunityComponent', () => {
  let fixture: ComponentFixture<HeatSystemEfficiencyOpportunityComponent>;
  let component: HeatSystemEfficiencyOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveSystemEfficiency(): number | undefined {
    return assessmentService.scenarioPhast(modificationService.selectedModificationId())?.systemEfficiency;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeatSystemEfficiencyOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(BASELINE) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');

    fixture = TestBed.createComponent(HeatSystemEfficiencyOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the Improve Furnace Efficiency flag', () => {
    component.toggleOpportunity(true);

    expect(modificationService.selectedModification().exploreOpportunityFlags.efficiencyData)
      .toEqual({ hasOpportunity: true, display: 'Improve Furnace Efficiency' });
  });

  it('hides the editor until the opportunity is enabled', () => {
    expect(fixture.nativeElement.querySelector('#modificationSystemEfficiency')).toBeNull();

    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#modificationSystemEfficiency')).not.toBeNull();
  });

  it('shows the baseline efficiency beside the modification value', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.baseline-value-input').textContent).toContain('80');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#modificationSystemEfficiency');
    expect(input.value).toBe('80');
  });

  it('writes the modified system efficiency to the modification override', () => {
    component.toggleOpportunity(true);

    component.setModificationValue(92);

    expect(effectiveSystemEfficiency()).toBe(92);
    expect(modificationService.selectedModification().scenarioOverrides.systemEfficiency).toBe(92);
    expect(BASELINE.systemEfficiency).toBe(80);
  });

  it('resets the system efficiency to baseline when the opportunity is turned off', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(92);

    component.toggleOpportunity(false);

    expect(effectiveSystemEfficiency()).toBe(80);
  });

  for (const outOfRange of [0, -5, 100.5]) {
    it(`rejects ${outOfRange} with a warning and leaves the saved value unchanged`, () => {
      component.toggleOpportunity(true);
      component.setModificationValue(92);

      component.setModificationValue(outOfRange);
      fixture.detectChanges();

      expect(effectiveSystemEfficiency()).toBe(92);
      expect(fixture.nativeElement.textContent).toContain('System efficiency must be greater than 0 and no more than 100');
    });
  }

  it('accepts 100 and clears a previous warning', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(0);

    component.setModificationValue(100);
    fixture.detectChanges();

    expect(effectiveSystemEfficiency()).toBe(100);
    expect(fixture.nativeElement.textContent).not.toContain('System efficiency must be greater than 0');
  });

  it('ignores a NaN entry', () => {
    component.toggleOpportunity(true);

    component.setModificationValue(NaN);

    expect(effectiveSystemEfficiency()).toBe(80);
  });
});

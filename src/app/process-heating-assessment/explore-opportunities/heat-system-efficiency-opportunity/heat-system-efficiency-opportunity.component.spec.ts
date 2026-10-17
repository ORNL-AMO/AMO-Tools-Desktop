import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME, HeatSystemEfficiencyOpportunityComponent, OUT_OF_RANGE_WARNING } from './heat-system-efficiency-opportunity.component';

const BASELINE: PHAST = { name: 'Baseline', losses: {}, systemEfficiency: 80, modifications: [] };

describe('HeatSystemEfficiencyOpportunityComponent', () => {
  let fixture: ComponentFixture<HeatSystemEfficiencyOpportunityComponent>;
  let component: HeatSystemEfficiencyOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveEfficiency(): number | undefined {
    return assessmentService.scenarioPhast(modificationService.selectedModificationId()!)?.systemEfficiency;
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

  it('reads the baseline and modification efficiency', () => {
    expect(component.baselineValue()).toBe(80);
    expect(component.modificationValue()).toBe(80);
  });

  it('sets the Improve Furnace Efficiency flag when the opportunity is enabled', () => {
    component.toggleOpportunity(true);

    expect(modificationService.selectedModification()!.exploreOpportunityFlags.efficiencyData)
      .toEqual({ hasOpportunity: true, display: HEAT_SYSTEM_EFFICIENCY_DISPLAY_NAME });
    expect(component.useOpportunity()).toBeTrue();
  });

  it('shows the efficiency editor only while the opportunity is enabled', () => {
    expect(fixture.nativeElement.querySelector('#modificationSystemEfficiency')).toBeNull();

    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#modificationSystemEfficiency')).not.toBeNull();
  });

  it('writes the modified efficiency to the scenario overrides', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(90);

    expect(modificationService.selectedModification()!.scenarioOverrides?.systemEfficiency).toBe(90);
    expect(effectiveEfficiency()).toBe(90);
    expect(component.baselineValue()).toBe(80);
  });

  it('resets the efficiency to baseline when the opportunity is disabled', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(90);

    component.toggleOpportunity(false);

    expect(effectiveEfficiency()).toBe(80);
    expect(component.useOpportunity()).toBeFalse();
  });

  for (const outOfRange of [0, -5, 100.5, 150]) {
    it(`rejects ${outOfRange} with a warning and leaves the efficiency unchanged`, () => {
      component.toggleOpportunity(true);
      component.setModificationValue(90);

      component.setModificationValue(outOfRange);
      fixture.detectChanges();

      expect(effectiveEfficiency()).toBe(90);
      expect(component.warning()).toBe(OUT_OF_RANGE_WARNING);
      expect(fixture.nativeElement.textContent).toContain(OUT_OF_RANGE_WARNING);
    });
  }

  it('accepts the upper bound of 100 and clears the warning', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(150);

    component.setModificationValue(100);

    expect(effectiveEfficiency()).toBe(100);
    expect(component.warning()).toBeNull();
  });

  it('ignores a non-numeric entry', () => {
    component.toggleOpportunity(true);

    component.setModificationValue(NaN);

    expect(effectiveEfficiency()).toBe(80);
    expect(component.warning()).toBeNull();
  });

  it('clears the warning when the selected modification changes', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(101);
    expect(component.warning()).toBe(OUT_OF_RANGE_WARNING);

    modificationService.addModification('Scenario 2');

    expect(component.warning()).toBeNull();
  });

  it('renders the editor on creation when the modification already has the opportunity enabled', () => {
    component.toggleOpportunity(true);

    const created = TestBed.createComponent(HeatSystemEfficiencyOpportunityComponent);
    created.detectChanges();

    expect(created.nativeElement.querySelector('#modificationSystemEfficiency')).not.toBeNull();
  });

  it('clears the warning when the opportunity is disabled', () => {
    component.toggleOpportunity(true);
    component.setModificationValue(0);

    component.toggleOpportunity(false);

    expect(component.warning()).toBeNull();
  });
});

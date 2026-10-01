import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { GasLeakageOpportunityComponent } from './gas-leakage-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    leakageLosses: [
      { id: 'leak-1', name: 'Leakage 1', draftPressure: 0.1, openingArea: 2, leakageGasTemperature: 1500, ambientTemperature: 70, coefficient: 0.8052, specificGravity: 1, correctionFactor: 1 },
      { id: 'leak-2', name: 'Leakage 2', draftPressure: 0.2, openingArea: 3, leakageGasTemperature: 1400, ambientTemperature: 70, coefficient: 0.8052, specificGravity: 1, correctionFactor: 1 },
    ],
  },
  modifications: [],
};

describe('GasLeakageOpportunityComponent', () => {
  let fixture: ComponentFixture<GasLeakageOpportunityComponent>;
  let component: GasLeakageOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(id: string): LeakageLoss | undefined {
    return assessmentService
      .scenarioPhast(modificationService.selectedModificationId())
      ?.losses?.leakageLosses?.find(loss => loss.id === id);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GasLeakageOpportunityComponent],
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
    fixture = TestBed.createComponent(GasLeakageOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('hides the per-loss sections when the opportunity is not selected', () => {
    expect(component.useOpportunity()).toBe(false);
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('renders the pressure and opening area section checkboxes for each loss', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ul').length).toBe(2);
    const labels = fixture.nativeElement.querySelector('ul').textContent;
    expect(labels).toContain('Modify Furnace Draft Pressure');
    expect(labels).toContain('Modify Opening Area');
  });

  it('writes a modified draft pressure only on the targeted loss', () => {
    component.toggleOpportunity(true);
    component.toggleSection('draftPressure', 'leak-1', true);

    component.setModificationValue('leak-1', 'draftPressure', 0.05);

    expect(effectiveLoss('leak-1').draftPressure).toBe(0.05);
    expect(effectiveLoss('leak-2').draftPressure).toBe(0.2);
  });

  it('restores the baseline opening area when its section is closed', () => {
    component.toggleOpportunity(true);
    component.toggleSection('openingArea', 'leak-1', true);
    component.setModificationValue('leak-1', 'openingArea', 9);

    component.toggleSection('openingArea', 'leak-1', false);

    expect(effectiveLoss('leak-1').openingArea).toBe(2);
  });

  it('warns on a negative modification opening area', () => {
    component.toggleOpportunity(true);
    component.toggleSection('openingArea', 'leak-1', true);
    component.setModificationValue('leak-1', 'openingArea', -1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Opening Area must be equal or greater than 0');
  });

  it('shows no warnings for valid values', () => {
    component.toggleOpportunity(true);
    component.toggleSection('openingArea', 'leak-1', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
  });
});

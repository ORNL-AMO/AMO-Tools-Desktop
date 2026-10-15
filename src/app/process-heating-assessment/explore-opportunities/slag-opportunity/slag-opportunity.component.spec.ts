import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { SlagOpportunityComponent } from './slag-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    slagLosses: [
      { id: 'slag-1', name: 'Slag 1', weight: 100, inletTemperature: 70, outletTemperature: 1500, specificHeat: 0.2, correctionFactor: 1, heatLoss: 0 },
      { id: 'slag-2', name: 'Slag 2', weight: 250, inletTemperature: 70, outletTemperature: 1500, specificHeat: 0.2, correctionFactor: 1, heatLoss: 0 },
    ],
  },
  modifications: [],
};

describe('SlagOpportunityComponent', () => {
  let fixture: ComponentFixture<SlagOpportunityComponent>;
  let component: SlagOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveSlag(index: number): Slag {
    return assessmentService.lossSignal(modificationService.selectedModificationId(), 'slagLosses')[index] as Slag;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlagOpportunityComponent],
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

    fixture = TestBed.createComponent(SlagOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the Reduce Slag flag', () => {
    component.toggleOpportunity(true);

    expect(modificationService.selectedModification().exploreOpportunityFlags.slag).toEqual({ hasOpportunity: true, display: 'Reduce Slag' });
  });

  it('hides the editor until the opportunity is enabled', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Modify Slag Weight');

    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Modify Slag Weight');
  });

  it('renders a Modify Slag Weight checkbox per slag entry', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('input[id^="modifySlagWeight_"]').length).toBe(2);
  });

  it('writes the modified weight to the targeted slag entry only', () => {
    component.toggleOpportunity(true);
    component.toggleSection('slag-2', true);

    component.setModificationValue('slag-2', 125);

    expect(effectiveSlag(0).weight).toBe(100);
    expect(effectiveSlag(1).weight).toBe(125);
  });

  it('resets the weight when the section is closed', () => {
    component.toggleOpportunity(true);
    component.toggleSection('slag-1', true);
    component.setModificationValue('slag-1', 40);

    component.toggleSection('slag-1', false);

    expect(effectiveSlag(0).weight).toBe(100);
  });

  it('resets every slag weight to baseline when the opportunity is turned off', () => {
    component.toggleOpportunity(true);
    component.toggleSection('slag-1', true);
    component.toggleSection('slag-2', true);
    component.setModificationValue('slag-1', 40);
    component.setModificationValue('slag-2', 90);

    component.toggleOpportunity(false);

    expect(effectiveSlag(0).weight).toBe(100);
    expect(effectiveSlag(1).weight).toBe(250);
  });
});

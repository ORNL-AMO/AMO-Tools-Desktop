import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { FixtureCoolingOpportunityComponent } from './fixture-cooling-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    fixtureLosses: [
      { id: 'fix-1', name: 'Fixture 1', materialName: 1, specificHeat: 0.12, feedRate: 500, initialTemperature: 70, finalTemperature: 1000 },
    ],
  },
  modifications: [],
};

describe('FixtureCoolingOpportunityComponent', () => {
  let fixture: ComponentFixture<FixtureCoolingOpportunityComponent>;
  let component: FixtureCoolingOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(): FixtureLoss {
    return assessmentService.lossSignal(modificationService.selectedModificationId(), 'fixtureLosses')[0] as FixtureLoss;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureCoolingOpportunityComponent],
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

    fixture = TestBed.createComponent(FixtureCoolingOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the Avoid Fixture Cooling flag, separate from materials handling', () => {
    component.toggleOpportunity(true);

    const flags = modificationService.selectedModification().exploreOpportunityFlags;
    expect(flags.allTemp).toEqual({ hasOpportunity: true, display: 'Avoid Fixture Cooling' });
    expect(flags.fixtures).toBeUndefined();
  });

  it('renders a Modify Initial Temperature checkbox per fixture', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Modify Initial Temperature');
  });

  it('resets the initial temperature when the section is closed', () => {
    component.toggleOpportunity(true);
    component.toggleSection('fix-1', true);
    component.setModificationValue('fix-1', 400);

    component.toggleSection('fix-1', false);

    expect(effectiveLoss().initialTemperature).toBe(70);
  });
});

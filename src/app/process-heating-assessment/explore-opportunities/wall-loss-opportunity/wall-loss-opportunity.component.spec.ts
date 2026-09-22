import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { WallLossOpportunityComponent } from './wall-loss-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    wallLosses: [
      { id: 'wall-1', name: 'Wall 1', surfaceTemperature: 400, ambientTemperature: 70 },
    ],
  },
  modifications: [],
};

describe('WallLossOpportunityComponent', () => {
  let fixture: ComponentFixture<WallLossOpportunityComponent>;
  let component: WallLossOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WallLossOpportunityComponent],
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

    fixture = TestBed.createComponent(WallLossOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resets the wall surface temperature back to baseline when the opportunity is deselected', () => {
    component.toggleOpportunity(true);
    component.setModificationValue('wall-1', 200);
    expect(component.comparisons()[0].modification.surfaceTemperature).toBe(200);

    component.toggleOpportunity(false);

    expect(component.useOpportunity()).toBe(false);
    expect(component.comparisons()[0].modification.surfaceTemperature).toBe(400);
  });

  it('leaves other overridden fields on the wall loss untouched when resetting its temperature', () => {
    component.toggleOpportunity(true);
    component.setModificationValue('wall-1', 200);

    const modificationId = modificationService.selectedModificationId();
    const modification = modificationService.selectedModification();
    assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      wallLosses: modification.scenarioOverrides?.losses?.wallLosses?.map(loss =>
        loss.id === 'wall-1' ? { ...loss, windVelocity: 10 } : loss
      ),
    });

    component.toggleOpportunity(false);

    const effectiveLoss = assessmentService
      .scenarioPhast(modificationId)
      ?.losses?.wallLosses?.find(loss => loss.id === 'wall-1');
    expect(effectiveLoss.surfaceTemperature).toBe(400);
    expect(effectiveLoss.windVelocity).toBe(10);
  });

  it('hides the temperature editor when the opportunity is not selected', () => {
    expect(component.useOpportunity()).toBe(false);

    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('renders the temperature editor when the opportunity is selected', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ul')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.explore-opps-item').length).toBe(1);
  });

  it('renders a Modify Average Surface Temperature checkbox, collapsed until checked', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Modify Average Surface Temperature');
    expect(component.isExpanded('wall-1')).toBe(false);
  });

  it('resets the surface temperature when the wall section is closed', () => {
    component.toggleOpportunity(true);
    component.toggleSection('wall-1', true);
    component.setModificationValue('wall-1', 200);

    component.toggleSection('wall-1', false);

    expect(component.comparisons()[0].modification.surfaceTemperature).toBe(400);
  });

  it('warns when the modification surface temperature is below ambient', () => {
    component.toggleOpportunity(true);
    component.toggleSection('wall-1', true);
    component.setModificationValue('wall-1', 60);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Surface temperature is lower than ambient temperature');
    expect(component.comparisons()[0].baselineWarning).toBeNull();
  });
});

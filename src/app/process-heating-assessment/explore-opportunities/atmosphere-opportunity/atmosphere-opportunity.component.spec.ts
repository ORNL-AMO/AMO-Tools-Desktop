import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { AtmosphereOpportunityComponent } from './atmosphere-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    atmosphereLosses: [
      { id: 'atm-1', name: 'Atmosphere 1', flowRate: 1000, inletTemperature: 100, outletTemperature: 1200, specificHeat: 0.02 },
      { id: 'atm-2', name: 'Atmosphere 2', flowRate: 500, inletTemperature: 80, outletTemperature: 900, specificHeat: 0.02 },
    ],
  },
  modifications: [],
};

describe('AtmosphereOpportunityComponent', () => {
  let fixture: ComponentFixture<AtmosphereOpportunityComponent>;
  let component: AtmosphereOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(id: string): AtmosphereLoss | undefined {
    return assessmentService
      .scenarioPhast(modificationService.selectedModificationId())
      ?.losses?.atmosphereLosses?.find(loss => loss.id === id);
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(AtmosphereOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AtmosphereOpportunityComponent],
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
  });

  describe('opportunity toggle', () => {
    beforeEach(() => createComponent());

    it('hides the per-loss sections when the opportunity is not selected', () => {
      expect(component.useOpportunity()).toBe(false);
      expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    });

    it('renders a section group per baseline loss when the opportunity is selected', () => {
      component.toggleOpportunity(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('ul').length).toBe(2);
    });

    it('renders the flow rate and inlet/outlet temperature section checkboxes for each loss', () => {
      component.toggleOpportunity(true);
      fixture.detectChanges();

      const labels = fixture.nativeElement.querySelector('ul').textContent;
      expect(labels).toContain('Modify Flow Rate');
      expect(labels).toContain('Modify Inlet / Outlet Temperature');
    });

    it('resets both temperatures when the temperature section is closed', () => {
      component.toggleOpportunity(true);
      component.toggleSection('temperature', 'atm-1', true);
      component.setModificationValue('atm-1', 'inletTemperature', 300);
      component.setModificationValue('atm-1', 'outletTemperature', 1100);

      component.toggleSection('temperature', 'atm-1', false);

      expect(effectiveLoss('atm-1')).toEqual(jasmine.objectContaining({ inletTemperature: 100, outletTemperature: 1200 }));
    });
  });

  describe('warnings', () => {
    beforeEach(() => {
      createComponent();
      component.toggleOpportunity(true);
      component.toggleSection('flowRate', 'atm-1', true);
      component.toggleSection('temperature', 'atm-1', true);
    });

    it('warns on a negative modification flow rate', () => {
      component.setModificationValue('atm-1', 'flowRate', -5);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Flow Rate must be greater than 0');
    });

    it('warns when the modification inlet temperature exceeds outlet', () => {
      component.setModificationValue('atm-1', 'inletTemperature', 1500);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Inlet temperature is greater than outlet temperature');
    });

    it('warns on the baseline side when the baseline inlet temperature exceeds outlet', () => {
      assessmentService.updateProcessHeatingProperty('losses', {
        atmosphereLosses: BASELINE.losses.atmosphereLosses.map(loss =>
          loss.id === 'atm-1' ? { ...loss, inletTemperature: 1500 } : loss
        ),
      });
      fixture.detectChanges();

      expect(component.comparisons()[0].baselineWarnings.temperatureWarning).toBe('Inlet temperature is greater than outlet temperature');
      expect(component.comparisons()[0].modificationWarnings.temperatureWarning).toBeNull();
    });

    it('shows no warnings for valid values', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });
});

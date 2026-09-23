import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { CoolingOpportunityComponent } from './cooling-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    coolingLosses: [
      {
        id: 'cool-gas', name: 'Cooling 1', coolingLossType: 'Gas',
        gasCoolingLoss: { flowRate: 1000, initialTemperature: 80, finalTemperature: 200, outletTemperature: 200, specificHeat: 0.02, gasDensity: 0.075 },
      },
      {
        id: 'cool-liquid', name: 'Cooling 2', coolingLossType: 'Liquid',
        liquidCoolingLoss: { flowRate: 50, initialTemperature: 60, outletTemperature: 120, specificHeat: 1, density: 8.3 },
      },
    ],
  },
  modifications: [],
};

describe('CoolingOpportunityComponent', () => {
  let fixture: ComponentFixture<CoolingOpportunityComponent>;
  let component: CoolingOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function effectiveLoss(id: string): CoolingLoss | undefined {
    return assessmentService
      .scenarioPhast(modificationService.selectedModificationId())
      ?.losses?.coolingLosses?.find(loss => loss.id === id);
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(CoolingOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoolingOpportunityComponent],
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

    it('renders the flow rate and temperature section checkboxes for each loss', () => {
      component.toggleOpportunity(true);
      fixture.detectChanges();

      const labels = fixture.nativeElement.querySelector('ul').textContent;
      expect(labels).toContain('Modify Flow Rate');
      expect(labels).toContain('Modify Temperature');
    });

    it('resets both temperatures when the temperature section is closed', () => {
      component.toggleOpportunity(true);
      component.toggleSection('temperature', 'cool-gas', true);
      component.setModificationValue('cool-gas', 'initialTemperature', 300);
      component.setModificationValue('cool-gas', 'outletTemperature', 900);

      component.toggleSection('temperature', 'cool-gas', false);

      expect(effectiveLoss('cool-gas').gasCoolingLoss).toEqual(jasmine.objectContaining({ initialTemperature: 80, finalTemperature: 200, outletTemperature: 200 }));
    });
  });

  describe('gas vs liquid field dispatch', () => {
    beforeEach(() => {
      createComponent();
      component.toggleOpportunity(true);
      component.toggleSection('flowRate', 'cool-gas', true);
      component.toggleSection('flowRate', 'cool-liquid', true);
      component.toggleSection('temperature', 'cool-gas', true);
    });

    it('writes gas flow rate under gasCoolingLoss', () => {
      component.setModificationValue('cool-gas', 'flowRate', 1500);

      expect(effectiveLoss('cool-gas').gasCoolingLoss.flowRate).toBe(1500);
    });

    it('writes liquid flow rate under liquidCoolingLoss', () => {
      component.setModificationValue('cool-liquid', 'flowRate', 75);

      expect(effectiveLoss('cool-liquid').liquidCoolingLoss.flowRate).toBe(75);
    });

    it('mirrors a gas outlet temperature into both finalTemperature and outletTemperature', () => {
      component.setModificationValue('cool-gas', 'outletTemperature', 250);

      expect(effectiveLoss('cool-gas').gasCoolingLoss).toEqual(jasmine.objectContaining({ finalTemperature: 250, outletTemperature: 250 }));
    });

    it('reads distinct flow rate units per medium', () => {
      const comparisons = component.comparisons();
      expect(comparisons.find(c => c.id === 'cool-gas').baselineIsGas).toBe(true);
      expect(comparisons.find(c => c.id === 'cool-liquid').baselineIsGas).toBe(false);
    });
  });

  describe('warnings', () => {
    beforeEach(() => {
      createComponent();
      component.toggleOpportunity(true);
      component.toggleSection('flowRate', 'cool-gas', true);
      component.toggleSection('temperature', 'cool-gas', true);
    });

    it('warns on a negative modification flow rate', () => {
      component.setModificationValue('cool-gas', 'flowRate', -5);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Gas Flow must be equal or greater than 0');
    });

    it('warns when the modification inlet temperature exceeds outlet', () => {
      component.setModificationValue('cool-gas', 'initialTemperature', 1500);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Inlet temperature is greater than outlet temperature');
    });

    it('shows no warnings for valid values', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { ChargeMaterialOpportunityComponent } from './charge-material-opportunity.component';

const BASELINE: PHAST = {
  name: 'Baseline',
  losses: {
    chargeMaterials: [
      {
        id: 'material-1',
        name: 'Steel',
        chargeMaterialType: 'Solid',
        solidChargeMaterial: { initialTemperature: 70, dischargeTemperature: 2000, specificHeatSolid: 0.12 },
      } as never,
      {
        id: 'material-2',
        name: 'Water',
        chargeMaterialType: 'Liquid',
        liquidChargeMaterial: { initialTemperature: 60, dischargeTemperature: 200 },
      } as never,
    ],
  },
  modifications: [],
};

describe('ChargeMaterialOpportunityComponent', () => {
  let fixture: ComponentFixture<ChargeMaterialOpportunityComponent>;
  let component: ChargeMaterialOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargeMaterialOpportunityComponent],
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

    fixture = TestBed.createComponent(ChargeMaterialOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resets the material initial temperature back to baseline when the opportunity is deselected', () => {
    component.toggleOpportunity(true);
    component.setModificationValue('material-1', 200);
    expect(component.comparisons()[0].modification.initialTemperature).toBe(200);

    component.toggleOpportunity(false);

    expect(component.useOpportunity()).toBe(false);
    expect(component.comparisons()[0].modification.initialTemperature).toBe(70);
  });

  it('leaves other overridden fields on the material untouched when resetting its temperature', () => {
    component.toggleOpportunity(true);
    component.setModificationValue('material-1', 200);

    const modificationId = modificationService.selectedModificationId();
    const modification = modificationService.selectedModification();
    assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      chargeMaterials: modification.scenarioOverrides?.losses?.chargeMaterials?.map(material =>
        material.id === 'material-1'
          ? { ...material, solidChargeMaterial: { ...(material as { solidChargeMaterial: { specificHeatSolid: number } }).solidChargeMaterial, specificHeatSolid: 0.5 } }
          : material
      ),
    });

    component.toggleOpportunity(false);

    const effectiveMaterial = assessmentService
      .scenarioPhast(modificationId)
      ?.losses?.chargeMaterials?.find(material => material.id === 'material-1') as unknown as {
        solidChargeMaterial: { initialTemperature: number; specificHeatSolid: number };
      };
    expect(effectiveMaterial.solidChargeMaterial.initialTemperature).toBe(70);
    expect(effectiveMaterial.solidChargeMaterial.specificHeatSolid).toBe(0.5);
  });

  it('renders a Modify Initial Temperature checkbox per material, collapsed until checked', () => {
    component.toggleOpportunity(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Modify Initial Temperature');
    expect(component.isExpanded('material-1')).toBe(false);
    expect(fixture.nativeElement.querySelector('.explore-opps-header')).toBeNull();

    component.toggleSection('material-1', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.explore-opps-header')).not.toBeNull();
  });

  it('resets the initial temperature when the material section is closed', () => {
    component.toggleOpportunity(true);
    component.toggleSection('material-1', true);
    component.setModificationValue('material-1', 200);

    component.toggleSection('material-1', false);

    expect(component.comparisons()[0].modification.initialTemperature).toBe(70);
  });

  it('reads and writes the initial temperature of the material type in use', () => {
    component.setModificationValue('material-2', 90);

    const comparison = component.comparisons()[1];
    expect(comparison.baseline.initialTemperature).toBe(60);
    expect(comparison.modification.initialTemperature).toBe(90);
    expect(comparison.modificationItem.liquidChargeMaterial.initialTemperature).toBe(90);
  });

  it('warns when the modification inlet temperature exceeds the outlet temperature', () => {
    component.toggleOpportunity(true);
    component.toggleSection('material-2', true);
    component.setModificationValue('material-2', 250);
    fixture.detectChanges();

    expect(component.comparisons()[1].modificationWarning)
      .toBe('Charge Inlet Temperature (250) cannot be greater than Charge Outlet Temperature (200)');
    expect(fixture.nativeElement.textContent).toContain('cannot be greater than Charge Outlet Temperature');
    expect(component.comparisons()[1].baselineWarning).toBeNull();
  });
});

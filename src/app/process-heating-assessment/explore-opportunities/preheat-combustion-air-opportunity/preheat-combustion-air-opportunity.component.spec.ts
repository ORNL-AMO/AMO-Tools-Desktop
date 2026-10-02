import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGas } from '../../../shared/models/phast/losses/flueGas';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { PreheatCombustionAirOpportunityComponent } from './preheat-combustion-air-opportunity.component';

const VOLUME_ENTRY: FlueGas = {
  id: 'flue-1',
  name: 'Flue Gas',
  flueGasType: 'By Volume',
  flueGasByVolume: { flueGasTemperature: 600, combustionAirTemperature: 80, excessAirPercentage: 9, o2InFlueGas: 2, moistureInAirCombustion: 0.0077 },
};

const MASS_ENTRY: FlueGas = {
  id: 'flue-1',
  name: 'Flue Gas',
  flueGasType: 'By Mass',
  flueGasByMass: { flueGasTemperature: 600, combustionAirTemperature: 80, excessAirPercentage: 9, o2InFlueGas: 2, moistureInAirCombustion: 0.0077 },
};

function baselineWith(...entries: FlueGas[]): PHAST {
  return { name: 'Baseline', losses: { flueGasLosses: entries }, modifications: [] };
}

describe('PreheatCombustionAirOpportunityComponent', () => {
  let fixture: ComponentFixture<PreheatCombustionAirOpportunityComponent>;
  let component: PreheatCombustionAirOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function setup(baseline: PHAST): void {
    TestBed.configureTestingModule({
      declarations: [PreheatCombustionAirOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(baseline) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');
    fixture = TestBed.createComponent(PreheatCombustionAirOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function effectiveEntry(): FlueGas | undefined {
    return assessmentService.scenarioPhast(modificationService.selectedModificationId())?.losses?.flueGasLosses?.[0];
  }

  it('hides the section when the opportunity is not selected', () => {
    setup(baselineWith(VOLUME_ENTRY));

    expect(component.useOpportunity()).toBe(false);
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('writes the modified temperature to the By Volume inputs', () => {
    setup(baselineWith(VOLUME_ENTRY));
    component.toggleOpportunity(true);
    component.toggleSection('combustionAirTemperature', 'flue-1', true);

    component.setModificationValue('flue-1', 'combustionAirTemperature', 500);

    expect(effectiveEntry().flueGasByVolume.combustionAirTemperature).toBe(500);
  });

  it('writes the modified temperature to the By Mass inputs', () => {
    setup(baselineWith(MASS_ENTRY));
    component.toggleOpportunity(true);
    component.toggleSection('combustionAirTemperature', 'flue-1', true);

    component.setModificationValue('flue-1', 'combustionAirTemperature', 500);

    expect(effectiveEntry().flueGasByMass.combustionAirTemperature).toBe(500);
  });

  it('restores the baseline temperature when the section is closed', () => {
    setup(baselineWith(VOLUME_ENTRY));
    component.toggleOpportunity(true);
    component.toggleSection('combustionAirTemperature', 'flue-1', true);
    component.setModificationValue('flue-1', 'combustionAirTemperature', 500);

    component.toggleSection('combustionAirTemperature', 'flue-1', false);

    expect(effectiveEntry().flueGasByVolume.combustionAirTemperature).toBe(80);
  });

  it('only compares the first flue gas entry', () => {
    setup(baselineWith(VOLUME_ENTRY, { ...VOLUME_ENTRY, id: 'flue-2' }));

    expect(component.comparisons().map(comparison => comparison.id)).toEqual(['flue-1']);
  });

  it('warns when the modified combustion air is hotter than the flue gas', () => {
    setup(baselineWith(VOLUME_ENTRY));
    component.toggleOpportunity(true);
    component.toggleSection('combustionAirTemperature', 'flue-1', true);
    component.setModificationValue('flue-1', 'combustionAirTemperature', 700);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Combustion air temperature must be less than flue gas temperature');
  });
});

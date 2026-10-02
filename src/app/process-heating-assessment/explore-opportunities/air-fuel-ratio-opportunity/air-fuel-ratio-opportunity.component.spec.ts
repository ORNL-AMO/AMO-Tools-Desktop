import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGas } from '../../../shared/models/phast/losses/flueGas';
import { FlueGasCalculationService } from '../../heat-balance/losses/flue-gas/flue-gas-calculation.service';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FakeProcessHeatingAssessmentService, FakeProcessHeatingUiService } from '../opportunity-test-fakes';
import { AirFuelRatioOpportunityComponent } from './air-fuel-ratio-opportunity.component';

const VOLUME_EXCESS_AIR: FlueGas = {
  id: 'flue-1',
  name: 'Flue Gas',
  flueGasType: 'By Volume',
  flueGasByVolume: { flueGasTemperature: 600, combustionAirTemperature: 80, oxygenCalculationMethod: 'Excess Air', excessAirPercentage: 9, o2InFlueGas: 0, moistureInAirCombustion: 0.0077 },
};

const MASS_OXYGEN: FlueGas = {
  id: 'flue-1',
  name: 'Flue Gas',
  flueGasType: 'By Mass',
  flueGasByMass: { flueGasTemperature: 600, combustionAirTemperature: 80, oxygenCalculationMethod: 'Oxygen in Flue Gas', excessAirPercentage: 0, o2InFlueGas: 2, moistureInAirCombustion: 0.0077 },
};

const fakeCalculationService = {
  calculateByVolume: () => ({ calculatedFlueGasO2: 1.7, calculatedExcessAir: 9, availableHeat: 60 }),
  calculateByMass: () => ({ calculatedFlueGasO2: 2, calculatedExcessAir: 10.5, availableHeat: 60 }),
};

function baselineWith(...entries: FlueGas[]): PHAST {
  return { name: 'Baseline', losses: { flueGasLosses: entries }, modifications: [] };
}

describe('AirFuelRatioOpportunityComponent', () => {
  let fixture: ComponentFixture<AirFuelRatioOpportunityComponent>;
  let component: AirFuelRatioOpportunityComponent;
  let modificationService: ModificationService;
  let assessmentService: FakeProcessHeatingAssessmentService;

  function setup(baseline: PHAST): void {
    TestBed.configureTestingModule({
      declarations: [AirFuelRatioOpportunityComponent],
      providers: [
        ModificationService,
        { provide: ProcessHeatingAssessmentService, useValue: new FakeProcessHeatingAssessmentService(baseline) },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideComponent(AirFuelRatioOpportunityComponent, {
      set: { providers: [{ provide: FlueGasCalculationService, useValue: fakeCalculationService }] },
    });
    modificationService = TestBed.inject(ModificationService);
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
    modificationService.addModification('Scenario 1');
    fixture = TestBed.createComponent(AirFuelRatioOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function effectiveEntry(): FlueGas | undefined {
    return assessmentService.scenarioPhast(modificationService.selectedModificationId())?.losses?.flueGasLosses?.[0];
  }

  it('hides the section when the opportunity is not selected', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));

    expect(component.useOpportunity()).toBe(false);
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('writes the modified excess air and the calculated O2 to the By Volume inputs', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);

    component.setModificationValue('flue-1', 'excessAirPercentage', 5);

    expect(effectiveEntry().flueGasByVolume.excessAirPercentage).toBe(5);
    expect(effectiveEntry().flueGasByVolume.o2InFlueGas).toBe(1.7);
  });

  it('writes the calculated excess air alongside a modified By Mass oxygen level', () => {
    setup(baselineWith(MASS_OXYGEN));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);

    component.setModificationValue('flue-1', 'o2InFlueGas', 1.5);

    expect(effectiveEntry().flueGasByMass.o2InFlueGas).toBe(1.5);
    expect(effectiveEntry().flueGasByMass.excessAirPercentage).toBe(10.5);
  });

  it('zeroes both inputs when the modification oxygen calculation method changes', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);

    component.changeOxygenCalculationMethod('flue-1', 'Oxygen in Flue Gas');

    expect(effectiveEntry().flueGasByVolume).toEqual(jasmine.objectContaining({
      oxygenCalculationMethod: 'Oxygen in Flue Gas', o2InFlueGas: 0, excessAirPercentage: 0,
    }));
    expect(component.comparisons()[0].modificationMethod).toBe('Oxygen in Flue Gas');
  });

  it('restores the baseline method with the values when the section is closed', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);
    component.changeOxygenCalculationMethod('flue-1', 'Oxygen in Flue Gas');

    component.toggleSection('airFuelRatio', 'flue-1', false);

    expect(effectiveEntry().flueGasByVolume.oxygenCalculationMethod).toBe('Excess Air');
    expect(effectiveEntry().flueGasByVolume.excessAirPercentage).toBe(9);
  });

  it('deselects Preheat Combustion Air and resets its temperature when the opportunity is deselected', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    const modificationId = modificationService.selectedModificationId();
    assessmentService.updateModificationProperty(modificationId, 'losses', {
      flueGasLosses: [{ ...VOLUME_EXCESS_AIR, flueGasByVolume: { ...VOLUME_EXCESS_AIR.flueGasByVolume, combustionAirTemperature: 500 } }],
    });
    modificationService.setExploreOpportunityFlag(modificationId, 'airTemp', { hasOpportunity: true, display: 'Preheat Combustion Air' });

    component.toggleOpportunity(false);

    expect(modificationService.selectedModification().exploreOpportunityFlags.airTemp.hasOpportunity).toBe(false);
    expect(effectiveEntry().flueGasByVolume.combustionAirTemperature).toBe(80);
  });

  it('restores the baseline method when the opportunity is deselected', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    component.changeOxygenCalculationMethod('flue-1', 'Oxygen in Flue Gas');

    component.toggleOpportunity(false);

    expect(effectiveEntry().flueGasByVolume.oxygenCalculationMethod).toBe('Excess Air');
  });

  it('restores both baseline values when the section is closed', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);
    component.setModificationValue('flue-1', 'excessAirPercentage', 5);

    component.toggleSection('airFuelRatio', 'flue-1', false);

    expect(effectiveEntry().flueGasByVolume.excessAirPercentage).toBe(9);
    expect(effectiveEntry().flueGasByVolume.o2InFlueGas).toBe(0);
  });

  it('exposes the baseline oxygen calculation method', () => {
    setup(baselineWith(MASS_OXYGEN));

    expect(component.comparisons()[0].baselineMethod).toBe('Oxygen in Flue Gas');
  });

  it('shows the calculated value for the field the method does not enter', () => {
    setup(baselineWith(MASS_OXYGEN));
    component.toggleOpportunity(true);
    component.toggleSection('airFuelRatio', 'flue-1', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('10.50%');
  });

  it('only compares the first flue gas entry', () => {
    setup(baselineWith(VOLUME_EXCESS_AIR, { ...VOLUME_EXCESS_AIR, id: 'flue-2' }));

    expect(component.comparisons().map(comparison => comparison.id)).toEqual(['flue-1']);
  });
});

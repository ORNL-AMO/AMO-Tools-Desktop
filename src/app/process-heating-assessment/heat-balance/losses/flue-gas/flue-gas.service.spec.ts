import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasFormService, FlueGasType, OxygenCalculationMethod } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';

const BY_VOLUME: FlueGas = {
  name: 'Primary',
  flueGasType: FlueGasType.ByVolume,
  flueGasByVolume: { gasTypeId: 1, flueGasTemperature: 400, oxygenCalculationMethod: OxygenCalculationMethod.ExcessAir, excessAirPercentage: 10, o2InFlueGas: 0,
    combustionAirTemperature: 70, fuelTemperature: 60, ambientAirTemp: 65, moistureInAirCombustion: 1, CH4: 90, C2H6: 5, N2: 5, H2: 0, C3H8: 0,
    C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0 },
};
const EXTRA: FlueGas = { name: 'Extra', flueGasType: FlueGasType.ByVolume, flueGasByVolume: { gasTypeId: 2 } };

describe('FlueGasService', () => {
  let service: FlueGasService;
  let calculationSpy: jasmine.SpyObj<FlueGasCalculationService>;
  let existing: FlueGas[];
  let savedLosses: FlueGas[];

  beforeEach(() => {
    calculationSpy = jasmine.createSpyObj('FlueGasCalculationService', ['calculateByVolume', 'calculateByMass', 'deriveOxygenAndExcessAir']);
    calculationSpy.calculateByVolume.and.returnValue({ calculatedFlueGasO2: 2, calculatedExcessAir: 10, availableHeat: 75 });
    calculationSpy.calculateByMass.and.returnValue({ calculatedFlueGasO2: 3, calculatedExcessAir: 15, availableHeat: 70 });
    calculationSpy.deriveOxygenAndExcessAir.and.returnValue({ o2InFlueGas: 3, excessAirPercentage: 15 });
    existing = [BY_VOLUME, EXTRA];
    savedLosses = [];

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        FlueGasService,
        FlueGasFormService,
        ConvertUnitsService,
        { provide: FlueGasCalculationService, useValue: calculationSpy },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings),
            lossSignal: () => existing,
            updateLossesProperty: (_scenario: string, _key: string, losses: FlueGas[]) => savedLosses = losses,
          },
        },
      ],
    });
    service = TestBed.inject(FlueGasService);
  });

  it('builds a form and result from the first saved entry', () => {
    service.initialize('baseline');

    expect(service.form().controls.flueGasTemperature.value).toBe(400);
    expect(service.result()).toEqual({ calculatedFlueGasO2: 2, calculatedExcessAir: 10, availableHeat: 75 });
    expect(service.flueGasType()).toBe(FlueGasType.ByVolume);
  });

  it('leaves the form blank and result empty when the form is invalid', () => {
    existing = [];
    service.initialize('baseline');

    expect(service.form().valid).toBeFalse();
    expect(service.result()).toBeNull();
  });

  it('saves edits to entry 0 and preserves the extra entries', () => {
    service.initialize('baseline');
    service.form().patchValue({ flueGasTemperature: 450 });

    expect(savedLosses.length).toBe(2);
    expect(savedLosses[0].flueGasByVolume.flueGasTemperature).toBe(450);
    expect(savedLosses[0].name).toBe('Primary');
    expect(savedLosses[1]).toBe(EXTRA);
  });

  it('recalculates when an input changes', () => {
    service.initialize('baseline');
    calculationSpy.calculateByVolume.calls.reset();
    service.form().patchValue({ excessAirPercentage: 20 });

    expect(calculationSpy.calculateByVolume).toHaveBeenCalledTimes(1);
  });

  it('exposes warnings for out-of-range values', () => {
    service.initialize('baseline');
    service.form().patchValue({ flueGasTemperature: 150, combustionAirTemperature: 60 });

    expect(service.warnings().flueGasTemp).toContain('condensing');
  });

  it('builds a By Mass form when the saved entry is By Mass', () => {
    existing = [{ name: 'Coal', flueGasType: FlueGasType.ByMass, flueGasByMass: { gasTypeId: 2, carbon: 70, hydrogen: 5, sulphur: 1, inertAsh: 10, o2: 8, moisture: 4, nitrogen: 2 } }];
    service.initialize('baseline');

    expect(service.flueGasType()).toBe(FlueGasType.ByMass);
    expect(service.form().controls['carbon'].value).toBe(70);
    expect(calculationSpy.calculateByMass).toHaveBeenCalled();
  });

  it('writes the derived O2 / excess air from the calculation service into a By Mass form', () => {
    existing = [{ flueGasType: FlueGasType.ByMass, flueGasByMass: { carbon: 70 } }];
    service.initialize('baseline');

    expect(service.form().controls['o2InFlueGas'].value).toBe(3);
    expect(service.form().controls['excessAirPercentage'].value).toBe(15);
  });

  it('switches type, discarding the other type values, and saves entry 0 while preserving extras', () => {
    service.initialize('baseline');
    service.switchType(FlueGasType.ByMass);

    expect(service.flueGasType()).toBe(FlueGasType.ByMass);
    expect(savedLosses[0].flueGasType).toBe(FlueGasType.ByMass);
    expect(savedLosses[0].flueGasByVolume).toBeUndefined();
    expect(savedLosses[0].name).toBe('Primary');
    expect(savedLosses[1]).toBe(EXTRA);
  });

  it('does nothing when switching to the current type', () => {
    service.initialize('baseline');
    service.switchType(FlueGasType.ByVolume);

    expect(savedLosses).toEqual([]);
  });

  it('saves By Mass edits to entry 0', () => {
    existing = [{ flueGasType: FlueGasType.ByMass, flueGasByMass: { carbon: 70 } }, EXTRA];
    service.initialize('baseline');
    service.form().patchValue({ flueGasTemperature: 650 });

    expect(savedLosses[0].flueGasByMass.flueGasTemperature).toBe(650);
    expect(savedLosses[1]).toBe(EXTRA);
  });
});

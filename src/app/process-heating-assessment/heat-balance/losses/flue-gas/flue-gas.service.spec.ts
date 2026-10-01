import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasFormService } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';

const BY_VOLUME: FlueGas = {
  name: 'Primary',
  flueGasType: 'By Volume',
  flueGasByVolume: { gasTypeId: 1, flueGasTemperature: 400, oxygenCalculationMethod: 'Excess Air', excessAirPercentage: 10, o2InFlueGas: 0,
    combustionAirTemperature: 70, fuelTemperature: 60, ambientAirTemp: 65, moistureInAirCombustion: 1, CH4: 90, C2H6: 5, N2: 5, H2: 0, C3H8: 0,
    C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0 },
};
const EXTRA: FlueGas = { name: 'Extra', flueGasType: 'By Volume', flueGasByVolume: { gasTypeId: 2 } };

describe('FlueGasService', () => {
  let service: FlueGasService;
  let calculationSpy: jasmine.SpyObj<FlueGasCalculationService>;
  let existing: FlueGas[];
  let savedLosses: FlueGas[];

  beforeEach(() => {
    calculationSpy = jasmine.createSpyObj('FlueGasCalculationService', ['calculateByVolume']);
    calculationSpy.calculateByVolume.and.returnValue({ calculatedFlueGasO2: 2, calculatedExcessAir: 10, availableHeat: 75 });
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
    expect(service.isByMass()).toBeFalse();
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

  it('does not build a form or write when the saved entry is By Mass', () => {
    existing = [{ flueGasType: 'By Mass', flueGasByMass: { gasTypeId: 1 } }];
    service.initialize('baseline');

    expect(service.isByMass()).toBeTrue();
    expect(service.form()).toBeNull();
    expect(savedLosses).toEqual([]);
  });
});

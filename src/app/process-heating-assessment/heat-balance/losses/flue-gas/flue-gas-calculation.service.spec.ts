import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { OxygenCalculationMethod } from './flue-gas-form.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

const INPUT: FlueGasByVolume = {
  flueGasTemperature: 400, combustionAirTemperature: 70, fuelTemperature: 60, ambientAirTemp: 65, moistureInAirCombustion: 1.5,
  o2InFlueGas: 3, excessAirPercentage: 0,
};

describe('FlueGasCalculationService', () => {
  let service: FlueGasCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasLossesByVolume', 'flueGasLossesByMass', 'flueGasByMassCalculateExcessAir', 'flueGasByMassCalculateO2']);
    apiSpy.flueGasLossesByVolume.and.returnValue({ flueGasO2: 0.03, excessAir: 0.15, availableHeat: 0.8 });
    apiSpy.flueGasLossesByMass.and.returnValue(0.7);
    apiSpy.flueGasByMassCalculateExcessAir.and.returnValue(18);
    apiSpy.flueGasByMassCalculateO2.and.returnValue(3.5);
    TestBed.configureTestingModule({
      providers: [FlueGasCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(FlueGasCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial temperatures through and maps the suite-named inputs', () => {
    service.calculateByVolume(INPUT, IMPERIAL);

    expect(apiSpy.flueGasLossesByVolume).toHaveBeenCalledWith(jasmine.objectContaining({
      flueGasTemperature: 400, combustionAirTemperature: 70, fuelTemperature: 60, ambientAirTempF: 65,
      combAirMoisturePerc: 0.015, flueGasO2Percentage: 3,
    }));
  });

  it('converts Metric temperatures to Fahrenheit', () => {
    service.calculateByVolume({ ...INPUT, flueGasTemperature: 200, combustionAirTemperature: 20, fuelTemperature: 15, ambientAirTemp: 18 }, METRIC);

    const sent = apiSpy.flueGasLossesByVolume.calls.mostRecent().args[0];
    expect(sent.flueGasTemperature).toBeCloseTo(convert.value(200).from('C').to('F'), 6);
    expect(sent.combustionAirTemperature).toBeCloseTo(convert.value(20).from('C').to('F'), 6);
    expect(sent.fuelTemperature).toBeCloseTo(convert.value(15).from('C').to('F'), 6);
    expect(sent.ambientAirTempF).toBeCloseTo(convert.value(18).from('C').to('F'), 6);
  });

  it('does not mutate the input', () => {
    const input = { ...INPUT };
    service.calculateByVolume(input, METRIC);

    expect(input).toEqual(INPUT);
  });

  it('returns the suite fractions as percent', () => {
    expect(service.calculateByVolume(INPUT, IMPERIAL)).toEqual({ calculatedFlueGasO2: 3, calculatedExcessAir: 15, availableHeat: 80 });
  });

  it('returns 0 for NaN suite results', () => {
    apiSpy.flueGasLossesByVolume.and.returnValue({ flueGasO2: NaN, excessAir: NaN, availableHeat: NaN });

    expect(service.calculateByVolume(INPUT, IMPERIAL)).toEqual({ calculatedFlueGasO2: 0, calculatedExcessAir: 0, availableHeat: 0 });
  });

  describe('By Mass', () => {
    const MASS: FlueGasByMass = {
      flueGasTemperature: 500, combustionAirTemperature: 70, fuelTemperature: 60, ambientAirTemp: 65, moistureInAirCombustion: 1.5,
      ashDischargeTemperature: 300, unburnedCarbonInAsh: 2, carbon: 70, hydrogen: 5, sulphur: 1, inertAsh: 10, o2: 8, moisture: 4, nitrogen: 2,
      oxygenCalculationMethod: OxygenCalculationMethod.ExcessAir, excessAirPercentage: 20, o2InFlueGas: 0,
    };

    it('derives O2 from excess air when the method is Excess Air', () => {
      const result = service.calculateByMass(MASS, IMPERIAL);

      expect(apiSpy.flueGasByMassCalculateO2).toHaveBeenCalledWith(jasmine.objectContaining({ excessAir: 20, carbon: 70, moistureInAirCombustion: 1.5 }));
      expect(apiSpy.flueGasLossesByMass).toHaveBeenCalledWith(jasmine.objectContaining({ excessAirPercentage: 20, ambientAirTempF: 65 }));
      expect(result).toEqual({ calculatedFlueGasO2: 3.5, calculatedExcessAir: 20, availableHeat: 70 });
    });

    it('derives excess air from O2 when the method is Oxygen in Flue Gas', () => {
      const result = service.calculateByMass({ ...MASS, oxygenCalculationMethod: OxygenCalculationMethod.OxygenInFlueGas, o2InFlueGas: 3, excessAirPercentage: 0 }, IMPERIAL);

      expect(apiSpy.flueGasByMassCalculateExcessAir).toHaveBeenCalledWith(jasmine.objectContaining({ o2InFlueGas: 3 }));
      expect(apiSpy.flueGasLossesByMass).toHaveBeenCalledWith(jasmine.objectContaining({ excessAirPercentage: 18 }));
      expect(result).toEqual({ calculatedFlueGasO2: 3, calculatedExcessAir: 18, availableHeat: 70 });
    });

    it('treats out-of-range O2 and negative excess air as 0 without calling the suite', () => {
      expect(service.deriveOxygenAndExcessAir({ ...MASS, oxygenCalculationMethod: OxygenCalculationMethod.OxygenInFlueGas, o2InFlueGas: 21 }).excessAirPercentage).toBe(0);
      expect(service.deriveOxygenAndExcessAir({ ...MASS, excessAirPercentage: -1 }).o2InFlueGas).toBe(0);
      expect(apiSpy.flueGasByMassCalculateExcessAir).not.toHaveBeenCalled();
      expect(apiSpy.flueGasByMassCalculateO2).not.toHaveBeenCalled();
    });

    it('converts Metric temperatures to Fahrenheit', () => {
      service.calculateByMass({ ...MASS, flueGasTemperature: 250, combustionAirTemperature: 20, fuelTemperature: 15, ambientAirTemp: 18, ashDischargeTemperature: 150 }, METRIC);

      const sent = apiSpy.flueGasLossesByMass.calls.mostRecent().args[0];
      expect(sent.flueGasTemperature).toBeCloseTo(convert.value(250).from('C').to('F'), 6);
      expect(sent.ashDischargeTemperature).toBeCloseTo(convert.value(150).from('C').to('F'), 6);
      expect(sent.ambientAirTempF).toBeCloseTo(convert.value(18).from('C').to('F'), 6);
    });

    it('returns 0 for NaN suite results', () => {
      apiSpy.flueGasLossesByMass.and.returnValue(NaN);

      expect(service.calculateByMass(MASS, IMPERIAL).availableHeat).toBe(0);
    });
  });
});

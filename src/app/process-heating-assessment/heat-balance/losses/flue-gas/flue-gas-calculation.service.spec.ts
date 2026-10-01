import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { FlueGasCalculationService } from './flue-gas-calculation.service';

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
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasLossesByVolume']);
    apiSpy.flueGasLossesByVolume.and.returnValue({ flueGasO2: 0.03, excessAir: 0.15, availableHeat: 0.8 });
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
});

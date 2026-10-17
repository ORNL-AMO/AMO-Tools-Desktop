import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { GasLeakageCalculationService } from './gas-leakage-calculation.service';

const LOSS: LeakageLoss = {
  draftPressure: 0.1, openingArea: 2, leakageGasTemperature: 1500, ambientTemperature: 70,
  coefficient: 0.8052, specificGravity: 1, correctionFactor: 1,
};
const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('GasLeakageCalculationService', () => {
  let service: GasLeakageCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['leakageLosses']);
    apiSpy.leakageLosses.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [GasLeakageCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(GasLeakageCalculationService);
  });

  it('passes Imperial inputs to the suite unchanged and returns the Btu result', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    expect(apiSpy.leakageLosses).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
    expect(result).toBe(1000);
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate(LOSS, METRIC);

    const sent = apiSpy.leakageLosses.calls.mostRecent().args[0];
    expect(sent.draftPressure).toBeCloseTo(new ConvertValue(0.1, 'Pa', 'inH2o').convertedValue, 6);
    expect(sent.openingArea).toBeCloseTo(new ConvertValue(2, 'm2', 'ft2').convertedValue, 6);
    expect(sent.ambientTemperature).toBeCloseTo(new ConvertValue(70, 'C', 'F').convertedValue, 6);
    expect(sent.leakageGasTemperature).toBeCloseTo(new ConvertValue(1500, 'C', 'F').convertedValue, 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(LOSS);
  });

  it('converts the result to the requested energy unit', () => {
    const result = service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings);

    expect(result).toBeCloseTo(new ConvertValue(1000, 'Btu', 'kWh').convertedValue, 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.leakageLosses.and.returnValue(NaN);

    expect(service.calculate(LOSS, IMPERIAL)).toBe(0);
  });
});

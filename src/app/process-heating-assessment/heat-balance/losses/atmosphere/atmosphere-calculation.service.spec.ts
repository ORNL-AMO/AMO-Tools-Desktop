import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { AtmosphereCalculationService } from './atmosphere-calculation.service';

const LOSS: AtmosphereLoss = { specificHeat: 0.018, flowRate: 1000, inletTemperature: 70, outletTemperature: 300, correctionFactor: 1 };
const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('AtmosphereCalculationService', () => {
  let service: AtmosphereCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['atmosphere']);
    apiSpy.atmosphere.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [AtmosphereCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(AtmosphereCalculationService);
  });

  it('passes Imperial inputs through unchanged', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    expect(apiSpy.atmosphere).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
    expect(result).toBe(1000);
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate(LOSS, METRIC);

    const sent = apiSpy.atmosphere.calls.mostRecent().args[0];
    expect(sent.inletTemperature).toBeCloseTo(new ConvertValue(70, 'C', 'F').convertedValue, 6);
    expect(sent.outletTemperature).toBeCloseTo(new ConvertValue(300, 'C', 'F').convertedValue, 6);
    expect(sent.flowRate).toBeCloseTo(new ConvertValue(1000, 'm3/h', 'ft3/h').convertedValue, 6);
    expect(sent.specificHeat).toBeCloseTo(new ConvertValue(0.018, 'kJm3C', 'btuScfF').convertedValue, 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(LOSS);
  });

  it('converts the result to the requested energy unit', () => {
    apiSpy.atmosphere.and.returnValue(1000);

    const result = service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings);

    expect(result).toBeCloseTo(new ConvertValue(1000, 'Btu', 'kWh').convertedValue, 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.atmosphere.and.returnValue(NaN);

    expect(service.calculate(LOSS, IMPERIAL)).toBe(0);
  });
});

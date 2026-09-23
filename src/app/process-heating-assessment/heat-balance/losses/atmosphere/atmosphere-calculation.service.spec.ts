import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['atmosphere']);
    apiSpy.atmosphere.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [AtmosphereCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(AtmosphereCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial inputs through unchanged', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    expect(apiSpy.atmosphere).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
    expect(result).toBe(1000);
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate(LOSS, METRIC);

    const sent = apiSpy.atmosphere.calls.mostRecent().args[0];
    expect(sent.inletTemperature).toBeCloseTo(convert.value(70).from('C').to('F'), 6);
    expect(sent.outletTemperature).toBeCloseTo(convert.value(300).from('C').to('F'), 6);
    expect(sent.flowRate).toBeCloseTo(convert.value(1000).from('m3/h').to('ft3/h'), 6);
    expect(sent.specificHeat).toBeCloseTo(convert.value(0.018).from('kJm3C').to('btuScfF'), 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(LOSS);
  });

  it('converts the result to the requested energy unit', () => {
    apiSpy.atmosphere.and.returnValue(1000);

    const result = service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings);

    expect(result).toBeCloseTo(convert.value(1000).from('Btu').to('kWh'), 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.atmosphere.and.returnValue(NaN);

    expect(service.calculate(LOSS, IMPERIAL)).toBe(0);
  });
});

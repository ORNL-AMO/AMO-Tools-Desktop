import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['leakageLosses']);
    apiSpy.leakageLosses.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [GasLeakageCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(GasLeakageCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial inputs to the suite unchanged and returns the Btu result', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    expect(apiSpy.leakageLosses).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
    expect(result).toBe(1000);
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate(LOSS, METRIC);

    const sent = apiSpy.leakageLosses.calls.mostRecent().args[0];
    expect(sent.draftPressure).toBeCloseTo(convert.value(0.1).from('Pa').to('inH2o'), 6);
    expect(sent.openingArea).toBeCloseTo(convert.value(2).from('m2').to('ft2'), 6);
    expect(sent.ambientTemperature).toBeCloseTo(convert.value(70).from('C').to('F'), 6);
    expect(sent.leakageGasTemperature).toBeCloseTo(convert.value(1500).from('C').to('F'), 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(LOSS);
  });

  it('converts the result to the requested energy unit', () => {
    const result = service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings);

    expect(result).toBeCloseTo(convert.value(1000).from('Btu').to('kWh'), 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.leakageLosses.and.returnValue(NaN);

    expect(service.calculate(LOSS, IMPERIAL)).toBe(0);
  });
});

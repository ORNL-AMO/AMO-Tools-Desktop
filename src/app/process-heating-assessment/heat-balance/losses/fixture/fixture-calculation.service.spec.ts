import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { FixtureCalculationService } from './fixture-calculation.service';

const LOSS: FixtureLoss = { specificHeat: 0.5, feedRate: 100, initialTemperature: 20, finalTemperature: 520, correctionFactor: 1 };

describe('FixtureCalculationService', () => {
  let service: FixtureCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['fixtureLosses']);
    TestBed.configureTestingModule({
      providers: [
        FixtureCalculationService,
        { provide: ProcessHeatingApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(FixtureCalculationService);
  });

  it('passes Imperial inputs through unchanged', () => {
    apiSpy.fixtureLosses.and.returnValue(1000);

    const result = service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings);

    expect(apiSpy.fixtureLosses).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
    expect(result).toBe(1000);
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    apiSpy.fixtureLosses.and.returnValue(1000);

    service.calculate(LOSS, { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings);

    const sent = apiSpy.fixtureLosses.calls.mostRecent().args[0];
    expect(sent.initialTemperature).toBeCloseTo(new ConvertValue(20, 'C', 'F').convertedValue, 6);
    expect(sent.finalTemperature).toBeCloseTo(new ConvertValue(520, 'C', 'F').convertedValue, 6);
    expect(sent.specificHeat).toBeCloseTo(new ConvertValue(0.5, 'kJkgC', 'btulbF').convertedValue, 6);
    expect(sent.feedRate).toBeCloseTo(new ConvertValue(100, 'kg', 'lb').convertedValue, 6);
  });

  it('does not mutate the input loss', () => {
    apiSpy.fixtureLosses.and.returnValue(1000);
    const input = { ...LOSS };

    service.calculate(input, { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings);

    expect(input).toEqual(LOSS);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.fixtureLosses.and.returnValue(NaN);

    expect(service.calculate(LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings)).toBe(0);
  });
});

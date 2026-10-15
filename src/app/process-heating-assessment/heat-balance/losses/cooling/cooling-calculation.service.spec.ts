import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { CoolingCalculationService } from './cooling-calculation.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('CoolingCalculationService', () => {
  let service: CoolingCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['gasCoolingLosses', 'liquidCoolingLosses']);
    apiSpy.gasCoolingLosses.and.returnValue(1000);
    apiSpy.liquidCoolingLosses.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [CoolingCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(CoolingCalculationService);
  });

  it('passes Imperial gas inputs through unchanged', () => {
    const input = { flowRate: 100, gasDensity: 0.07, initialTemperature: 70, finalTemperature: 300, specificHeat: 0.24, correctionFactor: 1 };

    expect(service.calculateGas(input, IMPERIAL)).toBe(1000);
    expect(apiSpy.gasCoolingLosses).toHaveBeenCalledWith(jasmine.objectContaining(input));
  });

  it('converts Metric gas inputs to Imperial', () => {
    service.calculateGas({ flowRate: 10, gasDensity: 1.2, initialTemperature: 20, finalTemperature: 150, specificHeat: 1 }, METRIC);

    const sent = apiSpy.gasCoolingLosses.calls.mostRecent().args[0];
    expect(sent.flowRate).toBeCloseTo(new ConvertValue(10, 'm3', 'ft3').convertedValue, 6);
    expect(sent.gasDensity).toBeCloseTo(new ConvertValue(1.2, 'kgNm3', 'lbscf').convertedValue, 6);
    expect(sent.finalTemperature).toBeCloseTo(new ConvertValue(150, 'C', 'F').convertedValue, 6);
    expect(sent.specificHeat).toBeCloseTo(new ConvertValue(1, 'kJkgC', 'btulbF').convertedValue, 6);
  });

  it('converts Metric liquid inputs to Imperial, using the liquid outlet field', () => {
    service.calculateLiquid({ flowRate: 10, density: 1, initialTemperature: 20, outletTemperature: 40, specificHeat: 4.187 }, METRIC);

    const sent = apiSpy.liquidCoolingLosses.calls.mostRecent().args[0];
    expect(sent.flowRate).toBeCloseTo(new ConvertValue(10, 'L', 'gal').convertedValue, 6);
    expect(sent.density).toBeCloseTo(new ConvertValue(1, 'kgL', 'lbgal').convertedValue, 6);
    expect(sent.outletTemperature).toBeCloseTo(new ConvertValue(40, 'C', 'F').convertedValue, 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.liquidCoolingLosses.and.returnValue(NaN);

    expect(service.calculateLiquid({}, IMPERIAL)).toBe(0);
  });
});

import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { CoolingCalculationService } from './cooling-calculation.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('CoolingCalculationService', () => {
  let service: CoolingCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['gasCoolingLosses', 'liquidCoolingLosses']);
    apiSpy.gasCoolingLosses.and.returnValue(1000);
    apiSpy.liquidCoolingLosses.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [CoolingCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(CoolingCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial gas inputs through unchanged', () => {
    const input = { flowRate: 100, gasDensity: 0.07, initialTemperature: 70, finalTemperature: 300, specificHeat: 0.24, correctionFactor: 1 };

    expect(service.calculateGas(input, IMPERIAL)).toBe(1000);
    expect(apiSpy.gasCoolingLosses).toHaveBeenCalledWith(jasmine.objectContaining(input));
  });

  it('converts Metric gas inputs to Imperial', () => {
    service.calculateGas({ flowRate: 10, gasDensity: 1.2, initialTemperature: 20, finalTemperature: 150, specificHeat: 1 }, METRIC);

    const sent = apiSpy.gasCoolingLosses.calls.mostRecent().args[0];
    expect(sent.flowRate).toBeCloseTo(convert.value(10).from('m3').to('ft3'), 6);
    expect(sent.gasDensity).toBeCloseTo(convert.value(1.2).from('kgNm3').to('lbscf'), 6);
    expect(sent.finalTemperature).toBeCloseTo(convert.value(150).from('C').to('F'), 6);
    expect(sent.specificHeat).toBeCloseTo(convert.value(1).from('kJkgC').to('btulbF'), 6);
  });

  it('converts Metric liquid inputs to Imperial, using the liquid outlet field', () => {
    service.calculateLiquid({ flowRate: 10, density: 1, initialTemperature: 20, outletTemperature: 40, specificHeat: 4.187 }, METRIC);

    const sent = apiSpy.liquidCoolingLosses.calls.mostRecent().args[0];
    expect(sent.flowRate).toBeCloseTo(convert.value(10).from('L').to('gal'), 6);
    expect(sent.density).toBeCloseTo(convert.value(1).from('kgL').to('lbgal'), 6);
    expect(sent.outletTemperature).toBeCloseTo(convert.value(40).from('C').to('F'), 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.liquidCoolingLosses.and.returnValue(NaN);

    expect(service.calculateLiquid({}, IMPERIAL)).toBe(0);
  });
});

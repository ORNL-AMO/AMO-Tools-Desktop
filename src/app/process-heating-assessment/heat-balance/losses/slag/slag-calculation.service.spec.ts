import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { SlagCalculationService } from './slag-calculation.service';

const LOSS: Slag = { weight: 100, inletTemperature: 80, outletTemperature: 2000, specificHeat: 0.2, correctionFactor: 1 };
const settingsFor = (unitsOfMeasure: string, energyResultUnit: string) => ({ unitsOfMeasure, energyResultUnit } as Settings);

describe('SlagCalculationService', () => {
  let service: SlagCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['slagOtherMaterialTotalHeatLoss']);
    apiSpy.slagOtherMaterialTotalHeatLoss.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [SlagCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(SlagCalculationService);
  });

  it('passes Imperial inputs through and returns the Btu result', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(1000);
    expect(apiSpy.slagOtherMaterialTotalHeatLoss).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate({ weight: 100, inletTemperature: 25, outletTemperature: 1000, specificHeat: 1, correctionFactor: 1 }, settingsFor('Metric', 'Btu'));

    const sent = apiSpy.slagOtherMaterialTotalHeatLoss.calls.mostRecent().args[0];
    expect(sent.weight).toBeCloseTo(new ConvertValue(100, 'kg', 'lb').convertedValue, 6);
    expect(sent.inletTemperature).toBeCloseTo(77, 6);
    expect(sent.specificHeat).toBeCloseTo(new ConvertValue(1, 'kJkgC', 'btulbF').convertedValue, 6);
  });

  it('converts the result to the energy result unit', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'kJ'))).toBeCloseTo(new ConvertValue(1000, 'Btu', 'kJ').convertedValue, 6);
  });

  it('does not mutate the input', () => {
    const input = { ...LOSS };

    service.calculate(input, settingsFor('Metric', 'Btu'));

    expect(input).toEqual(LOSS);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.slagOtherMaterialTotalHeatLoss.and.returnValue(NaN);

    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(0);
  });
});

import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { OpeningCalculationService } from './opening-calculation.service';

const ROUND_LOSS: OpeningLoss = {
  openingType: 'Round', numberOfOpenings: 2, emissivity: 0.9, thickness: 6, lengthOfOpening: 12,
  ambientTemperature: 70, insideTemperature: 500, percentTimeOpen: 50, viewFactor: 0.8,
};
const QUAD_LOSS: OpeningLoss = {
  ...ROUND_LOSS, openingType: 'Rectangular (or Square)', heightOfOpening: 8,
};
const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('OpeningCalculationService', () => {
  let service: OpeningCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['openingLossesCircular', 'openingLossesQuad']);
    apiSpy.openingLossesCircular.and.returnValue(1000);
    apiSpy.openingLossesQuad.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [OpeningCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(OpeningCalculationService);
  });

  it('dispatches Round openings to the circular suite call with Imperial inputs unchanged', () => {
    const result = service.calculate(ROUND_LOSS, IMPERIAL);

    expect(apiSpy.openingLossesCircular).toHaveBeenCalledWith(jasmine.objectContaining({
      emissivity: 0.9, diameter: 12, thickness: 6, ambientTemperature: 70, insideTemperature: 500,
      percentTimeOpen: 50, viewFactor: 0.8,
    }));
    expect(apiSpy.openingLossesQuad).not.toHaveBeenCalled();
    expect(result).toBe(2000);
  });

  it('dispatches Rectangular openings to the quad suite call with Imperial inputs unchanged', () => {
    const result = service.calculate(QUAD_LOSS, IMPERIAL);

    expect(apiSpy.openingLossesQuad).toHaveBeenCalledWith(jasmine.objectContaining({
      emissivity: 0.9, length: 12, width: 8, thickness: 6, ambientTemperature: 70, insideTemperature: 500,
      percentTimeOpen: 50, viewFactor: 0.8,
    }));
    expect(apiSpy.openingLossesCircular).not.toHaveBeenCalled();
    expect(result).toBe(2000);
  });

  it('converts Metric inputs to Imperial before calling the suite (circular)', () => {
    service.calculate(ROUND_LOSS, METRIC);

    const sent = apiSpy.openingLossesCircular.calls.mostRecent().args[0];
    expect(sent.ambientTemperature).toBeCloseTo(new ConvertValue(70, 'C', 'F').convertedValue, 6);
    expect(sent.insideTemperature).toBeCloseTo(new ConvertValue(500, 'C', 'F').convertedValue, 6);
    expect(sent.thickness).toBeCloseTo(new ConvertValue(6, 'mm', 'in').convertedValue, 6);
    expect(sent.diameter).toBeCloseTo(new ConvertValue(12, 'mm', 'in').convertedValue, 6);
  });

  it('converts Metric inputs to Imperial before calling the suite (quad, including height)', () => {
    service.calculate(QUAD_LOSS, METRIC);

    const sent = apiSpy.openingLossesQuad.calls.mostRecent().args[0];
    expect(sent.length).toBeCloseTo(new ConvertValue(12, 'mm', 'in').convertedValue, 6);
    expect(sent.width).toBeCloseTo(new ConvertValue(8, 'mm', 'in').convertedValue, 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...QUAD_LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(QUAD_LOSS);
  });

  it('converts the per-opening result to the requested energy unit before multiplying by numberOfOpenings', () => {
    apiSpy.openingLossesCircular.and.returnValue(1000);

    const result = service.calculate(ROUND_LOSS, { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings);

    expect(result).toBeCloseTo(new ConvertValue(1000, 'Btu', 'kWh').convertedValue * 2, 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.openingLossesCircular.and.returnValue(NaN);

    expect(service.calculate(ROUND_LOSS, IMPERIAL)).toBe(0);
  });
});

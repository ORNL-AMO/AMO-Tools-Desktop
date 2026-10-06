import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { ExhaustGasCalculationService } from './exhaust-gas-calculation.service';

const LOSS: ExhaustGasEAF = { offGasTemp: 1500, CO: 10, H2: 5, combustibleGases: 2, vfr: 1000, dustLoading: 0.01, otherLosses: 0 };
const settingsFor = (unitsOfMeasure: string, energyResultUnit: string) => ({ unitsOfMeasure, energyResultUnit } as Settings);

describe('ExhaustGasCalculationService', () => {
  let service: ExhaustGasCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['exhaustGasEAF']);
    apiSpy.exhaustGasEAF.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [ExhaustGasCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(ExhaustGasCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial inputs through and returns the Btu result', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(1000);
    expect(apiSpy.exhaustGasEAF).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate({ ...LOSS, offGasTemp: 100, vfr: 10, dustLoading: 0.5 }, settingsFor('Metric', 'Btu'));

    const sent = apiSpy.exhaustGasEAF.calls.mostRecent().args[0];
    expect(sent.offGasTemp).toBeCloseTo(212, 6);
    expect(sent.vfr).toBeCloseTo(convert.value(10).from('m3').to('ft3'), 6);
    expect(sent.dustLoading).toBeCloseTo(convert.value(0.5).from('kgNm3').to('lbscf'), 6);
  });

  it('converts the result to the energy result unit', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'kJ'))).toBeCloseTo(convert.value(1000).from('Btu').to('kJ'), 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.exhaustGasEAF.and.returnValue(NaN);

    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(0);
  });
});

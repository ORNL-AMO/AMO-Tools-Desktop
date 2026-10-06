import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { EnergyInputCalculationService } from './energy-input-calculation.service';

const LOSS: EnergyInputEAF = {
  naturalGasHeatInput: 10, coalCarbonInjection: 100, coalHeatingValue: 12000,
  electrodeUse: 50, electrodeHeatingValue: 14000, otherFuels: 1, electricityInput: 5000,
};
const settingsFor = (unitsOfMeasure: string, energyResultUnit: string) => ({ unitsOfMeasure, energyResultUnit } as Settings);

describe('EnergyInputCalculationService', () => {
  let service: EnergyInputCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['energyInputEAF']);
    apiSpy.energyInputEAF.and.returnValue({ heatDelivered: 1000, totalChemicalEnergyInput: 500 });
    TestBed.configureTestingModule({
      providers: [EnergyInputCalculationService, ConvertUnitsService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(EnergyInputCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('passes Imperial inputs through and returns heat delivered in Btu', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(1000);
    expect(apiSpy.energyInputEAF).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
  });

  it('converts Metric inputs to Imperial before calling the suite', () => {
    service.calculate({ ...LOSS, naturalGasHeatInput: 10, coalCarbonInjection: 100, coalHeatingValue: 28000 }, settingsFor('Metric', 'Btu'));

    const sent = apiSpy.energyInputEAF.calls.mostRecent().args[0];
    expect(sent.naturalGasHeatInput).toBeCloseTo(convert.value(10).from('GJ').to('MMBtu'), 6);
    expect(sent.coalCarbonInjection).toBeCloseTo(convert.value(100).from('kg').to('lb'), 6);
    expect(sent.coalHeatingValue).toBeCloseTo(convert.value(28000).from('kJkg').to('btuLb'), 6);
  });

  it('converts heat delivered to the energy result unit', () => {
    expect(service.calculate(LOSS, settingsFor('Imperial', 'kJ'))).toBeCloseTo(convert.value(1000).from('Btu').to('kJ'), 6);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.energyInputEAF.and.returnValue({ heatDelivered: NaN, totalChemicalEnergyInput: NaN });

    expect(service.calculate(LOSS, settingsFor('Imperial', 'Btu'))).toBe(0);
  });
});

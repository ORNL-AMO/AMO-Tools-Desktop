import { TestBed } from '@angular/core/testing';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { AuxiliaryPowerCalculationService } from './auxiliary-power-calculation.service';

const LOSS: AuxiliaryPowerLoss = { motorPhase: 3, supplyVoltage: 460, avgCurrent: 20, powerFactor: 0.85, operatingTime: 80 };
const settingsFor = (energyResultUnit: string) => ({ unitsOfMeasure: 'Imperial', energyResultUnit } as Settings);

describe('AuxiliaryPowerCalculationService', () => {
  let service: AuxiliaryPowerCalculationService;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['auxiliaryPowerLoss']);
    apiSpy.auxiliaryPowerLoss.and.returnValue(1000);
    TestBed.configureTestingModule({
      providers: [AuxiliaryPowerCalculationService, { provide: ProcessHeatingApiService, useValue: apiSpy }],
    });
    service = TestBed.inject(AuxiliaryPowerCalculationService);
  });

  it('sends the loss to the suite and returns the Btu result unchanged', () => {
    expect(service.calculate(LOSS, settingsFor('Btu'))).toBe(1000);
    expect(apiSpy.auxiliaryPowerLoss).toHaveBeenCalledWith(jasmine.objectContaining(LOSS));
  });

  it('converts Btu/hr to kW for kWh results', () => {
    expect(service.calculate(LOSS, settingsFor('kWh'))).toBeCloseTo(new ConvertValue(1000, 'btuhr', 'kW').convertedValue, 6);
  });

  it('converts to other energy units from Btu', () => {
    expect(service.calculate(LOSS, settingsFor('kJ'))).toBeCloseTo(new ConvertValue(1000, 'Btu', 'kJ').convertedValue, 6);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, settingsFor('Btu'));

    expect(input).toEqual(LOSS);
  });

  it('returns 0 when the suite returns NaN', () => {
    apiSpy.auxiliaryPowerLoss.and.returnValue(NaN);

    expect(service.calculate(LOSS, settingsFor('Btu'))).toBe(0);
  });
});

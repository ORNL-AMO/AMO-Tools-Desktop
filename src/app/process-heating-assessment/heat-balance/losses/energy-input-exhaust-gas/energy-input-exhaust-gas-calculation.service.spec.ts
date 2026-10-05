import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputExhaustGasCalculationService } from './energy-input-exhaust-gas-calculation.service';

const LOSS: EnergyInputExhaustGasLoss = { totalHeatInput: 10, availableHeat: 80, electricalHeaterEfficiency: 90 };
const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('EnergyInputExhaustGasCalculationService', () => {
  let service: EnergyInputExhaustGasCalculationService;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EnergyInputExhaustGasCalculationService, ConvertUnitsService] });
    service = TestBed.inject(EnergyInputExhaustGasCalculationService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('computes fuel heat delivered and exhaust gas losses from MMBtu in Imperial', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    // 10 MMBtu = 10,000,000 Btu; delivered = 80%; exhaust = delivered * 20 / 80
    expect(result.fuelHeatDelivered).toBeCloseTo(8_000_000, 3);
    expect(result.exhaustGasLosses).toBeCloseTo(2_000_000, 3);
  });

  it('returns available heat and electrical efficiency as a fraction', () => {
    const result = service.calculate(LOSS, IMPERIAL);

    expect(result.availableHeat).toBe(80);
    expect(result.electricalEfficiency).toBeCloseTo(0.9, 6);
  });

  it('treats total heat input as GJ in Metric and converts results to the energy unit', () => {
    const result = service.calculate(LOSS, METRIC);

    const deliveredBtu = convert.value(10).from('GJ').to('Btu') * 0.8;
    expect(result.fuelHeatDelivered).toBeCloseTo(convert.value(deliveredBtu).from('Btu').to('kJ'), 3);
  });

  it('has no exhaust gas losses at 100% available heat', () => {
    expect(service.calculate({ ...LOSS, availableHeat: 100 }, IMPERIAL).exhaustGasLosses).toBe(0);
  });

  it('returns 0 results for NaN inputs', () => {
    const result = service.calculate({ ...LOSS, totalHeatInput: NaN }, IMPERIAL);

    expect(result.fuelHeatDelivered).toBe(0);
    expect(result.exhaustGasLosses).toBe(0);
  });

  it('does not mutate the input loss', () => {
    const input = { ...LOSS };

    service.calculate(input, METRIC);

    expect(input).toEqual(LOSS);
  });
});

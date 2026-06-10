import { UntypedFormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PhastCo2SavingsData } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { Co2SavingsPhastService } from './co2-savings-phast.service';

const IMPERIAL: Settings = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu', emissionsUnit: 'Imperial' };
const METRIC: Settings = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ', emissionsUnit: 'Metric' };

function fuelData(electricityUse: number, rate = 53.06): PhastCo2SavingsData {
  return {
    energyType: 'fuel',
    totalEmissionOutputRate: rate,
    totalFuelEmissionOutputRate: rate,
    electricityUse,
    totalEmissionOutput: 0,
  };
}

describe('Co2SavingsPhastService — Metric conversion', () => {
  let service: Co2SavingsPhastService;
  let cs: ConvertUnitsService;

  beforeEach(() => {
    cs = new ConvertUnitsService();
    service = new Co2SavingsPhastService(cs, new UntypedFormBuilder());
  });

  describe('checkConvertEnergyResultValue', () => {
    it('converts MMBtu → GJ under Imperial settings', () => {
      const result = service.checkConvertEnergyResultValue(100, 'MMBtu', IMPERIAL);
      expect(result).toBeCloseTo(cs.value(100).from('MMBtu').to('GJ'), 4);
    });

    it('converts GJ → MMBtu under Metric settings', () => {
      const result = service.checkConvertEnergyResultValue(100, 'GJ', METRIC);
      expect(result).toBeCloseTo(cs.value(100).from('GJ').to('MMBtu'), 4);
    });

    it('skips conversion when energy is already in the internal calculation unit', () => {
      // Imperial internal unit is GJ — no conversion needed when input is already GJ
      expect(service.checkConvertEnergyResultValue(100, 'GJ', IMPERIAL)).toBe(100);
    });
  });

  describe('getHourlyTotalEmissionsOutput — fuel energy type', () => {
    it('Metric and Imperial produce the same hourly emission for the same physical energy', () => {
      // 200 MMBtu and its GJ equivalent represent the same fuel energy
      const energyMMBtu = 200;
      const energyGJ = cs.value(energyMMBtu).from('MMBtu').to('GJ');

      const imperialResult = service.getHourlyTotalEmissionsOutput(fuelData(energyMMBtu), IMPERIAL, true);
      const metricResult = service.getHourlyTotalEmissionsOutput(fuelData(energyGJ), METRIC, true);

      expect(metricResult).toBeCloseTo(imperialResult, 4);
    });

    it('returns 0 when electricityUse is 0', () => {
      expect(service.getHourlyTotalEmissionsOutput(fuelData(0), METRIC, true)).toBe(0);
    });

    it('rate is scaled proportionally to electricityUse', () => {
      const half = service.getHourlyTotalEmissionsOutput(fuelData(100), METRIC, true);
      const full = service.getHourlyTotalEmissionsOutput(fuelData(200), METRIC, true);
      expect(full).toBeCloseTo(half * 2, 6);
    });
  });

  describe('getHourlyTotalEmissionsOutput — non-fuel energy type', () => {
    it('does not adjust the emission rate for Metric when energyType is not fuel', () => {
      const RATE = 200;
      const electricityData: PhastCo2SavingsData = {
        energyType: 'electricity',
        totalEmissionOutputRate: RATE,
        electricityUse: 1000,
        totalEmissionOutput: 0,
      };
      // For non-fuel the rate is NOT divided by the GJ/MMBtu factor.
      // The expected result uses the raw rate times the energy value after unit normalisation.
      const expectedEnergyInCalcUnit = cs.value(1000).from('GJ').to('MMBtu'); // Metric normalises to MMBtu
      const expected = RATE * expectedEnergyInCalcUnit / 1000;
      expect(service.getHourlyTotalEmissionsOutput(electricityData, METRIC)).toBeCloseTo(expected, 4);
    });
  });
});

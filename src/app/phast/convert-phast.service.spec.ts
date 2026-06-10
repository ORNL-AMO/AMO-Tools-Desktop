import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PhastCo2SavingsData } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';
import { ConvertPhastService } from './convert-phast.service';

const IMPERIAL: Settings = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu', energySourceType: 'Fuel' };
const METRIC: Settings = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ', energySourceType: 'Fuel' };
const IMPERIAL_ELEC: Settings = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu', energySourceType: 'Electricity' };
const METRIC_ELEC: Settings = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ', energySourceType: 'Electricity' };
const IMPERIAL_EAF: Settings = { ...IMPERIAL_ELEC, furnaceType: 'Electric Arc Furnace (EAF)' };
const METRIC_EAF: Settings = { ...METRIC_ELEC, furnaceType: 'Electric Arc Furnace (EAF)' };

function fuelData(): PhastCo2SavingsData {
  return {
    energyType: 'fuel',
    totalEmissionOutputRate: 200,
    totalFuelEmissionOutputRate: 53.06,
    electricityUse: 0,
    totalEmissionOutput: 0,
  };
}

function electricityData(): PhastCo2SavingsData {
  return {
    energyType: 'electricity',
    totalEmissionOutputRate: 200,
    totalFuelEmissionOutputRate: 53.06,
    electricityUse: 0,
    totalEmissionOutput: 0,
  };
}

function eafData(): PhastCo2SavingsData {
  return {
    ...electricityData(),
    totalNaturalGasEmissionOutputRate: 53.06,
    totalCoalEmissionOutputRate: 90.0,
    totalOtherEmissionOutputRate: 70.0,
  };
}

describe('ConvertPhastService.convertCO2SavingsData', () => {
  let service: ConvertPhastService;
  let cs: ConvertUnitsService;

  beforeEach(() => {
    cs = new ConvertUnitsService();
    service = new ConvertPhastService(cs);
  });

  describe('fuel energy source', () => {
    it('converts totalFuelEmissionOutputRate from per-MMBtu to per-GJ (Imperial → Metric)', () => {
      const data = fuelData();
      const gjPerMmbtu = cs.value(1).from('MMBtu').to('GJ');
      const expected = data.totalFuelEmissionOutputRate / gjPerMmbtu;

      service.convertCO2SavingsData(data, IMPERIAL, METRIC);

      expect(data.totalFuelEmissionOutputRate).toBeCloseTo(expected, 4);
    });

    it('converts totalFuelEmissionOutputRate from per-GJ to per-MMBtu (Metric → Imperial)', () => {
      const data = fuelData();
      const mmbtuPerGj = cs.value(1).from('GJ').to('MMBtu');
      const expected = data.totalFuelEmissionOutputRate / mmbtuPerGj;

      service.convertCO2SavingsData(data, METRIC, IMPERIAL);

      expect(data.totalFuelEmissionOutputRate).toBeCloseTo(expected, 4);
    });

    it('does not change totalEmissionOutputRate for fuel source', () => {
      const data = fuelData();
      const originalRate = data.totalEmissionOutputRate;

      service.convertCO2SavingsData(data, IMPERIAL, METRIC);

      expect(data.totalEmissionOutputRate).toBe(originalRate);
    });

    it('round-trips Imperial → Metric → Imperial to recover the original rate', () => {
      const data = fuelData();
      const original = data.totalFuelEmissionOutputRate;

      service.convertCO2SavingsData(data, IMPERIAL, METRIC);
      service.convertCO2SavingsData(data, METRIC, IMPERIAL);

      expect(data.totalFuelEmissionOutputRate).toBeCloseTo(original, 3);
    });
  });

  describe('electricity energy source (non-EAF)', () => {
    it('converts totalFuelEmissionOutputRate per-MMBtu → per-GJ (Imperial → Metric)', () => {
      const data = electricityData();
      const gjPerMmbtu = cs.value(1).from('MMBtu').to('GJ');
      const expectedFuelRate = data.totalFuelEmissionOutputRate / gjPerMmbtu;

      service.convertCO2SavingsData(data, IMPERIAL_ELEC, METRIC_ELEC);

      expect(data.totalFuelEmissionOutputRate).toBeCloseTo(expectedFuelRate, 4);
    });

    it('scales totalEmissionOutputRate by the energy result unit conversion (Imperial → Metric)', () => {
      const data = electricityData();
      const conversionHelper = cs.value(1).from('MMBtu').to('GJ');
      const expected = data.totalEmissionOutputRate / conversionHelper;

      service.convertCO2SavingsData(data, IMPERIAL_ELEC, METRIC_ELEC);

      expect(data.totalEmissionOutputRate).toBeCloseTo(expected, 2);
    });

    it('round-trips totalEmissionOutputRate Imperial → Metric → Imperial', () => {
      const data = electricityData();
      const original = data.totalEmissionOutputRate;

      service.convertCO2SavingsData(data, IMPERIAL_ELEC, METRIC_ELEC);
      service.convertCO2SavingsData(data, METRIC_ELEC, IMPERIAL_ELEC);

      expect(data.totalEmissionOutputRate).toBeCloseTo(original, 1);
    });
  });

  describe('electricity energy source — EAF', () => {
    it('converts all EAF fuel rates per-MMBtu → per-GJ (Imperial → Metric)', () => {
      const data = eafData();
      const gjPerMmbtu = cs.value(1).from('MMBtu').to('GJ');

      service.convertCO2SavingsData(data, IMPERIAL_EAF, METRIC_EAF);

      expect(data.totalNaturalGasEmissionOutputRate).toBeCloseTo(53.06 / gjPerMmbtu, 4);
      expect(data.totalCoalEmissionOutputRate).toBeCloseTo(90.0 / gjPerMmbtu, 4);
      expect(data.totalOtherEmissionOutputRate).toBeCloseTo(70.0 / gjPerMmbtu, 4);
    });

    it('does not convert EAF rates when energySourceType is Fuel (not Electricity)', () => {
      const data = eafData();
      const originalNaturalGas = data.totalNaturalGasEmissionOutputRate;

      service.convertCO2SavingsData(data, IMPERIAL, METRIC);

      expect(data.totalNaturalGasEmissionOutputRate).toBe(originalNaturalGas);
    });
  });
});

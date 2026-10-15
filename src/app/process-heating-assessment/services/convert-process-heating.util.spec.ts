import { cloneDeep } from 'lodash';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { LegacyModification, ProcessHeatingModification } from '../models/modification';
import { convertProcessHeatingEnergyUnit, convertProcessHeatingUnits } from './convert-process-heating.util';

describe('convertProcessHeatingUnits', () => {
  const imperial = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu' } as Settings;
  const metric = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' } as Settings;

  function buildPhast(): PHAST {
    return {
      losses: {
        wallLosses: [{ id: 'wall-1', ambientTemperature: 212, surfaceTemperature: 392, surfaceArea: 100, windVelocity: 10 }],
        chargeMaterials: [
          { id: 'solid-1', chargeMaterialType: 'Solid', solidChargeMaterial: { specificHeatSolid: 0.3, meltingPoint: 2500, initialTemperature: 100, chargeFeedRate: 1000 } },
          { id: 'gas-1', chargeMaterialType: 'Gas', gasChargeMaterial: { specificHeatGas: 0.24, specificHeatVapor: 0.45, feedRate: 50 } },
        ],
        coolingLosses: [
          { id: 'air-1', coolingLossType: 'Other Gas', gasCoolingLoss: { initialTemperature: 70, finalTemperature: 212, outletTemperature: 212, flowRate: 100, gasDensity: 0.074887 } },
          { id: 'water-1', coolingLossType: 'Other Liquid', liquidCoolingLoss: { initialTemperature: 70, outletTemperature: 100, flowRate: 10, density: 8.338 } },
        ],
        flueGasLosses: [{ id: 'flue-1', flueGasType: 'By Volume', flueGasByVolume: { flueGasTemperature: 1400, ambientAirTemp: 70 } }],
        fixtureLosses: [{ id: 'fixture-1', specificHeat: 0.12, latentHeat: 100, meltingPoint: 1800, initialTemperature: 70 }],
        otherLosses: [{ id: 'other-1', heatLoss: 12.5 }],
      },
      operatingCosts: { fuelCost: 5, coalCarbonCost: 1, electrodeCost: 2, otherFuelCost: 4, electricityCost: 0.08 },
      co2SavingsData: { energyType: 'fuel', totalEmissionOutputRate: 400, totalFuelEmissionOutputRate: 53.06, electricityUse: 0, totalEmissionOutput: 0 },
      meteredEnergy: { meteredEnergyFuel: { heatingValue: 1000, fuelEnergy: 4.5, fuelFlowRateInput: 4479 } as never },
      designedEnergy: { fuel: true, zones: [{ name: 'Zone', designedEnergyFuel: { totalBurnerCapacity: 10 } } as never] },
    };
  }

  it('returns the same reference when the unit system is unchanged', () => {
    const phast = buildPhast();

    expect(convertProcessHeatingUnits(phast, imperial, imperial)).toBe(phast);
  });

  it('returns the same reference for an unsupported unit system', () => {
    const phast = buildPhast();

    expect(convertProcessHeatingUnits(phast, imperial, { ...metric, unitsOfMeasure: 'Custom' })).toBe(phast);
  });

  it('does not mutate its input', () => {
    const phast = buildPhast();
    const snapshot = cloneDeep(phast);

    convertProcessHeatingUnits(phast, imperial, metric);

    expect(phast).toEqual(snapshot);
  });

  it('handles an assessment with no optional branches', () => {
    expect(() => convertProcessHeatingUnits({}, imperial, metric)).not.toThrow();
    expect(convertProcessHeatingUnits({}, imperial, metric).lossDataUnits).toBe('Metric');
  });

  it('converts and rounds ordinary loss fields to 4 decimals', () => {
    const wall = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.wallLosses[0];

    expect(wall.ambientTemperature).toBe(100);
    expect(wall.surfaceTemperature).toBe(200);
    expect(wall.surfaceArea).toBe(9.2903);
    expect(wall.windVelocity).toBe(16.0934);
  });

  it('leaves empty fields empty instead of converting them to 0, and keeps a genuine 0 as 0', () => {
    const phast: PHAST = {
      losses: {
        wallLosses: [{ id: 'wall-1', ambientTemperature: null, surfaceTemperature: undefined, surfaceArea: 0, windVelocity: '' as never }],
      },
      operatingCosts: { coalCarbonCost: null, otherFuelCost: undefined, electrodeCost: 0 } as never,
    };

    const converted = convertProcessHeatingUnits(phast, imperial, metric);
    const wall = converted.losses.wallLosses[0];

    expect(wall.ambientTemperature).toBeNull();
    expect(wall.surfaceTemperature).toBeUndefined();
    expect(wall.windVelocity).toBe('' as never);
    expect(wall.surfaceArea).toBe(0);
    expect(converted.operatingCosts.coalCarbonCost).toBeNull();
    expect(converted.operatingCosts.otherFuelCost).toBeUndefined();
    expect(converted.operatingCosts.electrodeCost).toBe(0);
  });

  it('leaves material-DB-linked fields unrounded and rounds the rest of the same material', () => {
    const solid = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.chargeMaterials[0].solidChargeMaterial;

    expect(solid.specificHeatSolid).toBe(new ConvertValue(0.3, 'btulbF', 'kJkgC').convertedValue);
    expect(solid.meltingPoint).toBe(new ConvertValue(2500, 'F', 'C').convertedValue);
    expect(solid.initialTemperature).toBe(37.7778);
    expect(solid.chargeFeedRate).toBe(453.592);
  });

  it('converts a gas charge material with exact DB specific heat and rounded vapor specific heat', () => {
    const gas = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.chargeMaterials[1].gasChargeMaterial;

    expect(gas.specificHeatGas).toBe(new ConvertValue(0.24, 'btulbF', 'kJkgC').convertedValue);
    expect(gas.specificHeatVapor).toBe(Number(new ConvertValue(0.45, 'btulbF', 'kJkgC').convertedValue.toFixed(4)));
  });

  it('converts fixture hidden material fields exactly', () => {
    const fixture = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.fixtureLosses[0];

    expect(fixture.latentHeat).toBe(new ConvertValue(100, 'btuLb', 'kJkg').convertedValue);
    expect(fixture.meltingPoint).toBe(new ConvertValue(1800, 'F', 'C').convertedValue);
    expect(fixture.specificHeatLiquid).toBeUndefined();
  });

  it('converts Other Gas and Other Liquid cooling losses, including the mirrored gas outlet temperature', () => {
    const [gasLoss, liquidLoss] = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.coolingLosses;

    expect(gasLoss.gasCoolingLoss.finalTemperature).toBe(100);
    expect(gasLoss.gasCoolingLoss.outletTemperature).toBe(100);
    expect(gasLoss.gasCoolingLoss.initialTemperature).toBe(21.1111);
    expect(liquidLoss.liquidCoolingLoss.outletTemperature).toBe(37.7778);
  });

  it('converts flue gas by volume temperatures', () => {
    const flueGas = convertProcessHeatingUnits(buildPhast(), imperial, metric).losses.flueGasLosses[0].flueGasByVolume;

    expect(flueGas.flueGasTemperature).toBe(760);
    expect(flueGas.ambientAirTemp).toBe(21.1111);
  });

  it('does not touch Other heatLoss or fuel cost (those follow energyResultUnit)', () => {
    const converted = convertProcessHeatingUnits(buildPhast(), imperial, metric);

    expect(converted.losses.otherLosses[0].heatLoss).toBe(12.5);
    expect(converted.operatingCosts.fuelCost).toBe(5);
    expect(converted.operatingCosts.electricityCost).toBe(0.08);
  });

  it('converts per-unit costs by the reciprocal of the quantity conversion', () => {
    const costs = convertProcessHeatingUnits(buildPhast(), imperial, metric).operatingCosts;

    expect(costs.coalCarbonCost).toBeCloseTo(2.2046, 3);
    expect(costs.electrodeCost).toBeCloseTo(4.4092, 3);
    expect(costs.otherFuelCost).toBeCloseTo(3.7913, 3);
  });

  it('converts emission rates per energy unit and leaves the electricity rate alone', () => {
    const co2 = convertProcessHeatingUnits(buildPhast(), imperial, metric).co2SavingsData;

    expect(co2.totalFuelEmissionOutputRate).toBeCloseTo(53.06 / 1.055056, 3);
    expect(co2.totalEmissionOutputRate).toBe(400);
  });

  it('converts metered and designed energy', () => {
    const converted = convertProcessHeatingUnits(buildPhast(), imperial, metric);

    expect(converted.meteredEnergy.meteredEnergyFuel.heatingValue).toBe(2326);
    expect(converted.meteredEnergy.meteredEnergyFuel.fuelFlowRateInput).toBe(126.8311);
    expect(converted.designedEnergy.zones[0].designedEnergyFuel.totalBurnerCapacity).toBe(10.5506);
  });

  it('converts every modification scenarioOverrides and skips modifications without any', () => {
    const baseline = buildPhast();
    const withOverrides: ProcessHeatingModification = {
      id: 'mod-1',
      scenarioOverrides: { losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }] }, operatingCosts: { coalCarbonCost: 1 } },
    };
    const withoutOverrides: ProcessHeatingModification = { id: 'mod-2' };

    const converted = convertProcessHeatingUnits({ ...baseline, modifications: [withOverrides, withoutOverrides] }, imperial, metric);
    const [first, second] = converted.modifications as ProcessHeatingModification[];

    expect(first.scenarioOverrides.losses.wallLosses[0].ambientTemperature).toBe(100);
    expect(first.scenarioOverrides.operatingCosts.coalCarbonCost).toBeCloseTo(2.2046, 3);
    expect(second).toBe(withoutOverrides);
  });

  it('converts a migrated legacy modification phast alongside its scenarioOverrides and round-trips it', () => {
    const legacy: LegacyModification = {
      id: 'mod-1',
      scenarioOverrides: { losses: { wallLosses: [{ id: 'wall-1', ambientTemperature: 212 }] } },
      phast: buildPhast(),
    };

    const converted = convertProcessHeatingUnits({ ...buildPhast(), modifications: [legacy] }, imperial, metric);
    const [modification] = converted.modifications as LegacyModification[];
    const roundTrip = convertProcessHeatingUnits(converted, metric, imperial).modifications[0] as LegacyModification;

    expect(modification.scenarioOverrides.losses.wallLosses[0].ambientTemperature).toBe(100);
    expect(modification.phast.losses.wallLosses[0].ambientTemperature).toBe(100);
    expect(modification.phast.operatingCosts.coalCarbonCost).toBeCloseTo(2.2046, 3);
    expect(roundTrip.phast.losses.wallLosses[0].ambientTemperature).toBeCloseTo(212, 3);
    expect(roundTrip.phast.operatingCosts.coalCarbonCost).toBeCloseTo(1, 3);
  });

  it('round-trips Imperial to Metric and back without drift', () => {
    const original = buildPhast();

    const roundTrip = convertProcessHeatingUnits(convertProcessHeatingUnits(original, imperial, metric), metric, imperial);

    expect(roundTrip.losses.chargeMaterials[0].solidChargeMaterial.specificHeatSolid).toBeCloseTo(0.3, 12);
    expect(roundTrip.losses.fixtureLosses[0].meltingPoint).toBeCloseTo(1800, 9);
    expect(roundTrip.losses.wallLosses[0].surfaceArea).toBeCloseTo(100, 3);
    expect(roundTrip.losses.wallLosses[0].ambientTemperature).toBeCloseTo(212, 3);
    expect(roundTrip.operatingCosts.coalCarbonCost).toBeCloseTo(1, 3);
    expect(roundTrip.lossDataUnits).toBe('Imperial');
  });
});

describe('convertProcessHeatingEnergyUnit', () => {
  const mmbtu = { unitsOfMeasure: 'Imperial', energyResultUnit: 'MMBtu' } as Settings;
  const gigajoule = { unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' } as Settings;
  const kilowattHour = { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings;

  function buildPhast(): PHAST {
    return {
      losses: {
        otherLosses: [{ id: 'other-1', heatLoss: 10 }],
        wallLosses: [{ id: 'wall-1', ambientTemperature: 70 }],
      },
      operatingCosts: { fuelCost: 5, steamCost: 4, coalCarbonCost: 1, electricityCost: 0.08 },
    };
  }

  it('returns the same reference when energyResultUnit is unchanged', () => {
    const phast = buildPhast();

    expect(convertProcessHeatingEnergyUnit(phast, mmbtu, mmbtu)).toBe(phast);
    expect(convertProcessHeatingEnergyUnit(phast, kilowattHour, { ...kilowattHour, unitsOfMeasure: 'Metric' })).toBe(phast);
  });

  it('converts Other heatLoss by the energy ratio', () => {
    const converted = convertProcessHeatingEnergyUnit(buildPhast(), mmbtu, gigajoule);

    expect(converted.losses.otherLosses[0].heatLoss).toBe(10.5506);
    expect(converted.losses.wallLosses[0].ambientTemperature).toBe(70);
  });

  it('converts fuel and steam cost by the reciprocal of the energy ratio', () => {
    const costs = convertProcessHeatingEnergyUnit(buildPhast(), mmbtu, gigajoule).operatingCosts;

    expect(costs.fuelCost).toBeCloseTo(5 / 1.055056, 3);
    expect(costs.steamCost).toBeCloseTo(4 / 1.055056, 3);
    expect(costs.coalCarbonCost).toBe(1);
    expect(costs.electricityCost).toBe(0.08);
  });

  it('converts modification scenarioOverrides', () => {
    const modification: ProcessHeatingModification = {
      id: 'mod-1',
      scenarioOverrides: { losses: { otherLosses: [{ id: 'other-1', heatLoss: 10 }] }, operatingCosts: { fuelCost: 5 } },
    };

    const converted = convertProcessHeatingEnergyUnit({ ...buildPhast(), modifications: [modification] }, mmbtu, gigajoule);
    const [convertedModification] = converted.modifications as ProcessHeatingModification[];

    expect(convertedModification.scenarioOverrides.losses.otherLosses[0].heatLoss).toBe(10.5506);
    expect(convertedModification.scenarioOverrides.operatingCosts.fuelCost).toBeCloseTo(5 / 1.055056, 3);
  });

  it('leaves empty Other heatLoss and costs empty instead of converting them to 0', () => {
    const phast: PHAST = {
      losses: { otherLosses: [{ id: 'other-1', heatLoss: null }, { id: 'other-2', heatLoss: undefined }, { id: 'other-3', heatLoss: 0 }] },
      operatingCosts: { fuelCost: null, steamCost: undefined } as never,
    };

    const converted = convertProcessHeatingEnergyUnit(phast, mmbtu, gigajoule);

    expect(converted.losses.otherLosses.map(loss => loss.heatLoss)).toEqual([null, undefined, 0]);
    expect(converted.operatingCosts.fuelCost).toBeNull();
    expect(converted.operatingCosts.steamCost).toBeUndefined();
  });

  it('does not mutate its input and tolerates missing branches', () => {
    const phast = buildPhast();
    const snapshot = cloneDeep(phast);

    convertProcessHeatingEnergyUnit(phast, mmbtu, gigajoule);

    expect(phast).toEqual(snapshot);
    expect(() => convertProcessHeatingEnergyUnit({}, mmbtu, gigajoule)).not.toThrow();
  });
});

import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { Settings } from '../../shared/models/settings';
import { OperatingCosts } from '../../shared/models/operations';
import { AtmosphereLoss } from '../../shared/models/phast/losses/atmosphereLoss';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../shared/models/phast/losses/chargeMaterial';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss } from '../../shared/models/phast/losses/coolingLoss';
import { EnergyInputEAF } from '../../shared/models/phast/losses/energyInputEAF';
import { EnergyInputExhaustGasLoss } from '../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { ExhaustGasEAF } from '../../shared/models/phast/losses/exhaustGasEAF';
import { ExtendedSurface } from '../../shared/models/phast/losses/extendedSurface';
import { FixtureLoss } from '../../shared/models/phast/losses/fixtureLoss';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../shared/models/phast/losses/flueGas';
import { LeakageLoss } from '../../shared/models/phast/losses/leakageLoss';
import { OpeningLoss } from '../../shared/models/phast/losses/openingLoss';
import { OtherLoss } from '../../shared/models/phast/losses/otherLoss';
import { Slag } from '../../shared/models/phast/losses/slag';
import { WallLoss } from '../../shared/models/phast/losses/wallLoss';
import { DesignedEnergy } from '../../shared/models/phast/designedEnergy';
import { MeteredEnergy } from '../../shared/models/phast/meteredEnergy';
import { Losses, PHAST, PhastCo2SavingsData } from '../models/phast';
import { LegacyModification, ProcessHeatingModification, ScenarioOverrides } from '../models/modification';
import { UnitConversion } from '../models/unit-conversion';
import { ATMOSPHERE_UNITS } from '../heat-balance/losses/atmosphere/atmosphere-units';
import { CHARGE_MATERIAL_UNITS } from '../heat-balance/losses/charge-material/charge-material-units';

/**
 * - `exact`: skip the 4-decimal rounding. Material-DB-linked fields must stay exact because the
 *   form's "Differs from database" check (`differsFromDb`, 1e-6 tolerance) compares them against an
 *   unrounded `convertDbValue`; rounding here would falsely flag them after a unit switch.
 * - `inverse`: the field is a cost or rate *per* unit, so it scales by the reciprocal of the
 *   quantity conversion ($/lb to $/kg multiplies by lb-per-kg).
 */
interface FieldConversion {
  units: UnitConversion;
  exact?: boolean;
  inverse?: boolean;
}

type FieldMap<T> = Partial<Record<keyof T, FieldConversion>>;
type ConversionDirection = 'toMetric' | 'toImperial';
type ScenarioConverter = (scenario: ScenarioOverrides) => ScenarioOverrides;

const ROUNDING_DIGITS = 4;

const TEMPERATURE: FieldConversion = { units: CHARGE_MATERIAL_UNITS.temperature };
const SPECIFIC_HEAT: FieldConversion = { units: CHARGE_MATERIAL_UNITS.specificHeat };
const ENERGY_PER_MASS: FieldConversion = { units: CHARGE_MATERIAL_UNITS.latentHeat };
const MASS: FieldConversion = { units: { imperial: 'lb', metric: 'kg' } };
const ENERGY: FieldConversion = { units: { imperial: 'Btu', metric: 'kJ' } };
const ENERGY_RATE: FieldConversion = { units: { imperial: 'MMBtu', metric: 'GJ' } };
const AREA: FieldConversion = { units: { imperial: 'ft2', metric: 'm2' } };
const VOLUME: FieldConversion = { units: { imperial: 'ft3', metric: 'm3' } };
const VOLUME_PER_HOUR: FieldConversion = { units: { imperial: 'ft3/h', metric: 'm3/h' } };
const GAS_DENSITY: FieldConversion = { units: { imperial: 'lbscf', metric: 'kgNm3' } };
const LIQUID_DENSITY: FieldConversion = { units: { imperial: 'lbgal', metric: 'kgL' } };
const LIQUID_VOLUME: FieldConversion = { units: { imperial: 'gal', metric: 'L' } };
const PRESSURE: FieldConversion = { units: { imperial: 'inH2o', metric: 'Pa' } };
const SMALL_LENGTH: FieldConversion = { units: { imperial: 'in', metric: 'mm' } };
const VELOCITY: FieldConversion = { units: { imperial: 'mph', metric: 'km/h' } };

const exact = (field: FieldConversion): FieldConversion => ({ ...field, exact: true });
const inverse = (field: FieldConversion): FieldConversion => ({ ...field, inverse: true });

const SOLID_CHARGE_FIELDS: FieldMap<SolidChargeMaterial> = {
  meltingPoint: exact(TEMPERATURE),
  initialTemperature: TEMPERATURE,
  dischargeTemperature: TEMPERATURE,
  waterVaporDischargeTemperature: TEMPERATURE,
  chargeFeedRate: MASS,
  reactionHeat: ENERGY_PER_MASS,
  additionalHeat: ENERGY,
  specificHeatLiquid: exact(SPECIFIC_HEAT),
  specificHeatSolid: exact(SPECIFIC_HEAT),
  latentHeat: exact(ENERGY_PER_MASS),
};

const LIQUID_CHARGE_FIELDS: FieldMap<LiquidChargeMaterial> = {
  vaporizingTemperature: exact(TEMPERATURE),
  latentHeat: exact(ENERGY_PER_MASS),
  initialTemperature: TEMPERATURE,
  dischargeTemperature: TEMPERATURE,
  chargeFeedRate: MASS,
  reactionHeat: ENERGY_PER_MASS,
  additionalHeat: ENERGY,
  specificHeatLiquid: exact(SPECIFIC_HEAT),
  specificHeatVapor: exact(SPECIFIC_HEAT),
};

const GAS_CHARGE_FIELDS: FieldMap<GasChargeMaterial> = {
  initialTemperature: TEMPERATURE,
  dischargeTemperature: TEMPERATURE,
  feedRate: MASS,
  reactionHeat: ENERGY_PER_MASS,
  additionalHeat: ENERGY,
  specificHeatVapor: SPECIFIC_HEAT,
  specificHeatGas: exact(SPECIFIC_HEAT),
};

const GAS_COOLING_FIELDS: FieldMap<GasCoolingLoss> = {
  specificHeat: SPECIFIC_HEAT,
  flowRate: VOLUME,
  initialTemperature: TEMPERATURE,
  finalTemperature: TEMPERATURE,
  outletTemperature: TEMPERATURE,
  gasDensity: GAS_DENSITY,
};

const LIQUID_COOLING_FIELDS: FieldMap<LiquidCoolingLoss> = {
  specificHeat: SPECIFIC_HEAT,
  density: LIQUID_DENSITY,
  flowRate: LIQUID_VOLUME,
  initialTemperature: TEMPERATURE,
  outletTemperature: TEMPERATURE,
  finalTemperature: TEMPERATURE,
};

const FLUE_GAS_BY_MASS_FIELDS: FieldMap<FlueGasByMass> = {
  combustionAirTemperature: TEMPERATURE,
  flueGasTemperature: TEMPERATURE,
  ambientAirTemp: TEMPERATURE,
  ashDischargeTemperature: TEMPERATURE,
  fuelTemperature: TEMPERATURE,
};

const FLUE_GAS_BY_VOLUME_FIELDS: FieldMap<FlueGasByVolume> = {
  combustionAirTemperature: TEMPERATURE,
  flueGasTemperature: TEMPERATURE,
  ambientAirTemp: TEMPERATURE,
  fuelTemperature: TEMPERATURE,
};

const ATMOSPHERE_FIELDS: FieldMap<AtmosphereLoss> = {
  inletTemperature: TEMPERATURE,
  outletTemperature: TEMPERATURE,
  flowRate: VOLUME_PER_HOUR,
  specificHeat: exact({ units: ATMOSPHERE_UNITS.specificHeat }),
};

const ENERGY_INPUT_EAF_FIELDS: FieldMap<EnergyInputEAF> = {
  naturalGasHeatInput: ENERGY_RATE,
  otherFuels: ENERGY_RATE,
  coalCarbonInjection: MASS,
  coalHeatingValue: ENERGY_PER_MASS,
  electrodeHeatingValue: ENERGY_PER_MASS,
  electrodeUse: MASS,
  flowRateInput: VOLUME,
};

const EXHAUST_GAS_EAF_FIELDS: FieldMap<ExhaustGasEAF> = {
  offGasTemp: TEMPERATURE,
  vfr: VOLUME,
  dustLoading: GAS_DENSITY,
};

const ENERGY_INPUT_EXHAUST_GAS_FIELDS: FieldMap<EnergyInputExhaustGasLoss> = {
  combustionAirTemp: TEMPERATURE,
  exhaustGasTemp: TEMPERATURE,
  totalHeatInput: ENERGY_RATE,
};

const EXTENDED_SURFACE_FIELDS: FieldMap<ExtendedSurface> = {
  ambientTemperature: TEMPERATURE,
  surfaceTemperature: TEMPERATURE,
  surfaceArea: AREA,
};

const FIXTURE_FIELDS: FieldMap<FixtureLoss> = {
  initialTemperature: TEMPERATURE,
  finalTemperature: TEMPERATURE,
  specificHeat: exact(SPECIFIC_HEAT),
  feedRate: MASS,
  latentHeat: exact(ENERGY_PER_MASS),
  meltingPoint: exact(TEMPERATURE),
  specificHeatLiquid: exact(SPECIFIC_HEAT),
};

const LEAKAGE_FIELDS: FieldMap<LeakageLoss> = {
  draftPressure: PRESSURE,
  openingArea: AREA,
  ambientTemperature: TEMPERATURE,
  leakageGasTemperature: TEMPERATURE,
};

const OPENING_FIELDS: FieldMap<OpeningLoss> = {
  ambientTemperature: TEMPERATURE,
  insideTemperature: TEMPERATURE,
  thickness: SMALL_LENGTH,
  heightOfOpening: SMALL_LENGTH,
  lengthOfOpening: SMALL_LENGTH,
};

const SLAG_FIELDS: FieldMap<Slag> = {
  weight: MASS,
  inletTemperature: TEMPERATURE,
  outletTemperature: TEMPERATURE,
  specificHeat: SPECIFIC_HEAT,
};

const WALL_FIELDS: FieldMap<WallLoss> = {
  ambientTemperature: TEMPERATURE,
  surfaceTemperature: TEMPERATURE,
  windVelocity: VELOCITY,
  surfaceArea: AREA,
};

// fuelCost and steamCost are billed per MMBtu or GJ by unit system, independent of `energyResultUnit`.
const OPERATING_COST_FIELDS: FieldMap<OperatingCosts> = {
  fuelCost: inverse(exact(ENERGY_RATE)),
  steamCost: inverse(exact(ENERGY_RATE)),
  coalCarbonCost: inverse(MASS),
  electrodeCost: inverse(MASS),
  otherFuelCost: inverse(ENERGY_RATE),
};

const CO2_FIELDS: FieldMap<PhastCo2SavingsData> = {
  totalFuelEmissionOutputRate: inverse(ENERGY_RATE),
  totalNaturalGasEmissionOutputRate: inverse(ENERGY_RATE),
  totalCoalEmissionOutputRate: inverse(ENERGY_RATE),
  totalOtherEmissionOutputRate: inverse(ENERGY_RATE),
};

const roundTo = (value: number, digits: number): number => Number(value.toFixed(digits));

function convertQuantity(value: number, units: UnitConversion, direction: ConversionDirection): number {
  const [from, to] = direction === 'toMetric' ? [units.imperial, units.metric] : [units.metric, units.imperial];
  return new ConvertValue(value, from, to).convertedValue;
}

function convertFields<T extends object>(source: T | undefined, fields: FieldMap<T>, direction: ConversionDirection): T | undefined {
  if (!source) {
    return source;
  }
  const converted = { ...source };
  (Object.keys(fields) as (keyof T)[]).forEach(key => {
    const value = source[key];
    const field = fields[key];
    if (typeof value !== 'number' || !field) {
      return;
    }
    const result = field.inverse
      ? value / convertQuantity(1, field.units, direction)
      : convertQuantity(value, field.units, direction);
    converted[key] = (field.exact ? result : roundTo(result, ROUNDING_DIGITS)) as T[keyof T];
  });
  return converted;
}

function convertList<T extends object>(items: T[] | undefined, fields: FieldMap<T>, direction: ConversionDirection): T[] | undefined {
  return items?.map(item => convertFields(item, fields, direction));
}

function convertChargeMaterial(loss: ChargeMaterial, direction: ConversionDirection): ChargeMaterial {
  return {
    ...loss,
    ...(loss.solidChargeMaterial && { solidChargeMaterial: convertFields(loss.solidChargeMaterial, SOLID_CHARGE_FIELDS, direction) }),
    ...(loss.liquidChargeMaterial && { liquidChargeMaterial: convertFields(loss.liquidChargeMaterial, LIQUID_CHARGE_FIELDS, direction) }),
    ...(loss.gasChargeMaterial && { gasChargeMaterial: convertFields(loss.gasChargeMaterial, GAS_CHARGE_FIELDS, direction) }),
  };
}

// Keyed on which sub-object exists rather than `coolingLossType`, so 'Other Gas' / 'Other Liquid' convert too.
function convertCoolingLoss(loss: CoolingLoss, direction: ConversionDirection): CoolingLoss {
  return {
    ...loss,
    ...(loss.gasCoolingLoss && { gasCoolingLoss: convertFields(loss.gasCoolingLoss, GAS_COOLING_FIELDS, direction) }),
    ...(loss.liquidCoolingLoss && { liquidCoolingLoss: convertFields(loss.liquidCoolingLoss, LIQUID_COOLING_FIELDS, direction) }),
  };
}

function convertFlueGas(loss: FlueGas, direction: ConversionDirection): FlueGas {
  return {
    ...loss,
    ...(loss.flueGasByMass && { flueGasByMass: convertFields(loss.flueGasByMass, FLUE_GAS_BY_MASS_FIELDS, direction) }),
    ...(loss.flueGasByVolume && { flueGasByVolume: convertFields(loss.flueGasByVolume, FLUE_GAS_BY_VOLUME_FIELDS, direction) }),
  };
}

function convertLosses(losses: Losses, direction: ConversionDirection): Losses {
  const converted: Losses = { ...losses };
  const assign = <K extends keyof Losses>(key: K, value: Losses[K]): void => {
    if (value) {
      converted[key] = value;
    }
  };
  assign('atmosphereLosses', convertList(losses.atmosphereLosses, ATMOSPHERE_FIELDS, direction));
  assign('chargeMaterials', losses.chargeMaterials?.map(loss => convertChargeMaterial(loss, direction)));
  assign('coolingLosses', losses.coolingLosses?.map(loss => convertCoolingLoss(loss, direction)));
  assign('energyInputEAF', convertList(losses.energyInputEAF, ENERGY_INPUT_EAF_FIELDS, direction));
  assign('exhaustGasEAF', convertList(losses.exhaustGasEAF, EXHAUST_GAS_EAF_FIELDS, direction));
  assign('energyInputExhaustGasLoss', convertList(losses.energyInputExhaustGasLoss, ENERGY_INPUT_EXHAUST_GAS_FIELDS, direction));
  assign('extendedSurfaces', convertList(losses.extendedSurfaces, EXTENDED_SURFACE_FIELDS, direction));
  assign('fixtureLosses', convertList(losses.fixtureLosses, FIXTURE_FIELDS, direction));
  assign('flueGasLosses', losses.flueGasLosses?.map(loss => convertFlueGas(loss, direction)));
  assign('leakageLosses', convertList(losses.leakageLosses, LEAKAGE_FIELDS, direction));
  assign('openingLosses', convertList(losses.openingLosses, OPENING_FIELDS, direction));
  assign('slagLosses', convertList(losses.slagLosses, SLAG_FIELDS, direction));
  assign('wallLosses', convertList(losses.wallLosses, WALL_FIELDS, direction));
  return converted;
}

function convertMeteredEnergy(metered: MeteredEnergy, direction: ConversionDirection): MeteredEnergy {
  const fuel = metered.meteredEnergyFuel;
  const steam = metered.meteredEnergySteam;
  return {
    ...metered,
    ...(fuel && {
      meteredEnergyFuel: convertFields(fuel, {
        heatingValue: ENERGY_PER_MASS,
        fuelEnergy: ENERGY,
        fuelFlowRateInput: VOLUME,
      }, direction),
    }),
    ...(steam && {
      meteredEnergySteam: convertFields(steam, {
        totalHeatSteam: ENERGY_PER_MASS,
        flowRate: MASS,
      }, direction),
    }),
  };
}

function convertDesignedEnergy(designed: DesignedEnergy, direction: ConversionDirection): DesignedEnergy {
  return {
    ...designed,
    zones: designed.zones?.map(zone => ({
      ...zone,
      ...(zone.designedEnergyFuel && {
        designedEnergyFuel: convertFields(zone.designedEnergyFuel, { totalBurnerCapacity: ENERGY_RATE }, direction),
      }),
      ...(zone.designedEnergySteam && {
        designedEnergySteam: convertFields(zone.designedEnergySteam, { totalHeat: ENERGY_PER_MASS, steamFlow: MASS }, direction),
      }),
    })),
  };
}

function convertScenarioUnits(scenario: ScenarioOverrides, direction: ConversionDirection): ScenarioOverrides {
  const converted: ScenarioOverrides = {};
  if (scenario.losses) {
    converted.losses = convertLosses(scenario.losses, direction);
  }
  if (scenario.operatingCosts) {
    converted.operatingCosts = convertFields(scenario.operatingCosts, OPERATING_COST_FIELDS, direction);
  }
  if (scenario.co2SavingsData) {
    converted.co2SavingsData = convertFields(scenario.co2SavingsData, CO2_FIELDS, direction);
  }
  if (scenario.meteredEnergy) {
    converted.meteredEnergy = convertMeteredEnergy(scenario.meteredEnergy, direction);
  }
  if (scenario.designedEnergy) {
    converted.designedEnergy = convertDesignedEnergy(scenario.designedEnergy, direction);
  }
  return converted;
}

/**
 * Legacy reads a migrated modification's full-clone `phast`, so it is converted alongside
 * `scenarioOverrides` to stay in the same units as baseline.
 */
function convertModification(modification: LegacyModification, convert: ScenarioConverter): ProcessHeatingModification {
  if (!modification.scenarioOverrides && !modification.phast) {
    return modification;
  }
  return {
    ...modification,
    ...(modification.scenarioOverrides && { scenarioOverrides: { ...modification.scenarioOverrides, ...convert(modification.scenarioOverrides) } }),
    ...(modification.phast && { phast: { ...modification.phast, ...convert(modification.phast) } }),
  };
}

/** Applies `convert` to baseline and to each modification's `scenarioOverrides` and legacy `phast`. */
function convertAllScenarios(phast: PHAST, convert: ScenarioConverter): PHAST {
  const modifications = phast.modifications as LegacyModification[] | undefined;
  return {
    ...phast,
    ...convert(phast),
    ...(modifications && {
      modifications: modifications.map(modification => convertModification(modification, convert)),
    }),
  };
}

function getDirection(oldSettings: Settings, newSettings: Settings): ConversionDirection | undefined {
  if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
    return 'toMetric';
  }
  if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
    return 'toImperial';
  }
  return undefined;
}

/**
 * Converts every stored value that is tied to the Imperial/Metric unit system, on baseline and in
 * every modification's `scenarioOverrides` and legacy `phast`. Values tied to `energyResultUnit` are handled by
 * {@link convertProcessHeatingEnergyUnit}.
 *
 * @param phast Assessment data in `oldSettings` units. Not mutated.
 * @param oldSettings Settings the data is currently stored in.
 * @param newSettings Settings to convert to.
 * @returns A converted copy, or `phast` unchanged when the unit system did not change.
 */
export function convertProcessHeatingUnits(phast: PHAST, oldSettings: Settings, newSettings: Settings): PHAST {
  const direction = getDirection(oldSettings, newSettings);
  if (!direction || !phast) {
    return phast;
  }
  return {
    ...convertAllScenarios(phast, scenario => convertScenarioUnits(scenario, direction)),
    lossDataUnits: newSettings.unitsOfMeasure,
  };
}

function convertScenarioEnergyUnit(scenario: ScenarioOverrides, from: string, to: string): ScenarioOverrides {
  const converted: ScenarioOverrides = {};
  if (scenario.losses?.otherLosses) {
    converted.losses = {
      ...scenario.losses,
      otherLosses: scenario.losses.otherLosses.map((loss: OtherLoss) => typeof loss.heatLoss === 'number'
        ? { ...loss, heatLoss: new ConvertValue(loss.heatLoss, from, to).convertedValue }
        : loss),
    };
  }
  return converted;
}

/**
 * Converts the stored values that are expressed in `energyResultUnit` rather than the unit
 * system: Other loss `heatLoss` (per hour).
 *
 * @param phast Assessment data in `oldSettings.energyResultUnit`. Not mutated.
 * @param oldSettings Settings the data is currently stored in.
 * @param newSettings Settings to convert to.
 * @returns A converted copy, or `phast` unchanged when `energyResultUnit` did not change.
 */
export function convertProcessHeatingEnergyUnit(phast: PHAST, oldSettings: Settings, newSettings: Settings): PHAST {
  const from = oldSettings.energyResultUnit;
  const to = newSettings.energyResultUnit;
  if (!phast || !from || !to || from === to) {
    return phast;
  }
  return convertAllScenarios(phast, scenario => convertScenarioEnergyUnit(scenario, from, to));
}

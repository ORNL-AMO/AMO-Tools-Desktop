import { ChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Losses, PHAST } from '../../models/phast';

export type SummaryValue = string | number | undefined | null;
type UnitPair = readonly [imperial: string, metric: string];

export interface FieldDefinition<T> {
  label: string;
  unit?: string | UnitPair;
  value: (item: T, settings: Settings) => SummaryValue;
}

/** A list-based loss: one summary section per item, matched across scenarios by index. */
interface LossSectionDefinition<T = never> {
  kind: 'items';
  label: string;
  items: (losses: Losses) => T[] | undefined;
  fields: FieldDefinition<T>[];
  isVisible?: (categories: ShowResultsCategories) => boolean;
}

/** A single-record section built from the whole scenario (operations, system efficiency). */
interface ScenarioSectionDefinition {
  kind: 'scenario';
  label: string;
  fields: FieldDefinition<PHAST>[];
  isVisible?: (categories: ShowResultsCategories) => boolean;
}

export type SectionDefinition = LossSectionDefinition<any> | ScenarioSectionDefinition;

const TEMPERATURE: UnitPair = ['℉', '℃'];
const AREA: UnitPair = ['ft²', 'm²'];
const SPECIFIC_HEAT: UnitPair = ['Btu/(lb-℉)', 'kJ/(kg-℃)'];
const MASS_FLOW: UnitPair = ['lb/hr', 'kg/hr'];
const LENGTH_SMALL: UnitPair = ['in', 'mm'];
const PERCENT = '%';

function field<T>(label: string, unit: string | UnitPair | undefined, value: (item: T, settings: Settings) => SummaryValue): FieldDefinition<T> {
  return { label, unit, value };
}

function prop<T>(label: string, key: keyof T, unit?: string | UnitPair): FieldDefinition<T> {
  return field<T>(label, unit, item => item[key] as SummaryValue);
}

/** Resolves a field's unit label for the active unit system. */
export function resolveUnit(unit: string | UnitPair | undefined, settings: Settings): string | undefined {
  if (!unit || typeof unit === 'string') {
    return unit as string | undefined;
  }
  return settings.unitsOfMeasure === 'Metric' ? unit[1] : unit[0];
}

const CHARGE_MATERIAL_TYPE_KEY = { Gas: 'gasChargeMaterial', Liquid: 'liquidChargeMaterial', Solid: 'solidChargeMaterial' } as const;

function chargeField(label: string, key: string, unit?: string | UnitPair): FieldDefinition<ChargeMaterial> {
  return field(label, unit, item => {
    const material = item[CHARGE_MATERIAL_TYPE_KEY[item.chargeMaterialType]] as Record<string, SummaryValue> | undefined;
    return material?.[key];
  });
}

const CHARGE_MATERIAL_SECTION: LossSectionDefinition<ChargeMaterial> = {
  kind: 'items',
  label: 'Charge Material',
  items: losses => losses.chargeMaterials,
  fields: [
    prop('Material Type', 'chargeMaterialType'),
    chargeField('Charge Feed Rate', 'chargeFeedRate', MASS_FLOW),
    chargeField('Gas Feed Rate', 'feedRate'),
    chargeField('Specific Heat of Solid', 'specificHeatSolid', SPECIFIC_HEAT),
    chargeField('Specific Heat of Liquid', 'specificHeatLiquid', SPECIFIC_HEAT),
    chargeField('Specific Heat of Gas', 'specificHeatGas', SPECIFIC_HEAT),
    chargeField('Specific Heat of Vapor', 'specificHeatVapor', SPECIFIC_HEAT),
    chargeField('Latent Heat', 'latentHeat', ['Btu/lb', 'kJ/kg']),
    chargeField('Melting Point', 'meltingPoint', TEMPERATURE),
    chargeField('Vaporizing Temperature', 'vaporizingTemperature', TEMPERATURE),
    chargeField('Inlet Temperature', 'initialTemperature', TEMPERATURE),
    chargeField('Outlet Temperature', 'dischargeTemperature', TEMPERATURE),
    chargeField('Water Vapor Discharge Temperature', 'waterVaporDischargeTemperature', TEMPERATURE),
    chargeField('Water Content (Charged)', 'waterContentCharged', PERCENT),
    chargeField('Water Content (Discharged)', 'waterContentDischarged', PERCENT),
    chargeField('Charge Melted', 'chargeMelted', PERCENT),
    chargeField('Charge Vaporized', 'percentVaporized', PERCENT),
    chargeField('Vapor in Gas Mixture', 'percentVapor', PERCENT),
    chargeField('Charge Reacted', 'chargeReacted', PERCENT),
    chargeField('Percent Reacted', 'percentReacted', PERCENT),
    chargeField('Heat of Reaction', 'reactionHeat', ['Btu/lb', 'kJ/kg']),
    chargeField('Additional Heat Required', 'additionalHeat', ['Btu/hr', 'kJ/hr']),
  ],
};

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    kind: 'scenario',
    label: 'Operations',
    fields: [
      field<PHAST>('Energy Source', undefined, (_, settings) => settings.energySourceType),
      field<PHAST>('Furnace Type', undefined, (_, settings) => settings.customFurnaceName || settings.furnaceType),
      field<PHAST>('Weeks per Year', undefined, phast => phast.operatingHours?.weeksPerYear),
      field<PHAST>('Days per Week', undefined, phast => phast.operatingHours?.daysPerWeek),
      field<PHAST>('Hours per Day', undefined, phast => phast.operatingHours?.hoursPerDay),
      field<PHAST>('Operating Hours', 'hr/yr', phast => phast.operatingHours?.hoursPerYear),
      field<PHAST>('Fuel Cost', undefined, phast => phast.operatingCosts?.fuelCost),
      field<PHAST>('Steam Cost', undefined, phast => phast.operatingCosts?.steamCost),
      field<PHAST>('Electricity Cost', '/kWh', phast => phast.operatingCosts?.electricityCost),
      field<PHAST>('Coal Carbon Cost', undefined, phast => phast.operatingCosts?.coalCarbonCost),
      field<PHAST>('Electrode Cost', undefined, phast => phast.operatingCosts?.electrodeCost),
      field<PHAST>('Other Fuel Cost', undefined, phast => phast.operatingCosts?.otherFuelCost),
      field<PHAST>('Implementation Cost', undefined, phast => phast.implementationCost),
    ],
  },
  CHARGE_MATERIAL_SECTION,
  {
    kind: 'items',
    label: 'Wall Loss',
    items: losses => losses.wallLosses,
    fields: [
      prop('Average Surface Temperature', 'surfaceTemperature', TEMPERATURE),
      prop('Ambient Temperature', 'ambientTemperature', TEMPERATURE),
      prop('Wind Velocity', 'windVelocity', ['mph', 'km/hr']),
      prop('Surface Shape / Orientation Factor', 'surfaceShape'),
      prop('Condition Factor', 'conditionFactor'),
      prop('Surface Emissivity', 'surfaceEmissivity'),
      prop('Total Outside Surface Area', 'surfaceArea', AREA),
      prop('Correction Factor', 'correctionFactor'),
    ],
  },
  {
    kind: 'items',
    label: 'Extended Surface Loss',
    items: losses => losses.extendedSurfaces,
    fields: [
      prop('Total Outside Surface Area', 'surfaceArea', AREA),
      prop('Average Surface Temperature', 'surfaceTemperature', TEMPERATURE),
      prop('Ambient Temperature', 'ambientTemperature', TEMPERATURE),
      prop('Surface Emissivity', 'surfaceEmissivity'),
    ],
  },
  {
    kind: 'items',
    label: 'Atmosphere Loss',
    items: losses => losses.atmosphereLosses,
    fields: [
      prop('Specific Heat of Gas', 'specificHeat', SPECIFIC_HEAT),
      prop('Inlet Temperature', 'inletTemperature', TEMPERATURE),
      prop('Outlet Temperature', 'outletTemperature', TEMPERATURE),
      prop('Flow Rate', 'flowRate', ['ft³/hr', 'm³/hr']),
      prop('Correction Factor', 'correctionFactor'),
    ],
  },
  {
    kind: 'items',
    label: 'Fixture Loss',
    items: losses => losses.fixtureLosses,
    fields: [
      prop('Specific Heat of Material', 'specificHeat', SPECIFIC_HEAT),
      prop('Fixture Feed Rate', 'feedRate', MASS_FLOW),
      prop('Inlet Temperature', 'initialTemperature', TEMPERATURE),
      prop('Outlet Temperature', 'finalTemperature', TEMPERATURE),
      prop('Correction Factor', 'correctionFactor'),
    ],
  },
  {
    kind: 'items',
    label: 'Opening Loss',
    items: losses => losses.openingLosses,
    fields: [
      prop('Opening Shape', 'openingType'),
      prop('Number of Openings', 'numberOfOpenings'),
      prop('Furnace Wall Thickness', 'thickness', LENGTH_SMALL),
      prop('Length / Diameter of Opening', 'lengthOfOpening', LENGTH_SMALL),
      prop('Height of Opening', 'heightOfOpening', LENGTH_SMALL),
      prop('View Factor', 'viewFactor'),
      prop('Average Inside Temperature', 'insideTemperature', TEMPERATURE),
      prop('Ambient Temperature', 'ambientTemperature', TEMPERATURE),
      prop('Emissivity of the Source', 'emissivity'),
      prop('Time Open', 'percentTimeOpen', PERCENT),
    ],
  },
  {
    kind: 'items',
    label: 'Cooling Loss',
    items: losses => losses.coolingLosses,
    fields: [
      prop('Cooling Medium', 'coolingLossType'),
      field('Specific Heat', SPECIFIC_HEAT, item => (item.gasCoolingLoss ?? item.liquidCoolingLoss)?.specificHeat),
      field('Gas Density', ['lb/scf', 'kg/Nm³'], item => item.gasCoolingLoss?.gasDensity),
      field('Liquid Density', ['lb/gal', 'kg/L'], item => item.liquidCoolingLoss?.density),
      field('Gas Flow', ['scfm', 'Nm³/min'], item => item.gasCoolingLoss?.flowRate),
      field('Liquid Flow', ['gal/min', 'L/min'], item => item.liquidCoolingLoss?.flowRate),
      field('Inlet Temperature', TEMPERATURE, item => (item.gasCoolingLoss ?? item.liquidCoolingLoss)?.initialTemperature),
      field('Outlet Temperature', TEMPERATURE, item => item.coolingLossType === 'Gas' ? item.gasCoolingLoss?.outletTemperature : item.liquidCoolingLoss?.outletTemperature),
      field('Correction Factor', undefined, item => (item.gasCoolingLoss ?? item.liquidCoolingLoss)?.correctionFactor),
    ],
  },
  {
    kind: 'items',
    label: 'Gas Leakage Loss',
    items: losses => losses.leakageLosses,
    fields: [
      prop('Furnace Draft Pressure', 'draftPressure', ['in. H₂O', 'Pa']),
      prop('Opening Area', 'openingArea', AREA),
      prop('Temperature of Leaking Gases', 'leakageGasTemperature', TEMPERATURE),
      prop('Specific Gravity of Flue Gas', 'specificGravity'),
      prop('Ambient Temperature', 'ambientTemperature', TEMPERATURE),
    ],
  },
  {
    kind: 'items',
    label: 'Flue Gas Loss',
    items: losses => losses.flueGasLosses,
    isVisible: categories => categories.showFlueGas,
    fields: [
      prop('Flue Gas Type', 'flueGasType'),
      field('Flue Gas Temperature', TEMPERATURE, item => (item.flueGasByVolume ?? item.flueGasByMass)?.flueGasTemperature),
      field('Oxygen Calculation Method', undefined, item => (item.flueGasByVolume ?? item.flueGasByMass)?.oxygenCalculationMethod),
      field('Excess Air', PERCENT, item => (item.flueGasByVolume ?? item.flueGasByMass)?.excessAirPercentage),
      field('O₂ in Flue Gas', PERCENT, item => (item.flueGasByVolume ?? item.flueGasByMass)?.o2InFlueGas),
      field('Combustion Air Temperature', TEMPERATURE, item => (item.flueGasByVolume ?? item.flueGasByMass)?.combustionAirTemperature),
      field('Fuel Temperature', TEMPERATURE, item => (item.flueGasByVolume ?? item.flueGasByMass)?.fuelTemperature),
      field('Ambient Air Temperature', TEMPERATURE, item => (item.flueGasByVolume ?? item.flueGasByMass)?.ambientAirTemp),
      field('Moisture in Combustion Air', PERCENT, item => (item.flueGasByVolume ?? item.flueGasByMass)?.moistureInAirCombustion),
      field('Ash Discharge Temperature', TEMPERATURE, item => item.flueGasByMass?.ashDischargeTemperature),
      field('Unburned Carbon in Ash', PERCENT, item => item.flueGasByMass?.unburnedCarbonInAsh),
    ],
  },
  {
    kind: 'items',
    label: 'Other Loss',
    items: losses => losses.otherLosses,
    fields: [
      prop('Loss Description', 'description'),
      prop('Heat Loss', 'heatLoss'),
    ],
  },
  {
    kind: 'items',
    label: 'Slag Loss',
    items: losses => losses.slagLosses,
    isVisible: categories => categories.showSlag,
    fields: [
      prop('Weight', 'weight'),
      prop('Inlet Temperature', 'inletTemperature', TEMPERATURE),
      prop('Outlet Temperature', 'outletTemperature', TEMPERATURE),
      prop('Specific Heat', 'specificHeat', SPECIFIC_HEAT),
      prop('Correction Factor', 'correctionFactor'),
    ],
  },
  {
    kind: 'items',
    label: 'Auxiliary Power Loss',
    items: losses => losses.auxiliaryPowerLosses,
    isVisible: categories => categories.showAuxPower,
    fields: [
      prop('Motor Current Phase(s)', 'motorPhase'),
      prop('Supply Voltage', 'supplyVoltage', 'V'),
      prop('Average Current', 'avgCurrent', 'A'),
      prop('Power Factor', 'powerFactor'),
      prop('Operating Time', 'operatingTime', PERCENT),
    ],
  },
  {
    kind: 'items',
    label: 'Exhaust Gas Loss',
    items: losses => losses.exhaustGasEAF,
    isVisible: categories => categories.showExGas,
    fields: [
      prop('Off (Exhaust) Gas Temperature', 'offGasTemp', TEMPERATURE),
      prop('CO', 'CO', PERCENT),
      prop('H₂', 'H2', PERCENT),
      prop('Combustible Gas as CH₄', 'combustibleGases', PERCENT),
      prop('Total Volumetric Flow Rate', 'vfr'),
      prop('Dust Loading', 'dustLoading'),
      prop('Other Losses', 'otherLosses'),
    ],
  },
  {
    kind: 'items',
    label: 'Energy Input',
    items: losses => losses.energyInputEAF,
    isVisible: categories => categories.showEnInput1,
    fields: [
      prop('Natural Gas Heat Input', 'naturalGasHeatInput'),
      prop('Coal Carbon Injection', 'coalCarbonInjection'),
      prop('Coal Heating Value', 'coalHeatingValue'),
      prop('Electrode Use', 'electrodeUse'),
      prop('Electrode Heating Value', 'electrodeHeatingValue'),
      prop('Other Fuels', 'otherFuels'),
      prop('Electricity Input', 'electricityInput'),
    ],
  },
  {
    kind: 'items',
    label: 'Energy Input and Exhaust Gas',
    items: losses => losses.energyInputExhaustGasLoss,
    isVisible: categories => categories.showEnInput2,
    fields: [
      prop('Electrical Heater Efficiency', 'electricalHeaterEfficiency', PERCENT),
      prop('Total Additional Fuel Heat', 'totalHeatInput'),
      prop('Available Heat of Fuel', 'availableHeat', PERCENT),
      prop('Excess Air', 'excessAir', PERCENT),
      prop('Combustion Air Temperature', 'combustionAirTemp', TEMPERATURE),
      prop('Exhaust Gas Temperature', 'exhaustGasTemp', TEMPERATURE),
      prop('Other Losses', 'otherLosses'),
    ],
  },
  {
    kind: 'scenario',
    label: 'Heat System Efficiency',
    isVisible: categories => categories.showSystemEff,
    fields: [field<PHAST>('Heat System Efficiency', PERCENT, phast => phast.systemEfficiency)],
  },
];

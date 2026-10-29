import { DryerOperatingCostInput, DryerType, PurgeInputMode } from '../../../shared/models/standalone';

// 'hidden': section not shown, 0 sent to the Suite.
// 'autoManual': user picks automatic (0 sent, Suite sizes it) or a manual value.
// 'automatic': Suite always sizes it; reported in results only.
export type DryerSizingMode = 'hidden' | 'autoManual' | 'automatic';

export interface DryerTypeConfig {
  label: string;
  // Default value for each type-specific assumption; null means the field is hidden for this type.
  purgeRate: number | null;
  heatingHoursPerDay: number | null;
  designDDCPercentage: number | null;
  regenerationCycleLength: number | null;
  heater: DryerSizingMode;
  motor: DryerSizingMode;
  showCoolingWater: boolean;
}

// Single source for dryer type defaults and conditional fields, used by the form, results, and
// saved-data migration. Values follow the V2 integration spec; provenance verification is a separate follow-up.
export const DRYER_TYPE_CONFIG: Record<DryerType, DryerTypeConfig> = {
  [DryerType.Heatless]: {
    label: 'Heatless',
    purgeRate: 15, heatingHoursPerDay: null, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'hidden', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.HeatedExternally]: {
    label: 'Heated Externally',
    purgeRate: 7, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.BlowerPurgeWithSweep]: {
    label: 'Blower Purge (With Sweep)',
    purgeRate: 7, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'autoManual', showCoolingWater: false,
  },
  [DryerType.BlowerPurgeWithoutSweep]: {
    label: 'Blower Purge (Without Sweep)',
    purgeRate: null, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'autoManual', showCoolingWater: false,
  },
  [DryerType.HeatOfCompressionHC]: {
    label: 'Heat of Compression (HC)',
    purgeRate: 2, heatingHoursPerDay: 3, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'automatic', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.HeatOfCompressionSP]: {
    label: 'Heat of Compression (SP)',
    purgeRate: null, heatingHoursPerDay: null, designDDCPercentage: 4, regenerationCycleLength: 2,
    heater: 'hidden', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.Refrigerated]: {
    label: 'Refrigerated',
    purgeRate: null, heatingHoursPerDay: null, designDDCPercentage: null, regenerationCycleLength: null,
    heater: 'hidden', motor: 'autoManual', showCoolingWater: true,
  },
};

// Dryer types in display order, for the type select and help.
export const DRYER_TYPE_OPTIONS: Array<{ value: DryerType, label: string }> = Object.keys(DRYER_TYPE_CONFIG)
  .map(key => Number(key) as DryerType)
  .map(value => ({ value, label: DRYER_TYPE_CONFIG[value].label }));

// The Suite prices purge air at the higher of the entered compressed air rate and this
// electricity-based floor ($/1000 SCF): 1000 SCF / 60 / 4.5 SCFM per hp, * 0.7457 kW/hp / 0.9 efficiency.
export function getMinimumPurgeAirRate(costOfElectricity: number): number {
  return (1000 / 60 / 4.5) * 0.7457 / 0.9 * costOfElectricity;
}

export function getDryerTypeConfig(dryerType: DryerType): DryerTypeConfig {
  return DRYER_TYPE_CONFIG[dryerType] ?? DRYER_TYPE_CONFIG[DryerType.Heatless];
}

// Type-specific assumptions, with automatic heater/motor sizing and capacity-percent purge.
// Values are unit-independent (%, hours) or zero, so no unit conversion is needed.
export function getDryerTypeDefaults(dryerType: DryerType): Pick<DryerOperatingCostInput,
  'purgeInputMode' | 'purgeRate' | 'purgeFlowRate' | 'heaterPower' | 'heatingHoursPerDay' | 'motorPower' | 'designDDCPercentage' | 'regenerationCycleLength'> {
  const config = getDryerTypeConfig(dryerType);
  return {
    purgeInputMode: PurgeInputMode.PercentOfDryerCapacity,
    purgeRate: config.purgeRate ?? 0,
    purgeFlowRate: 0,
    heaterPower: 0,
    heatingHoursPerDay: config.heatingHoursPerDay ?? 0,
    motorPower: 0,
    designDDCPercentage: config.designDDCPercentage ?? 0,
    regenerationCycleLength: config.regenerationCycleLength ?? 0,
  };
}

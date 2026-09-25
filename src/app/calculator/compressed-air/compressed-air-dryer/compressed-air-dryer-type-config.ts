import { DryerOperatingCostInput, DryerType, PurgeInputMode } from '../../../shared/models/standalone';

// 'hidden': section not shown, 0 sent to the Suite.
// 'autoManual': user picks automatic (0 sent, Suite sizes it) or a manual value.
// 'automatic': Suite always sizes it; reported in results only.
export type DryerSizingMode = 'hidden' | 'autoManual' | 'automatic';

export interface DryerTypeConfig {
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
    purgeRate: 15, heatingHoursPerDay: null, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'hidden', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.HeatedExternally]: {
    purgeRate: 7, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.BlowerPurgeWithSweep]: {
    purgeRate: 7, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'autoManual', showCoolingWater: false,
  },
  [DryerType.BlowerPurgeWithoutSweep]: {
    purgeRate: null, heatingHoursPerDay: 18, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'autoManual', motor: 'autoManual', showCoolingWater: false,
  },
  [DryerType.HeatOfCompressionHC]: {
    purgeRate: 2, heatingHoursPerDay: 3, designDDCPercentage: 16.33, regenerationCycleLength: 4,
    heater: 'automatic', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.HeatOfCompressionSP]: {
    purgeRate: null, heatingHoursPerDay: null, designDDCPercentage: 4, regenerationCycleLength: 2,
    heater: 'hidden', motor: 'hidden', showCoolingWater: false,
  },
  [DryerType.Refrigerated]: {
    purgeRate: null, heatingHoursPerDay: null, designDDCPercentage: null, regenerationCycleLength: null,
    heater: 'hidden', motor: 'autoManual', showCoolingWater: true,
  },
};

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

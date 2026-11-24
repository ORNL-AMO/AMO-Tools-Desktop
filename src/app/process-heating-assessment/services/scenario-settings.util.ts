import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { HeatingEquipmentConfiguration, HeatingSystemEnergyType } from '../models/views';
import { ProcessHeatingModification } from '../models/modification';

export type AssessmentScenario = 'baseline' | string;

export function deriveHeatingSystemEnergyType(config: HeatingEquipmentConfiguration): HeatingSystemEnergyType {
  const HC = HeatingEquipmentConfiguration;
  return {
    isFuelBased: config === HC.FUEL_FIRED || config === HC.ELECTROTECHNOLOGY_EAF,
    isSteam: config === HC.STEAM,
    isElectro: config === HC.ELECTROTECHNOLOGY_STANDARD || config === HC.ELECTROTECHNOLOGY_EAF || config === HC.CUSTOM_ELECTROTECHNOLOGY,
    isEAF: config === HC.ELECTROTECHNOLOGY_EAF,
  };
}

export function deriveHeatingEquipmentConfiguration(settings: Settings): HeatingEquipmentConfiguration {
  if (!settings) return HeatingEquipmentConfiguration.FUEL_FIRED;
  if (settings.energySourceType === 'Electricity') {
    if (settings.furnaceType === 'Electric Arc Furnace (EAF)') return HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF;
    if (settings.furnaceType === 'Custom Electrotechnology') return HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY;
    return HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD;
  }
  if (settings.energySourceType === 'Steam') return HeatingEquipmentConfiguration.STEAM;
  return HeatingEquipmentConfiguration.FUEL_FIRED;
}

/**
 * @param settings the assessment's settings
 * @param phast the assessment's baseline, holding its modifications
 * @param scenario 'baseline' or a modification id
 * @returns the settings with the modification's own energy source applied, when it has one
 */
export function scenarioSettingsFor(settings: Settings, phast: PHAST | undefined, scenario: AssessmentScenario): Settings {
  const energySource = scenario === 'baseline'
    ? undefined
    : ((phast?.modifications ?? []) as ProcessHeatingModification[]).find(mod => mod.id === scenario)?.energySource;
  if (!settings || !energySource) {
    return settings;
  }
  const { energySourceType, furnaceType, customFurnaceName } = energySource;
  return { ...settings, energySourceType, furnaceType, customFurnaceName };
}

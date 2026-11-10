import { HeatingEquipmentConfiguration } from '../models/views';

/** Which energy sources a Metered or Designed Energy entry measures; more than one for hybrid units. */
export interface EnergySourceSelection {
  fuel: boolean;
  steam: boolean;
  electricity: boolean;
}

export type EnergySource = keyof EnergySourceSelection;

const FUEL: EnergySourceSelection = { fuel: true, steam: false, electricity: false };
const STEAM: EnergySourceSelection = { fuel: false, steam: true, electricity: false };
const ELECTRICITY: EnergySourceSelection = { fuel: false, steam: false, electricity: true };

/** EAF preselects electricity only, although its heat balance also counts fuel. */
const DEFAULT_ENERGY_SOURCES: Record<HeatingEquipmentConfiguration, EnergySourceSelection> = {
  [HeatingEquipmentConfiguration.FUEL_FIRED]: FUEL,
  [HeatingEquipmentConfiguration.STEAM]: STEAM,
  [HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD]: ELECTRICITY,
  [HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF]: ELECTRICITY,
  [HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY]: ELECTRICITY,
};

/**
 * @param configuration the assessment's heating equipment configuration
 * @returns the energy source preselected when Metered or Designed Energy is first opened
 */
export function defaultEnergySources(configuration: HeatingEquipmentConfiguration): EnergySourceSelection {
  return { ...DEFAULT_ENERGY_SOURCES[configuration] };
}

/**
 * @param selection which sources are turned on
 * @returns the source when it is the only one on, so it can't be turned off; undefined otherwise
 */
export function onlySourceOn(selection: Partial<EnergySourceSelection>): EnergySource | undefined {
  const on = (['fuel', 'steam', 'electricity'] as EnergySource[]).filter(source => selection[source]);
  return on.length === 1 ? on[0] : undefined;
}

import { Settings } from '../../shared/models/settings';

export interface EnergySourceTypeOption {
  value: string;
  label: string;
}

export const ENERGY_SOURCE_TYPE_OPTIONS: readonly EnergySourceTypeOption[] = [
  { value: 'Fuel', label: 'Fuel-fired' },
  { value: 'Electricity', label: 'Electrotechnology' },
  { value: 'Steam', label: 'Steam-based' },
];

/**
 * @param settings a scenario's settings
 * @returns Font Awesome icon class for the energy source: a flame for fuel, a bolt for electricity, a cloud for steam
 */
export function getEnergySourceIcon(settings: Settings): string {
  if (settings.energySourceType === 'Electricity') {
    return 'fa-bolt';
  }
  return settings.energySourceType === 'Steam' ? 'fa-cloud' : 'fa-fire';
}

/**
 * @param settings a scenario's settings
 * @returns the energy source as the settings screen words it, with the furnace type for Electrotechnology
 */
export function getEnergySourceLabel(settings: Settings): string {
  if (settings.energySourceType === 'Electricity') {
    return `Electrotechnology (${settings.furnaceType})`;
  }
  return settings.energySourceType === 'Steam' ? 'Steam-based' : 'Fuel-fired';
}

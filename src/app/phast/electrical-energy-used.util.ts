import { PhastResults } from '../shared/models/phast/phast';
import { Settings } from '../shared/models/settings';

// Picked so both the legacy and the rebuilt Process Heating PhastResults interfaces are accepted
type ElectricalEnergyResults = Pick<PhastResults, 'grossHeatInput' | 'electricalHeatDelivered'>;

/**
 * Custom Electrotechnology has no energy input loss, so `electricalHeatDelivered` is never set for it.
 * All of its gross heat input, system losses included, is purchased electricity.
 * @param results heat balance results for a non-EAF electrotechnology furnace
 * @param settings the assessment's settings
 * @returns hourly electrical energy used, in the settings' energy result unit
 */
export function getElectricalEnergyUsed(results: ElectricalEnergyResults, settings: Settings): number {
  if (settings.furnaceType === 'Custom Electrotechnology') {
    return results.grossHeatInput;
  }
  return results.electricalHeatDelivered;
}

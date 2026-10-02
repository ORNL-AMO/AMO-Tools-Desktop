import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../shared/models/phast/losses/flueGas';
import { FlueGasType, OxygenCalculationMethod } from '../heat-balance/losses/flue-gas/flue-gas-form.service';
import { OpportunityFieldAccessor } from './sectioned-opportunity-state';

export type FlueGasOpportunityField = 'excessAirPercentage' | 'o2InFlueGas' | 'combustionAirTemperature';

/** The inputs object for the entry's type: `flueGasByMass` for By Mass, otherwise `flueGasByVolume`. */
export function getActiveFlueGas(loss: FlueGas): FlueGasByVolume | FlueGasByMass | undefined {
  return loss.flueGasType === FlueGasType.ByMass ? loss.flueGasByMass : loss.flueGasByVolume;
}

/** Writes onto whichever inputs object the entry's type uses. */
export function patchActiveFlueGas(
  loss: FlueGas,
  patch: Partial<Pick<FlueGasByVolume, FlueGasOpportunityField | 'oxygenCalculationMethod'>>,
): FlueGas {
  return loss.flueGasType === FlueGasType.ByMass
    ? { ...loss, flueGasByMass: { ...loss.flueGasByMass, ...patch } }
    : { ...loss, flueGasByVolume: { ...loss.flueGasByVolume, ...patch } };
}

/** Reads and writes a field shared by both flue gas input types, on whichever the entry uses. */
export function flueGasField(field: FlueGasOpportunityField): OpportunityFieldAccessor<FlueGas> {
  return {
    get: loss => getActiveFlueGas(loss)?.[field],
    set: (loss, value) => patchActiveFlueGas(loss, { [field]: value }),
  };
}

export function getOxygenCalculationMethod(loss: FlueGas): OxygenCalculationMethod | undefined {
  return getActiveFlueGas(loss)?.oxygenCalculationMethod;
}

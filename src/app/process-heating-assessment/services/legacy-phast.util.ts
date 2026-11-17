import { PHAST } from '../models/phast';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';
import { HeatingEquipmentConfiguration, isViewVisibleForConfiguration, LOSS_VIEW_KEYS } from '../models/views';

/**
 * Auxiliary Power is not part of this module, but saved assessments can still hold its losses,
 * which the legacy heat balance would otherwise add to heat input.
 * @param phast scenario in this module's shape
 * @returns a legacy-shaped copy without auxiliary power losses
 */
export function toLegacyPhast(phast: PHAST): SharedPHAST {
  if (!phast?.losses) return { ...phast } as unknown as SharedPHAST;
  const { auxiliaryPowerLosses, ...losses } = phast.losses;
  return { ...phast, losses } as unknown as SharedPHAST;
}

/**
 * A scenario keeps the losses of tabs its energy source hides, but the legacy heat balance adds some of them
 * (Gas Leakage, Slag) to heat input regardless of energy source.
 * @param phast scenario in this module's shape
 * @param configuration the scenario's heating equipment configuration
 * @returns a copy without the losses of tabs the configuration hides
 */
export function withoutHiddenLosses(phast: PHAST, configuration: HeatingEquipmentConfiguration): PHAST {
  if (!phast?.losses) return phast;
  const losses = { ...phast.losses };
  Object.entries(LOSS_VIEW_KEYS)
    .filter(([view]) => !isViewVisibleForConfiguration(view, configuration))
    .forEach(([, lossKey]) => delete losses[lossKey]);
  return { ...phast, losses };
}

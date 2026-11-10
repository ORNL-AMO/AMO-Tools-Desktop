import { PHAST } from '../models/phast';
import { PHAST as SharedPHAST } from '../../shared/models/phast/phast';

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

import { WallLoss } from '../../../models/wall-loss';

/** Advisory check for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getWallLossSurfaceTemperatureWarning(loss: WallLoss): string | null {
  return loss.surfaceTemperature < loss.ambientTemperature ? 'Surface temperature is lower than ambient temperature' : null;
}

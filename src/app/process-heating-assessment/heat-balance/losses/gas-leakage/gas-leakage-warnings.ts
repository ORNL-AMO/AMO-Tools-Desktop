import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';

export interface GasLeakageWarnings {
  openingAreaWarning: string | null;
  specificGravityWarning: string | null;
  temperatureWarning: string | null;
}

/** Advisory checks for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getGasLeakageWarnings(loss: LeakageLoss): GasLeakageWarnings {
  return {
    openingAreaWarning: loss.openingArea < 0 ? 'Opening Area must be equal or greater than 0' : null,
    specificGravityWarning: loss.specificGravity < 0 ? 'Specific Gravity of Flue Gas must be equal or greater than 0' : null,
    temperatureWarning: loss.ambientTemperature > loss.leakageGasTemperature
      ? "Ambient Temperature shouldn't be greater than Temperature of Leaking Gases" : null,
  };
}

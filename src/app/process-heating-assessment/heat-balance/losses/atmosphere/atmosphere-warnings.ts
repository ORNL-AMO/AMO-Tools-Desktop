import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';

export interface AtmosphereLossWarnings {
  flowRateWarning: string | null;
  temperatureWarning: string | null;
}

/** Advisory checks for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getAtmosphereLossWarnings(loss: AtmosphereLoss): AtmosphereLossWarnings {
  return {
    flowRateWarning: loss.flowRate < 0 ? 'Flow Rate must be greater than 0' : null,
    temperatureWarning: loss.inletTemperature > loss.outletTemperature ? 'Inlet temperature is greater than outlet temperature' : null,
  };
}

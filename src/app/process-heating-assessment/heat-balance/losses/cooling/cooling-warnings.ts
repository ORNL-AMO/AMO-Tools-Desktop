import { GasCoolingLoss, LiquidCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';

export interface CoolingLossWarnings {
  specificHeatWarning: string | null;
  densityWarning: string | null;
  flowRateWarning: string | null;
  temperatureWarning: string | null;
}

export function getGasCoolingWarnings(loss: GasCoolingLoss): CoolingLossWarnings {
  return {
    ...sharedWarnings(loss),
    densityWarning: loss.gasDensity < 0 ? 'Gas Density must be equal or greater than 0' : null,
    flowRateWarning: loss.flowRate < 0 ? 'Gas Flow must be equal or greater than 0' : null,
  };
}

export function getLiquidCoolingWarnings(loss: LiquidCoolingLoss): CoolingLossWarnings {
  return {
    ...sharedWarnings(loss),
    densityWarning: loss.density < 0 ? 'Density must be equal or greater than 0' : null,
    flowRateWarning: loss.flowRate < 0 ? 'Liquid Flow must be equal or greater than 0' : null,
  };
}

function sharedWarnings(loss: GasCoolingLoss | LiquidCoolingLoss): Omit<CoolingLossWarnings, 'densityWarning' | 'flowRateWarning'> {
  return {
    specificHeatWarning: loss.specificHeat < 0 ? 'Average Specific Heat must be equal or greater than 0' : null,
    temperatureWarning: loss.initialTemperature > loss.outletTemperature ? 'Inlet temperature is greater than outlet temperature' : null,
  };
}

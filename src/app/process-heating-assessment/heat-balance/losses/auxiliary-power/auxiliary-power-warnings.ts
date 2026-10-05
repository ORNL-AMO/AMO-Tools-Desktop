import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';

export interface AuxiliaryPowerWarnings {
  voltageWarning: string | null;
}

/** Advisory checks for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getAuxiliaryPowerWarnings(loss: AuxiliaryPowerLoss): AuxiliaryPowerWarnings {
  let voltageWarning: string | null = null;
  if (loss.supplyVoltage < 0) {
    voltageWarning = 'Supply Voltage should be 0 V or greater';
  } else if (loss.supplyVoltage > 480) {
    voltageWarning = 'Supply Voltage should be less than 480 V';
  }
  return { voltageWarning };
}

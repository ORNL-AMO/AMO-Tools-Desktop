import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';

export interface OpeningLossWarnings {
  temperatureWarning: string | null;
  emissivityWarning: string | null;
  timeOpenWarning: string | null;
  numOpeningsWarning: string | null;
  thicknessWarning: string | null;
  lengthWarning: string | null;
  heightWarning: string | null;
  viewFactorWarning: string | null;
}

/** Advisory checks for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getOpeningLossWarnings(loss: OpeningLoss): OpeningLossWarnings {
  return {
    temperatureWarning: loss.ambientTemperature > loss.insideTemperature
      ? 'Ambient Temperature cannot be greater than Average Zone Temperature' : null,
    emissivityWarning: getEmissivityWarning(loss.emissivity),
    timeOpenWarning: getTimeOpenWarning(loss.percentTimeOpen),
    numOpeningsWarning: loss.numberOfOpenings < 0 ? 'Number of Openings must be positive' : null,
    thicknessWarning: loss.thickness < 0 ? 'Furnace Wall Thickness must be greater than or equal to 0' : null,
    lengthWarning: getLengthWarning(loss),
    heightWarning: loss.heightOfOpening < 0 ? 'Opening Height must be greater than 0' : null,
    viewFactorWarning: loss.viewFactor < 0 ? 'View Factor must be positive' : null,
  };
}

function getEmissivityWarning(emissivity: number): string | null {
  if (emissivity > 1) return 'Surface emissivity must be less than 1';
  if (emissivity < 0) return 'Surface emissivity must be positive';
  return null;
}

function getTimeOpenWarning(percentTimeOpen: number): string | null {
  if (percentTimeOpen > 100) return 'Time open must be less than 100%';
  if (percentTimeOpen < 0) return 'Time must be greater positive';
  return null;
}

function getLengthWarning(loss: OpeningLoss): string | null {
  if (loss.lengthOfOpening > 0) return null;
  return loss.openingType === 'Round' ? 'Opening Diameter must be greater than 0' : 'Opening Length must be greater than 0';
}

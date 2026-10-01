import { FlueGasByVolume, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';

const CONDENSING_TEMP_IMPERIAL = 212;
const CONDENSING_TEMP_METRIC = 100;

/** Advisory checks for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getFlueGasByVolumeWarnings(loss: FlueGasByVolume, settings: Settings): FlueGasWarnings {
  const condensingTemp = settings?.unitsOfMeasure === 'Metric' ? CONDENSING_TEMP_METRIC : CONDENSING_TEMP_IMPERIAL;
  return {
    moistureInAirCombustionWarning: getMoistureWarning(loss.moistureInAirCombustion),
    combustionAirTempWarning: loss.combustionAirTemperature > loss.flueGasTemperature
      ? 'Combustion air temperature must be less than flue gas temperature' : null,
    excessAirWarning: loss.excessAirPercentage < 0 ? 'Excess Air must be greater than 0 percent' : null,
    o2Warning: loss.o2InFlueGas < 0 || loss.o2InFlueGas >= 21
      ? 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent' : null,
    flueGasTemp: loss.flueGasTemperature && loss.flueGasTemperature < condensingTemp
      ? `Flue Gas Temperature less than ${condensingTemp}, gases may be condensing in the flue and calculated efficiency may not be valid.` : null,
  };
}

export function hasFlueGasWarnings(warnings: FlueGasWarnings): boolean {
  return Object.values(warnings).some(warning => warning != null);
}

export function getAvailableHeatWarning(availableHeat: number | null | undefined): string | null {
  return availableHeat != null && (availableHeat < 0 || availableHeat > 100)
    ? `Available heat is ${availableHeat.toFixed(2)}%. Check your input fields.`
    : null;
}

function getMoistureWarning(moisture: number): string | null {
  if (moisture < 0) return 'Moisture in Combustion Air must be equal or greater than 0%';
  if (moisture > 100) return 'Moisture in Combustion Air must be less than or equal to 100%';
  return null;
}

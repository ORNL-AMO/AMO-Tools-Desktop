import { Settings } from '../../../../shared/models/settings';
import { getAvailableHeatWarning, getFlueGasByVolumeWarnings, hasFlueGasWarnings } from './flue-gas-warnings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

describe('flue gas warnings', () => {
  it('returns no warnings for valid values', () => {
    const warnings = getFlueGasByVolumeWarnings(
      { flueGasTemperature: 400, combustionAirTemperature: 65, excessAirPercentage: 10, o2InFlueGas: 0, moistureInAirCombustion: 1 }, IMPERIAL);

    expect(hasFlueGasWarnings(warnings)).toBeFalse();
  });

  it('flags moisture outside 0 to 100', () => {
    expect(getFlueGasByVolumeWarnings({ moistureInAirCombustion: -1 }, IMPERIAL).moistureInAirCombustionWarning)
      .toBe('Moisture in Combustion Air must be equal or greater than 0%');
    expect(getFlueGasByVolumeWarnings({ moistureInAirCombustion: 101 }, IMPERIAL).moistureInAirCombustionWarning)
      .toBe('Moisture in Combustion Air must be less than or equal to 100%');
  });

  it('flags combustion air hotter than flue gas', () => {
    expect(getFlueGasByVolumeWarnings({ combustionAirTemperature: 500, flueGasTemperature: 400 }, IMPERIAL).combustionAirTempWarning)
      .toBe('Combustion air temperature must be less than flue gas temperature');
  });

  it('flags negative excess air', () => {
    expect(getFlueGasByVolumeWarnings({ excessAirPercentage: -1 }, IMPERIAL).excessAirWarning).toBe('Excess Air must be greater than 0 percent');
  });

  it('flags O2 below 0 and at or above 21', () => {
    expect(getFlueGasByVolumeWarnings({ o2InFlueGas: -1 }, IMPERIAL).o2Warning).not.toBeNull();
    expect(getFlueGasByVolumeWarnings({ o2InFlueGas: 21 }, IMPERIAL).o2Warning).not.toBeNull();
    expect(getFlueGasByVolumeWarnings({ o2InFlueGas: 20.9 }, IMPERIAL).o2Warning).toBeNull();
  });

  it('flags condensing flue gas temperature per unit system', () => {
    expect(getFlueGasByVolumeWarnings({ flueGasTemperature: 211 }, IMPERIAL).flueGasTemp).toContain('less than 212');
    expect(getFlueGasByVolumeWarnings({ flueGasTemperature: 212 }, IMPERIAL).flueGasTemp).toBeNull();
    expect(getFlueGasByVolumeWarnings({ flueGasTemperature: 99 }, METRIC).flueGasTemp).toContain('less than 100');
  });

  it('flags available heat outside 0 to 100 percent', () => {
    expect(getAvailableHeatWarning(-5)).toBe('Available heat is -5.00%. Check your input fields.');
    expect(getAvailableHeatWarning(100.5)).toBe('Available heat is 100.50%. Check your input fields.');
    expect(getAvailableHeatWarning(0)).toBeNull();
    expect(getAvailableHeatWarning(100)).toBeNull();
    expect(getAvailableHeatWarning(null)).toBeNull();
  });
});

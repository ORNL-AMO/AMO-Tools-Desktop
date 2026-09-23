import { getGasCoolingWarnings, getLiquidCoolingWarnings } from './cooling-warnings';

describe('cooling warnings', () => {
  it('flags negative gas values with legacy messages', () => {
    expect(getGasCoolingWarnings({ specificHeat: -1, gasDensity: -1, flowRate: -1 })).toEqual(jasmine.objectContaining({
      specificHeatWarning: 'Average Specific Heat must be equal or greater than 0',
      densityWarning: 'Gas Density must be equal or greater than 0',
      flowRateWarning: 'Gas Flow must be equal or greater than 0',
    }));
  });

  it('flags a negative liquid density with the liquid message', () => {
    expect(getLiquidCoolingWarnings({ density: -1 }).densityWarning).toBe('Density must be equal or greater than 0');
  });

  it('warns when inlet temperature exceeds outlet temperature', () => {
    expect(getGasCoolingWarnings({ initialTemperature: 200, outletTemperature: 100 }).temperatureWarning)
      .toBe('Inlet temperature is greater than outlet temperature');
    expect(getLiquidCoolingWarnings({ initialTemperature: 100, outletTemperature: 100 }).temperatureWarning).toBeNull();
  });

  it('does not warn on zero values', () => {
    expect(getGasCoolingWarnings({ specificHeat: 0, gasDensity: 0, flowRate: 0 })).toEqual(jasmine.objectContaining({
      specificHeatWarning: null,
      densityWarning: null,
      flowRateWarning: null,
    }));
  });
});

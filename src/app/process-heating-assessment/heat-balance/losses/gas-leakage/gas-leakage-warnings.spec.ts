import { getGasLeakageWarnings } from './gas-leakage-warnings';

describe('getGasLeakageWarnings', () => {
  it('returns no warnings for valid values', () => {
    expect(getGasLeakageWarnings({ openingArea: 1, specificGravity: 1, ambientTemperature: 70, leakageGasTemperature: 1500 }))
      .toEqual({ openingAreaWarning: null, specificGravityWarning: null, temperatureWarning: null });
  });

  it('warns on a negative opening area', () => {
    expect(getGasLeakageWarnings({ openingArea: -1 }).openingAreaWarning).toBe('Opening Area must be equal or greater than 0');
  });

  it('warns on a negative specific gravity', () => {
    expect(getGasLeakageWarnings({ specificGravity: -1 }).specificGravityWarning)
      .toBe('Specific Gravity of Flue Gas must be equal or greater than 0');
  });

  it('warns when ambient temperature exceeds the leaking gas temperature', () => {
    expect(getGasLeakageWarnings({ ambientTemperature: 2000, leakageGasTemperature: 1500 }).temperatureWarning)
      .toBe("Ambient Temperature shouldn't be greater than Temperature of Leaking Gases");
  });
});

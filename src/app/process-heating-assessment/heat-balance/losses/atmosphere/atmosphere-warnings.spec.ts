import { getAtmosphereLossWarnings } from './atmosphere-warnings';

describe('getAtmosphereLossWarnings', () => {
  it('warns when flow rate is negative', () => {
    expect(getAtmosphereLossWarnings({ flowRate: -1 }).flowRateWarning).toBe('Flow Rate must be greater than 0');
  });

  it('does not warn when flow rate is 0', () => {
    expect(getAtmosphereLossWarnings({ flowRate: 0 }).flowRateWarning).toBeNull();
  });

  it('warns when inlet temperature is above outlet temperature', () => {
    const warnings = getAtmosphereLossWarnings({ inletTemperature: 500, outletTemperature: 400 });

    expect(warnings.temperatureWarning).toBe('Inlet temperature is greater than outlet temperature');
  });

  it('does not warn when inlet and outlet temperature are equal', () => {
    const warnings = getAtmosphereLossWarnings({ inletTemperature: 400, outletTemperature: 400 });

    expect(warnings.temperatureWarning).toBeNull();
  });
});

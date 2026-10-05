import { getAuxiliaryPowerWarnings } from './auxiliary-power-warnings';

describe('getAuxiliaryPowerWarnings', () => {
  it('returns no warning for a voltage in range', () => {
    expect(getAuxiliaryPowerWarnings({ supplyVoltage: 480 })).toEqual({ voltageWarning: null });
  });

  it('warns on a negative supply voltage', () => {
    expect(getAuxiliaryPowerWarnings({ supplyVoltage: -1 }).voltageWarning).toBe('Supply Voltage should be greater than 0 V');
  });

  it('warns when supply voltage exceeds 480 V', () => {
    expect(getAuxiliaryPowerWarnings({ supplyVoltage: 481 }).voltageWarning).toBe('Supply Voltage should be less than 480 V');
  });
});

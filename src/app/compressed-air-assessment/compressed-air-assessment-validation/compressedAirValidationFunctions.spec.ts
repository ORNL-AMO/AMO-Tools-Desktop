import { checkIsPowerFactorValid } from './compressedAirValidationFunctions';

describe('compressedAirValidationFunctions', () => {
  it('accepts dimensionless power factors from zero through one', () => {
    expect(checkIsPowerFactorValid(0)).toBeUndefined();
    expect(checkIsPowerFactorValid(0.83)).toBeUndefined();
    expect(checkIsPowerFactorValid(1)).toBeUndefined();
  });

  it('rejects power factors outside the zero-to-one range', () => {
    expect(checkIsPowerFactorValid(-0.01)).toBe('Power Factor must be 0 or greater');
    expect(checkIsPowerFactorValid(1.01)).toBe('Power Factor must be 1 or less');
  });
});

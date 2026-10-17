import { convertUnits } from './convert-units';

describe('convertUnits', () => {
  it('converts between units', () => {
    expect(convertUnits(212, 'F', 'C')).toBeCloseTo(100, 6);
    expect(convertUnits(1, 'lb', 'kg')).toBeCloseTo(0.45359237, 6);
  });

  it('returns the value unchanged when both units are the same', () => {
    expect(convertUnits(42, 'ft', 'ft')).toBe(42);
  });

  it('converts a genuine 0 instead of treating it as empty', () => {
    expect(convertUnits(0, 'C', 'F')).toBeCloseTo(32, 6);
  });

  it('passes empty values through instead of converting them as 0', () => {
    expect(convertUnits(null, 'F', 'C')).toBeNull();
    expect(convertUnits(undefined, 'F', 'C')).toBeUndefined();
    expect(convertUnits('' as never, 'F', 'C')).toBe('' as never);
  });

  it('throws when the source unit is unknown', () => {
    expect(() => convertUnits(5, 'bogus', 'C')).toThrowError(/Unsupported unit 'bogus'/);
  });

  it('throws when the destination unit is unknown', () => {
    expect(() => convertUnits(5, 'F', 'bogus')).toThrowError(/Unsupported unit 'bogus'/);
  });

  it('throws when the units measure different quantities', () => {
    expect(() => convertUnits(5, 'lb', 'ft')).toThrow();
  });
});

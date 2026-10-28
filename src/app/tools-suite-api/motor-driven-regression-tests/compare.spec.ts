import { canonical } from './scenarios';
import { resultDifferences } from './compare';

describe('Motor-driven result comparison gate', () => {
  it('reports floating-point changes even inside the existing diagnostic tolerance', () => {
    const differences = resultDifferences({ value: 100 }, { value: 100 + 1e-12 });
    expect(differences.length).toBe(1);
    expect(differences[0].withinTolerance).toBeTrue();
  });
  it('distinguishes missing, undefined, null, nonfinite values and signed zero', () => {
    expect(resultDifferences(canonical({ value: undefined }), canonical({})).length).toBe(1);
    expect(resultDifferences(canonical({ value: undefined }), canonical({ value: null })).length).toBe(1);
    expect(resultDifferences(canonical(NaN), canonical(Infinity)).length).toBe(1);
    expect(resultDifferences(canonical(-0), canonical(0)).length).toBe(1);
  });
  it('retains array ordering, length and boolean flags', () => {
    expect(resultDifferences([1, 2], [2, 1]).length).toBe(2);
    expect(resultDifferences([1], [1, 2]).length).toBe(1);
    expect(resultDifferences({ flag: true }, { flag: false }).length).toBe(1);
  });
});

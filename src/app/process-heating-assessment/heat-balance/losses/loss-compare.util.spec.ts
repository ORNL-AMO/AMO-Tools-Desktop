import { getLossDifferences, nestedDifferences } from './loss-compare.util';
import { LossEntity } from './loss-form-list.service';

interface TestLoss extends LossEntity {
  area?: number | null;
  label?: string;
  nested?: { temp?: number; factor?: number };
  tags?: string[];
}

describe('getLossDifferences', () => {
  it('returns an empty set for items that match baseline', () => {
    const baseline: TestLoss[] = [{ id: 'a', area: 5, nested: { temp: 1 } }];
    const modification: TestLoss[] = [{ id: 'a', area: 5, nested: { temp: 1 } }];
    expect(getLossDifferences(baseline, modification).get('a')?.size).toBe(0);
  });

  it('flags only the fields whose values differ', () => {
    const baseline: TestLoss[] = [{ id: 'a', area: 5, label: 'x' }];
    const modification: TestLoss[] = [{ id: 'a', area: 6, label: 'x' }];
    expect([...getLossDifferences(baseline, modification).get('a')!]).toEqual(['area']);
  });

  it('treats null, undefined and empty string as equal', () => {
    const baseline: TestLoss[] = [{ id: 'a', area: null, label: '' }];
    const modification: TestLoss[] = [{ id: 'a', label: undefined }];
    expect(getLossDifferences(baseline, modification).get('a')?.size).toBe(0);
  });

  it('flags a zero against a missing value', () => {
    const baseline: TestLoss[] = [{ id: 'a' }];
    const modification: TestLoss[] = [{ id: 'a', area: 0 }];
    expect(getLossDifferences(baseline, modification).get('a')?.has('area')).toBeTrue();
  });

  it('ignores id and name', () => {
    const baseline: TestLoss[] = [{ id: 'a', name: 'Loss #1' }];
    const modification: TestLoss[] = [{ id: 'a', name: 'Renamed' }];
    expect(getLossDifferences(baseline, modification).get('a')?.size).toBe(0);
  });

  it('reports heatLoss differences', () => {
    const baseline: TestLoss[] = [{ id: 'a', heatLoss: 1 }];
    const modification: TestLoss[] = [{ id: 'a', heatLoss: 2 }];
    expect(getLossDifferences(baseline, modification).get('a')?.has('heatLoss')).toBeTrue();
  });

  it('matches items by id regardless of order', () => {
    const baseline: TestLoss[] = [{ id: 'a', area: 1 }, { id: 'b', area: 2 }];
    const modification: TestLoss[] = [{ id: 'b', area: 2 }, { id: 'a', area: 9 }];
    const differences = getLossDifferences(baseline, modification);
    expect(differences.get('a')?.has('area')).toBeTrue();
    expect(differences.get('b')?.size).toBe(0);
  });

  it('gives modification-only items no entry', () => {
    const baseline: TestLoss[] = [{ id: 'a', area: 1 }];
    const modification: TestLoss[] = [{ id: 'a', area: 1 }, { id: 'new', area: 3 }];
    expect(getLossDifferences(baseline, modification).has('new')).toBeFalse();
  });

  it('handles undefined arrays', () => {
    expect(getLossDifferences<TestLoss>(undefined, undefined).size).toBe(0);
    expect(getLossDifferences<TestLoss>(undefined, [{ id: 'a', area: 1 }]).size).toBe(0);
    expect(getLossDifferences<TestLoss>([{ id: 'a', area: 1 }], undefined).size).toBe(0);
  });

  it('dot-joins differing fields of nested objects', () => {
    const baseline: TestLoss[] = [{ id: 'a', nested: { temp: 1, factor: 2 } }];
    const modification: TestLoss[] = [{ id: 'a', nested: { temp: 1, factor: 3 } }];
    expect([...getLossDifferences(baseline, modification).get('a')!] as string[]).toEqual(['nested.factor']);
  });

  it('flags every populated field of a nested object missing from baseline', () => {
    const baseline: TestLoss[] = [{ id: 'a' }];
    const modification: TestLoss[] = [{ id: 'a', nested: { temp: 1, factor: 0 } }];
    expect([...getLossDifferences(baseline, modification).get('a')!].sort() as string[]).toEqual(['nested.factor', 'nested.temp']);
  });

  it('does not flag blank fields of a nested object missing from baseline', () => {
    const baseline: TestLoss[] = [{ id: 'a' }];
    const modification: TestLoss[] = [{ id: 'a', nested: { temp: undefined, factor: null as never } }];
    expect(getLossDifferences(baseline, modification).get('a')?.size).toBe(0);
  });

  it('compares arrays by value', () => {
    const baseline: TestLoss[] = [{ id: 'a', tags: ['x'] }, { id: 'b', tags: ['x'] }];
    const modification: TestLoss[] = [{ id: 'a', tags: ['x'] }, { id: 'b', tags: ['y'] }];
    const differences = getLossDifferences(baseline, modification);
    expect(differences.get('a')?.size).toBe(0);
    expect(differences.get('b')?.has('tags')).toBeTrue();
  });
});

describe('nestedDifferences', () => {
  it('returns the prefixed fields with the prefix removed', () => {
    const differences = new Set(['area', 'nested.temp', 'nested.factor', 'other.temp']);
    expect([...nestedDifferences<TestLoss['nested']>(differences, 'nested')]).toEqual(['temp', 'factor']);
  });

  it('returns an empty set for undefined differences', () => {
    expect(nestedDifferences(undefined, 'nested').size).toBe(0);
  });
});

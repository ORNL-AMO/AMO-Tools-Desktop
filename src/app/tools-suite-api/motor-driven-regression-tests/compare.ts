export interface ResultDifference {
  path: string;
  before: unknown;
  after: unknown;
  absoluteDelta?: number;
  relativeDelta?: number;
  withinTolerance?: boolean;
}

/** Report every change; the established 1e-6 tolerance is diagnostic, never a filter. */
export function resultDifferences(before: unknown, after: unknown, path = 'result'): ResultDifference[] {
  if (Object.is(before, after)) return [];
  if (typeof before === 'number' && typeof after === 'number') {
    const absoluteDelta = Math.abs(after - before);
    return [{ path, before, after, absoluteDelta,
      relativeDelta: before === 0 ? null : absoluteDelta / Math.abs(before),
      withinTolerance: absoluteDelta <= 1e-6 * Math.max(1, Math.abs(before)) }];
  }
  if (before !== null && after !== null && typeof before === 'object' && typeof after === 'object') {
    if (Array.isArray(before) !== Array.isArray(after)) return [{ path, before, after }];
    if (Array.isArray(before) && Array.isArray(after) && before.length !== after.length) return [{ path, before, after }];
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    return keys.flatMap(key => {
      if (!Object.prototype.hasOwnProperty.call(before, key) || !Object.prototype.hasOwnProperty.call(after, key)) {
        return [{ path: path + '.' + key,
          before: Object.prototype.hasOwnProperty.call(before, key) ? before[key] : { $missing: true },
          after: Object.prototype.hasOwnProperty.call(after, key) ? after[key] : { $missing: true } }];
      }
      return resultDifferences(before[key], after[key], path + '.' + key);
    });
  }
  return [{ path, before, after }];
}

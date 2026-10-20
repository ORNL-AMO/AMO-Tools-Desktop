import { isEqual, isPlainObject } from 'lodash';
import { LossEntity } from './loss-form-list.service';

/** Fields of a loss item whose modification value differs from baseline; nested fields are dot-joined (e.g. `solidChargeMaterial.specificHeat`). */
export type LossFieldDifferences<T> = ReadonlySet<keyof T & string>;

/** Per-item differences keyed by loss item id. */
export type LossDifferences<T> = ReadonlyMap<string, LossFieldDifferences<T>>;

/** Results and labels aren't user inputs, so they never count as a difference. */
const IGNORED_KEYS: ReadonlySet<string> = new Set(['id', 'name', 'heatLoss']);

const isBlank = (value: unknown): boolean => value === null || value === undefined || value === '';

/**
 * Compares effective baseline and modification losses item by item, matching on `id`.
 * Modification items without a baseline match have no differences.
 *
 * @param baseline effective baseline losses of one loss type
 * @param modification effective modification losses of the same loss type
 * @returns differing field names per modification item id
 */
export function getLossDifferences<T extends LossEntity>(baseline: T[] | undefined, modification: T[] | undefined): LossDifferences<T> {
  const baselineById = new Map((baseline ?? []).map(item => [item.id, item]));
  const differences = new Map<string, LossFieldDifferences<T>>();
  for (const item of modification ?? []) {
    const baselineItem = item.id ? baselineById.get(item.id) : undefined;
    if (item.id && baselineItem) {
      differences.set(item.id, new Set(collectDifferences(baselineItem, item)) as LossFieldDifferences<T>);
    }
  }
  return differences;
}

/**
 * Narrows an item's differences to one nested object's fields.
 *
 * @param differences differences of the parent item
 * @param prefix key of the nested object on the parent, e.g. `solidChargeMaterial`
 * @returns the nested object's differing field names, without the prefix
 */
export function nestedDifferences<TNested>(differences: ReadonlySet<string> | undefined, prefix: string): LossFieldDifferences<TNested> {
  const start = `${prefix}.`;
  const nested = [...(differences ?? [])].filter(key => key.startsWith(start)).map(key => key.slice(start.length));
  return new Set(nested) as unknown as LossFieldDifferences<TNested>;
}

function collectDifferences(baseline: object, modification: object, prefix = ''): string[] {
  const keys = new Set([...Object.keys(baseline), ...Object.keys(modification)]);
  const differing: string[] = [];
  for (const key of keys) {
    if (!prefix && IGNORED_KEYS.has(key)) continue;
    const baselineValue = (baseline as Record<string, unknown>)[key];
    const modificationValue = (modification as Record<string, unknown>)[key];
    const path = `${prefix}${key}`;
    if (isPlainObject(baselineValue) && isPlainObject(modificationValue)) {
      differing.push(...collectDifferences(baselineValue as object, modificationValue as object, `${path}.`));
    } else if (!(isBlank(baselineValue) && isBlank(modificationValue)) && !isEqual(baselineValue, modificationValue)) {
      differing.push(path);
    }
  }
  return differing;
}

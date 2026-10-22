import { computed, Signal } from '@angular/core';
import { isEqual, isPlainObject } from 'lodash';
import { AssessmentScenario } from '../../services/process-heating-assessment.service';
import { LossEntity } from './loss-form-list.service';

/** Fields of a loss item whose modification value differs from baseline; nested fields are dot-joined (e.g. `solidChargeMaterial.specificHeat`). */
export type LossFieldDifferences<T> = ReadonlySet<keyof T & string>;

/** Per-item differences keyed by loss item id. */
export type LossDifferences<T> = ReadonlyMap<string, LossFieldDifferences<T>>;

type PlainRecord = Record<string, unknown>;

/** Identity and label aren't field values. Skipped at the top level only: a nested `name` is a real field. `heatLoss` is compared because for 'other' losses it is the user's input. */
const IGNORED_KEYS: ReadonlySet<string> = new Set(['id', 'name']);

const isBlank = (value: unknown): boolean => value === null || value === undefined || value === '';

const NO_DIFFERENCES: LossDifferences<never> = new Map();

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
      differences.set(item.id, new Set(collectDifferences(toRecord(baselineItem), toRecord(item))) as LossFieldDifferences<T>);
    }
  }
  return differences;
}

/**
 * Differences between baseline and a modification, with both sides passed through the same form
 * round trip so defaults a form applies on save (e.g. wall loss `correctionFactor`) don't count as edits.
 * Baseline is normalized independently of the modification so an edit doesn't re-normalize it.
 *
 * @param scenario scenario whose losses are compared against baseline; baseline itself never differs
 * @param readLosses reads the saved losses of a scenario
 * @param normalize rebuilds one loss through its form service, preserving `id` and `heatLoss`
 * @returns differing field names per modification item id, recomputed when either side's losses change
 */
export function createLossDifferences<T extends LossEntity>(
  scenario: Signal<AssessmentScenario>,
  readLosses: (scenario: AssessmentScenario) => T[] | undefined,
  normalize: (loss: T) => T,
): Signal<LossDifferences<T>> {
  const baseline = computed(() => readLosses('baseline')?.map(normalize));
  const modification = computed(() => {
    const current = scenario();
    return current === 'baseline' ? undefined : readLosses(current)?.map(normalize);
  });
  return computed(() => {
    const modified = modification();
    return modified ? getLossDifferences(baseline(), modified) : NO_DIFFERENCES;
  }, { equal: isEqual });
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

const isNestable = (value: unknown): boolean => isPlainObject(value) || isBlank(value);

/** A nested object against a missing one (a type switch) recurses so each of its populated fields is flagged. */
function isNestedPair(baselineValue: unknown, modificationValue: unknown): boolean {
  return isNestable(baselineValue) && isNestable(modificationValue) && (isPlainObject(baselineValue) || isPlainObject(modificationValue));
}

function toRecord(value: unknown): PlainRecord {
  return isPlainObject(value) ? (value as PlainRecord) : {};
}

function collectDifferences(baseline: PlainRecord, modification: PlainRecord, prefix = ''): string[] {
  const keys = new Set([...Object.keys(baseline), ...Object.keys(modification)]);
  const differing: string[] = [];
  for (const key of keys) {
    if (!prefix && IGNORED_KEYS.has(key)) continue;
    const baselineValue = baseline[key];
    const modificationValue = modification[key];
    const path = `${prefix}${key}`;
    if (isNestedPair(baselineValue, modificationValue)) {
      differing.push(...collectDifferences(toRecord(baselineValue), toRecord(modificationValue), `${path}.`));
    } else if (!(isBlank(baselineValue) && isBlank(modificationValue)) && !isEqual(baselineValue, modificationValue)) {
      differing.push(path);
    }
  }
  return differing;
}

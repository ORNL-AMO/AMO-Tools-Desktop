import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import { UnitConversion } from '../../../models/unit-conversion';

const EPSILON = 1e-6;

/**
 * DB-sourced material properties are always stored Imperial. Converts to Metric when the
 * assessment is Metric so a form field can be compared against / patched with the right value.
 */
export function convertDbValue(value: number, unit: UnitConversion, settings: Settings): number {
  if (value == null) return value;
  if (settings?.unitsOfMeasure !== 'Metric') return value;
  return new ConvertValue(value, unit.imperial, unit.metric).convertedValue;
}

/**
 * Inverse of convertDbValue: converts a form value (in the assessment's current units) to the
 * Imperial units the material DB stores, when the assessment is Metric. Used by the "Add New
 * Material" modals when saving a new custom material record.
 */
export function convertForSave(value: number, unit: UnitConversion, settings: Settings): number {
  if (value == null) return value;
  if (settings?.unitsOfMeasure !== 'Metric') return value;
  return new ConvertValue(value, unit.metric, unit.imperial).convertedValue;
}

/** True when a form value has been manually overridden from what the DB record would produce. */
export function differsFromDb(formValue: number, dbConvertedValue: number): boolean {
  if (formValue == null || dbConvertedValue == null) return false;
  return Math.abs(formValue - dbConvertedValue) > EPSILON;
}

/** True when a form value has been manually overridden from the DB-sourced, unit-converted value. */
export function formValueDiffersFromMaterial(formValue: number, dbValue: number | undefined, unit: UnitConversion, settings: Settings): boolean {
  if (dbValue == null) return false;
  return differsFromDb(formValue, convertDbValue(dbValue, unit, settings));
}

/**
 * Rebuilds a DB record for a materialId referenced by a saved assessment that no longer exists
 * in the material database (e.g. a custom material deleted elsewhere), from the numeric property
 * values still stored on the form. Per spec §5, the recovered record is named "Custom Material".
 */
export function rebuildDeletedMaterialRecord<T extends { id?: number; substance?: string; isDefault?: boolean }>(
  materialId: number,
  properties: Omit<T, 'id' | 'substance' | 'isDefault'>
): T {
  return {
    ...properties,
    id: materialId,
    substance: 'Custom Material',
    isDefault: false,
  } as T;
}

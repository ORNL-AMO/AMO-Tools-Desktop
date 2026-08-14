import { UnitConversion } from '../../../models/unit-conversion';

/**
 * Imperial/metric unit-string pairs shared by the gas/liquid/solid charge-material forms and their
 * "Add New Material" modals, for use with convertDbValue/convertForSave.
 */
export const CHARGE_MATERIAL_UNITS: Record<'specificHeat' | 'latentHeat' | 'temperature', UnitConversion> = {
  specificHeat: { imperial: 'btulbF', metric: 'kJkgC' },
  latentHeat: { imperial: 'btuLb', metric: 'kJkg' },
  temperature: { imperial: 'F', metric: 'C' },
};

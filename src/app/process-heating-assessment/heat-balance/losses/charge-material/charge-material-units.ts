import { UnitConversion } from '../../../models/unit-conversion';

export const CHARGE_MATERIAL_UNITS: Record<'specificHeat' | 'latentHeat' | 'temperature', UnitConversion> = {
  specificHeat: { imperial: 'btulbF', metric: 'kJkgC' },
  latentHeat: { imperial: 'btuLb', metric: 'kJkg' },
  temperature: { imperial: 'F', metric: 'C' },
};

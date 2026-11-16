import { ShowResultsCategories } from '../../shared/models/phast/phast';
import { PhastResults } from './phast';

/** Result row flags; Electrical Heat Delivered is split because EAF reports it from a different result field. */
export interface ResultCategories extends ShowResultsCategories {
  showEafElectricalDelivered: boolean;
  showStandardElectricalDelivered: boolean;
}

/**
 * @param categories each scenario's result categories
 * @returns a flag set wherever any scenario sets it, so a table shows every row some column uses
 */
export function combineResultCategories(categories: ResultCategories[]): ResultCategories {
  const [first, ...rest] = categories;
  const combined: ResultCategories = { ...first };
  for (const next of rest) {
    for (const key of Object.keys(next) as (keyof ResultCategories)[]) {
      combined[key] = !!combined[key] || !!next[key];
    }
  }
  return combined;
}

/** One hourly energy loss/use row, shared by the results panel and the Result Data report. */
export interface ResultRowDefinition {
  label: string;
  value: (results: PhastResults) => number | undefined;
  /** Result category the row belongs to; omitted for rows every energy source uses */
  category?: keyof ResultCategories;
  /** Decimals of a percent row; energy rows use the result unit's decimals */
  percentDecimals?: number;
  /** Separator line the results panel draws above or below the row */
  separator?: 'above' | 'below';
  /** The row totals the table */
  isTotal?: boolean;
}

/** One scenario column: its results and the categories its own energy source uses. */
export interface ResultColumn {
  results: PhastResults | undefined;
  categories: ResultCategories;
}

/** In display order; EAF reports Electrical Heat Delivered from a different field than other electric furnaces. */
export const RESULT_ROW_DEFINITIONS: readonly ResultRowDefinition[] = [
  { label: 'Charge Materials', value: results => results.totalChargeMaterialLoss },
  { label: 'Fixtures, trays etc.', value: results => results.totalFixtureLoss },
  { label: 'Wall Losses', value: results => results.totalWallLoss },
  { label: 'Cooling Losses', value: results => results.totalCoolingLoss },
  { label: 'Atmosphere Losses', value: results => results.totalAtmosphereLoss },
  { label: 'Opening Losses', value: results => results.totalOpeningLoss },
  { label: 'Leakage Losses', value: results => results.totalLeakageLoss },
  { label: 'Extended Surface Losses', value: results => results.totalExtSurfaceLoss },
  { label: 'Slag Losses', value: results => results.totalSlag, category: 'showSlag' },
  { label: 'Other Losses', value: results => results.totalOtherLoss, separator: 'below' },
  { label: 'Total Available Heat Required', value: results => results.totalInput },
  { label: 'Available Heat', value: results => results.flueGasAvailableHeat, category: 'showFlueGas', percentDecimals: 1 },
  { label: 'Flue Gas Losses', value: results => results.flueGasSystemLosses, category: 'showFlueGas' },
  { label: 'Exothermic Heat from Process', value: results => results.exothermicHeat },
  { label: 'Fuel Input Available Heat', value: results => results.availableHeatPercent, category: 'showEnInput2', percentDecimals: 0, separator: 'above' },
  { label: 'Exhaust Gas Losses', value: results => results.totalExhaustGas, category: 'showEnInput2' },
  { label: 'Exhaust Gas Losses', value: results => results.totalExhaustGasEAF, category: 'showExGas' },
  { label: 'System Efficiency', value: results => results.heatingSystemEfficiency, category: 'showSystemEff', percentDecimals: 0 },
  { label: 'Total System Losses', value: results => results.totalSystemLosses, category: 'showSystemEff' },
  { label: 'Fuel Heat Delivered', value: results => results.energyInputHeatDelivered, category: 'showHeatDelivered' },
  { label: 'Total Additional Fuel Heat', value: results => results.totalAdditionalFuelHeat, category: 'showEnInput2' },
  { label: 'Electrical Heat Delivered', value: results => results.energyInputHeatDelivered, category: 'showEafElectricalDelivered' },
  { label: 'Chemical Energy Delivered', value: results => results.energyInputTotalChemEnergy, category: 'showChemicalEnergyDelivered' },
  { label: 'Electrical Heat Delivered', value: results => results.electricalHeatDelivered, category: 'showStandardElectricalDelivered', separator: 'above' },
  { label: 'Electrical Heater Losses', value: results => results.electricalHeaterLosses, category: 'showEnInput2' },
  { label: 'Total Provided Electrical Heat', value: results => results.totalProvidedElectricalHeat, category: 'showEnInput2' },
  { label: 'Gross Heat Input', value: results => results.grossHeatInput, separator: 'above', isTotal: true },
];

/**
 * @param categories categories of every column in the table
 * @returns the rows some column's energy source uses
 */
export function visibleResultRows(categories: ResultCategories): ResultRowDefinition[] {
  return RESULT_ROW_DEFINITIONS.filter(row => !row.category || categories[row.category]);
}

/**
 * @param row the result row
 * @param column the scenario column
 * @returns the column's value, or undefined when its energy source doesn't use the row or it has no results
 */
export function resultRowValue(row: ResultRowDefinition, column: ResultColumn): number | undefined {
  const usesRow = !row.category || column.categories[row.category];
  return usesRow && column.results ? row.value(column.results) : undefined;
}

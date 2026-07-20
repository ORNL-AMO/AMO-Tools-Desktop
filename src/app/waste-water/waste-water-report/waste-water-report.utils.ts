import { WasteWaterData, WasteWaterResults } from '../../shared/models/waste-water';
import { getPaybackPeriodMonths } from '../../shared/payback-period.utils';

/**
 * Payback in months for a modification's implementation cost, based on annual aeration cost savings vs baseline.
 */
export function getWasteWaterPaybackPeriod(baseline: WasteWaterResults, modification: WasteWaterData): number {
  const annualCostSavings = (baseline?.AeCost ?? 0) - (modification.outputs?.AeCost ?? 0);
  return getPaybackPeriodMonths(annualCostSavings, modification.operations?.implementationCosts ?? 0);
}

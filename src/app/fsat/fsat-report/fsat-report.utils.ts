import { FSAT, FsatOutput } from '../../shared/models/fans';
import { getPaybackPeriodMonths } from '../../shared/payback-period.utils';

/**
 * Payback in months for a modification's implementation cost, based on annual cost savings vs baseline.
 */
export function getFsatPaybackPeriod(baselineOutputs: FsatOutput, modification: FSAT): number {
  const annualCostSavings = (baselineOutputs?.annualCost ?? 0) - (modification.outputs?.annualCost ?? 0);
  return getPaybackPeriodMonths(annualCostSavings, modification.implementationCosts ?? 0);
}

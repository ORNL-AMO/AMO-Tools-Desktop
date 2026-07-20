import { getPaybackPeriodMonths } from '../../shared/payback-period.utils';

/**
 * Payback in months for a modification's implementation cost, based on annual cost savings vs baseline.
 */
export function getPsatPaybackPeriod(baselineAnnualCost: number, modificationAnnualCost: number, implementationCosts: number): number {
  const annualCostSavings = (baselineAnnualCost ?? 0) - (modificationAnnualCost ?? 0);
  return getPaybackPeriodMonths(annualCostSavings, implementationCosts ?? 0);
}

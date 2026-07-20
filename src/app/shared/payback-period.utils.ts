/**
 * Simple payback period in months: implementation cost recovered via annual cost savings.
 * Returns 0 when there's no implementation cost, or annual savings are too small (<= 1) for a meaningful payback.
 */
export function getPaybackPeriodMonths(annualCostSavings: number, implementationCosts: number): number {
  if (!implementationCosts) return 0;
  if (annualCostSavings <= 1) return 0;
  return (implementationCosts / annualCostSavings) * 12;
}

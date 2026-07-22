/**
 * Ported exactly from ExecutiveSummaryComponent.getPayback(modCost, baselineCost, implementationCost) —
 * including its *1000 (which looks like a possible unit mismatch against the shared getPaybackPeriodMonths
 * util PSAT/waste-water use), preserved intentionally rather than silently fixed.
 */
export function getSsmtPaybackPeriod(modCost: number, baselineCost: number, implementationCost: number): number {
  if (!implementationCost) return 0;
  const paybackMonths = (implementationCost / (baselineCost - modCost)) * 12 * 1000;
  return isNaN(paybackMonths) ? 0 : paybackMonths;
}

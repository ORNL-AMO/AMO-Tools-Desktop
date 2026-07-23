import { WasteWaterData, WasteWaterResults } from './models/waste-water';

/**
 * Simple payback period in months: implementation cost recovered via annual cost savings.
 * Returns 0 when there's no implementation cost, or annual savings are too small (<= 1) for a meaningful payback.
 */
export function getPaybackPeriodMonths(annualCostSavings: number, implementationCosts: number): number {
  if (!implementationCosts) return 0;
  if (annualCostSavings <= 1) return 0;
  return (implementationCosts / annualCostSavings) * 12;
}

/**
 * Payback in months for a modification's implementation cost, based on annual cost savings vs baseline.
 * Shared by PSAT and FSAT — both modules compute payback the same way (baseline annual cost minus
 * modification annual cost, over implementation cost); previously duplicated as
 * getPsatPaybackPeriod/getFsatPaybackPeriod in separate per-module files.
 */
export function getModulePaybackPeriod(baselineAnnualCost: number, modificationAnnualCost: number, implementationCosts: number): number {
  const annualCostSavings = (baselineAnnualCost ?? 0) - (modificationAnnualCost ?? 0);
  return getPaybackPeriodMonths(annualCostSavings, implementationCosts ?? 0);
}

/**
 * Payback in months for a waste-water modification, based on annual aeration cost savings vs baseline.
 */
export function getWasteWaterPaybackPeriod(baseline: WasteWaterResults, modification: WasteWaterData): number {
  const annualCostSavings = (baseline?.AeCost ?? 0) - (modification.outputs?.AeCost ?? 0);
  return getPaybackPeriodMonths(annualCostSavings, modification.operations?.implementationCosts ?? 0);
}

/**
 * Ported exactly from SSMT's ExecutiveSummaryComponent.getPayback(modCost, baselineCost, implementationCost) —
 * including its *1000 (a possible unit mismatch against getPaybackPeriodMonths above), preserved
 * intentionally rather than silently fixed.
 */
export function getSsmtPaybackPeriod(modCost: number, baselineCost: number, implementationCost: number): number {
  if (!implementationCost) return 0;
  const paybackMonths = (implementationCost / (baselineCost - modCost)) * 12 * 1000;
  return isNaN(paybackMonths) ? 0 : paybackMonths;
}

export interface CashFlowForm {
  lifeYears?: number;
  energySavings?: number;
  salvageInput?: number;
  installationCost?: number;
  operationCost?: number;
  otherCost?: number;
  junkCost?: number;
  otherSavings?: number;
}

export interface CashFlowResults {
  benefits?: number;
  cost?: number;
  results?: number;
  payback?: number;
}

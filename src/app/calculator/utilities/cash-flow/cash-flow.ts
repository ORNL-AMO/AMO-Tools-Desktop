export interface CashFlowForm {
  lifeYears?: number;
  energySavings?: number;
  salvageInput?: number;
  installationCost?: number;
  operationCost?: number;
  otherCost?: number;
  junkCost?: number;
  otherSavings?: number;
  discountRate?: number;
  includeTaxes?: number;
  taxRate?: number;
  depreciationMethod?: number;
  advancedCashflows?: Array<number>;
}

export interface AdvancedCashflowData {
  year: number,
  cashflow: number
}

export interface CashFlowResults {
  benefits?: number;
  cost?: number;
  results?: number;
  payback?: number;
}

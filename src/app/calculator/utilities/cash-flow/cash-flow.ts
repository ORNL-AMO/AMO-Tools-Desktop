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

  totalCosts?: number;
  capital?: number;
  operating?: number;
  disposal?: number;
  other?: number;

  totalSavings?: number;
  energy?: number;
  otherCashFlow?: number;
  salvage?: number;

  netPresentValue?: number;
  annualWorth?: number;
  payback?: number;
  sir?: number;
  irr?: number;
  roi?: number;
}

export interface CashFlowOutputs {
  capitalExpenditures: number;
  energySavings: number;
  salvage: number;
  operationCost: number;
  disposal: number;
  otherCashFlow: number;
}

export interface WithoutTaxesOutputs {
  cashFlowOutputs: CashFlowOutputs;
  net: number;
  simplePayback: number;
  simplePaybackWithCostsSavings: number;
  sir: number;
  roi: number;
  interestRate: number;
  nvp: number;
  irr: number;
  
}

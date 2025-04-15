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
  
  payback?: number;
}

export interface CashFlowFinalResults {
  netPresentValue: number;
  annualWorth: number;
  payback: number;
  sir: number;
  irr: number;
  roi: number;
}



export interface Outputs {
  cashFlowOutputs: Array<CashFlowOutputs>;
  totalOutputs: CashFlowOutputs;
}

export interface CashFlowOutputs {
  cashFlow?: number;
  capitalExpenditures?: number;
  energySavings?: number;
  salvage?: number;
  operationCost?: number;
  disposal?: number;
  otherCashFlow?: number;
  total?: number;
}

export interface WithoutTaxesOutputs {
  cashFlowOutputs: CashFlowOutputs;
  net: number;
  simplePayback?: number;
  simplePaybackWithCostsSavings?: number;
  sir?: number;
  roi?: number;
  interestRate: number;
  nvp: number;
  irr?: number;
}

export interface BruteForceResult {
  interestRate: number;
  results: Array<number>;
  total: number;
  continueA: number;
  iterationA: number;
  continueB: number;
  iterationB: number;
}

export interface CashFlowOutputsAndResults {
  yearlyCashFlowOutputs: Outputs;
  presentValueCashFlowOutputs: Outputs;
  withoutTaxesPresentValueOutputs: WithoutTaxesOutputs;
  withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs;
  bruteForceResults: Array<BruteForceResult>;
  presentValueCashFlowResults: CashFlowResults;
  annualWorthCashFlowResults: CashFlowResults;
  cashFlowFianlResults: CashFlowFinalResults;
}



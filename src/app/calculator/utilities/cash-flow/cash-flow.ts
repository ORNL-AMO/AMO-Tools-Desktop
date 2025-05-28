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
  otherCosts?: number;

  totalSavings?: number;
  energy?: number;
  otherSavings?: number;
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
  otherSavings?: number;
  otherCosts?: number;
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

export interface IRRBruteForceResults {
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
  irrBruteForceResults: Array<IRRBruteForceResults>;
  presentValueCashFlowResults: CashFlowResults;
  annualWorthCashFlowResults: CashFlowResults;
  cashFlowFinalResults: CashFlowFinalResults;
}

export const InterestRates: Array<number> = [
  0,
  0.005,
  0.01,
  0.015,
  0.02,
  0.025,
  0.03,
  0.035,
  0.04,
  0.045,
  0.05,
  0.0525,
  0.054,
  0.055,
  0.06,
  0.065,
  0.07,
  0.075,
  0.08,
  0.085,
  0.09,
  0.095,
  0.1,
  0.105,
  0.11,
  0.115,
  0.12,
  0.125,
  0.13,
  0.135,
  0.14,
  0.145,
  0.15,
  0.155,
  0.16,
  0.165,
  0.17,
  0.175,
  0.18,
  0.185,
  0.19,
  0.195,
  0.2,
  0.205,
  0.21,
  0.215,
  0.22,
  0.225,
  0.23,
  0.235,
  0.24,
  0.245,
  0.25,
  0.255,
  0.26,
  0.265,
  0.27,
  0.275,
  0.28,
  0.285,
  0.29,
  0.295,
  0.3,
  0.305,
  0.31,
  0.315,
  0.32,
  0.325,
  0.33,
  0.335,
  0.34,
  0.345,
  0.35,
]



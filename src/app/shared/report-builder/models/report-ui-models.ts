export interface CurrencyPipeParams {
  code?: string;
  display?: 'symbol' | 'code' | 'name';
  digitsInfo?: string;
}

export interface ReportColumnCell {
  value: string | number;
  decimalPipe?: string;
  currencyPipe?: CurrencyPipeParams;
}

export interface ReportTableRow {
  label: string;
  units?: string;
  className?: 'default' | 'emphasis';
  /** Optional rendering hint: a savings graph, or a cell whose string value holds one item per line */
  display?: 'percent-graph' | 'list';
  baseline: ReportColumnCell;
  modifications: Array<ReportColumnCell>;
}

export interface PercentSavings {
  id: string;
  value: number | null;
}

export interface ModificationNameCell {
  id: string;
  name: string;
}

export interface ReportColumnCell {
  value: string | number;
  decimalPipe?: string; 
  currencyPipe?: CurrencyPipeParams;
}

export interface InputSummarySection {
  label: string;
  rows: ReportTableRow[];
}

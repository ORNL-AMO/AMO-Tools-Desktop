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

import { CurrencyPipeParams } from "../../shared/pipes/report-table-cell.pipe";

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

export interface ReportColumnCell {
  value: string | number;
  decimalPipe?: string; 
  currencyPipe?: CurrencyPipeParams;
}

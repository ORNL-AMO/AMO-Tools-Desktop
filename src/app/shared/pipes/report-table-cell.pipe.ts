import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe, DecimalPipe  } from '@angular/common';
import { ReportColumnCell } from '../../process-cooling-assessment/report/report-ui-models';

/**
 * Pipe for outputting MEASUR standard table cell formatting.
 * If the value is null or undefined, it returns a placeholder '— —'.
 */
@Pipe({
  name: 'reportTableCell',
  standalone: true
})
export class ReportTableCellPipe implements PipeTransform {
  private numberPipe = new DecimalPipe('en-US');
  private currencyPipe = new CurrencyPipe('en-US');

  transform(cell: ReportColumnCell): string | number {
    const value = cell?.value ?? null;
    if (typeof cell?.decimalPipe === 'string' && value !== null && value !== undefined) {
      return this.numberPipe.transform(value, cell.decimalPipe || '1.0-0');
    } else if (value !== null && value !== undefined) {
      return this.currencyPipe.transform(value, 'USD', 'symbol', '1.0-0');
    } else {
      return value ?? '— —';
    }
  }
}

export interface CurrencyPipeParams {
  code?: string;
  display?: 'symbol' | 'code' | 'name';
  digitsInfo?: string;
}

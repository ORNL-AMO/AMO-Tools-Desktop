import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compressedAirInventorySummaryTable',
  standalone: false
})
export class CompressedAirInventorySummaryTablePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

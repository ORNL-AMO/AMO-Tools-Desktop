import { Pipe, PipeTransform } from '@angular/core';
import { SummaryCompressedAirData } from '../compressed-air-inventory-summary.service';
import _ from 'lodash';

@Pipe({
  name: 'compressedAirInventorySummaryTable',
  standalone: false
})
export class CompressedAirInventorySummaryTablePipe implements PipeTransform {

  transform(compressedAirData: Array<Array<SummaryCompressedAirData>>, sortBy: string, direction: string): Array<Array<SummaryCompressedAirData>> {
    let sortedData: Array<Array<SummaryCompressedAirData>> = _.orderBy(compressedAirData, (compressedAirItem) => {
      let findFieldEntry = compressedAirItem.find(d => d.fieldStr == sortBy);
      if (findFieldEntry) {
        return findFieldEntry.value;
      } else {
        return undefined;
      }
    }, direction);
    return sortedData;
  }

}

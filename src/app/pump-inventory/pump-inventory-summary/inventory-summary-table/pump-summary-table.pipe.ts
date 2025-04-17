import { Pipe, PipeTransform } from '@angular/core';
import { SummaryPumpData } from '../pump-inventory-summary.service';
import * as _ from 'lodash';

@Pipe({
    name: 'pumpSummaryTable',
    standalone: false
})
export class PumpSummaryTablePipe implements PipeTransform {

  transform(pumpData: Array<Array<SummaryPumpData>>, sortBy: string, direction: string): Array<Array<SummaryPumpData>> {
    let sortedData: Array<Array<SummaryPumpData>> = _.orderBy(pumpData, (pumpItem) => {
      let findFieldEntry = pumpItem.find(d => d.fieldStr == sortBy);
      if (findFieldEntry) {
        return findFieldEntry.value;
      } else {
        return undefined;
      }
    }, direction);
    return sortedData;
  }

}

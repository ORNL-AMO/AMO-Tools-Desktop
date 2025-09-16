import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { SummaryMotorData } from './inventory-summary-table.service';

@Pipe({
    name: 'motorSummaryTable',
    pure: false,
    standalone: false
})
export class MotorSummaryTablePipe implements PipeTransform {

  transform(motorData: Array<Array<SummaryMotorData>>, sortBy: string, direction: string): Array<Array<SummaryMotorData>> {
    let sortedData: Array<Array<SummaryMotorData>> = _.orderBy(motorData, (motorItem) => {
      let findFieldEntry = motorItem.find(d => d.fieldStr == sortBy);
      if (findFieldEntry) {
        return findFieldEntry.value;
      } else {
        return undefined;
      }
    }, direction);
    return sortedData;
  }

}

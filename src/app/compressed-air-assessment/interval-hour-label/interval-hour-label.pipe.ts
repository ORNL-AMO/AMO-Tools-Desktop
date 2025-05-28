import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'intervalHourLabel',
    standalone: false
})
export class IntervalHourLabelPipe implements PipeTransform {

  transform(intervalVal: number): string {
    let splitInterval: Array<string> = intervalVal.toString().split('.');
    if (splitInterval.length > 1) {
      if (intervalVal !== 0) {
        if (splitInterval[1] == '25') {
          return splitInterval[0] + ':15';
        } else if (splitInterval[1] == '5') {
          return splitInterval[0] + ':30';
        } else if (splitInterval[1] == '75') {
          return splitInterval[0] + ':45';
        }
      }
    } else {
      return intervalVal + ':00';
    }
  }

}

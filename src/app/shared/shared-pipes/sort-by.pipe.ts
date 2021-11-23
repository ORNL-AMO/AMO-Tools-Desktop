import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
@Pipe({
  name: 'sortBy',
  pure: false
})
export class SortByPipe implements PipeTransform {

  transform(data: Array<any>, sortByValue: string, direction?: string): Array<any> {
    if (!direction) {
      direction = 'desc';
    }
    return _.orderBy(data, sortByValue, direction);
  }

}

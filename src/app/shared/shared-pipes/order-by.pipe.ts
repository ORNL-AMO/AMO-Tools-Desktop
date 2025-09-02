import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'orderBy',
    pure: false,
    standalone: true
})
export class OrderByPipe implements PipeTransform {

  transform(data: Array<any>, orderDataBy: string, orderDirection?: string): Array<any> {
    if (!orderDirection) {
      orderDirection = 'desc';
    }
    return _.orderBy(data, orderDataBy, orderDirection)
  }

}

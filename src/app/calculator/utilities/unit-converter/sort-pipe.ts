/**
 * Created by qpk on 6/21/17.
 */
import {Pipe} from '@angular/core';
@Pipe({name: "sortBy"})
export class SortPipe {
  transform(array: Array<string>, args: string): Array<string> {
    array.sort((a: any, b: any) => {
      if ( a[args] < b[args] ){
        return -1;
      }else if( a[args] > b[args] ){
        return 1;
      }else{
        return 0;
      }
    });
    return array;
  }
}

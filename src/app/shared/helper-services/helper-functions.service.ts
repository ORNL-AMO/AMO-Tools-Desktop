import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

// todo move to non ng service file
@Injectable()
export class HelperFunctionsService {

  constructor() { }

  copyObject(object) {
    return cloneDeep(object);
  }

  roundVal(val: number, places: number): number {
    let rounded = Number(val.toFixed(places));
    return rounded;
  }

  truncate(text: string, specifiedLimit?: number) {
    let limit = specifiedLimit? specifiedLimit : 50;
    if (text.length > limit) {
      return text.slice(0, limit) + '...'
    } else {
      return text;
    }
  }

  getNewIdString() {
   return Math.random().toString(36).substr(2, 9);
  }
}

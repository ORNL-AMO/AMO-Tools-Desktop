import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable()
export class HelperFunctionsService {

  constructor() { }

  copyObject(object) {
    return cloneDeep(object);
  }

  truncate(text: string, specifiedLimit?: number) {
    let limit = specifiedLimit? specifiedLimit : 50;
    if (text.length > limit) {
      return text.slice(0, limit) + '...'
    } else {
      return text;
    }
  }
}

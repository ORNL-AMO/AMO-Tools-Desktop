import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable()
export class HelperFunctionsService {

  constructor() { }

  copyObject(object) {
    return cloneDeep(object);
  }
}

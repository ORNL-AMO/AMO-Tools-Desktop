import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class TreasureChestMenuService {

  selectAll: BehaviorSubject<boolean>
  constructor() {
    this.selectAll = new BehaviorSubject<boolean>(false);
   }
}

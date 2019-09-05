import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class TreasureChestMenuService {

  selectAll: BehaviorSubject<boolean>
  sortBy: BehaviorSubject<string>;
  constructor() {
    this.selectAll = new BehaviorSubject<boolean>(false);
    this.sortBy = new BehaviorSubject<string>('annualCostSavings');
   }
}

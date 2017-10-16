import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class HeatSystemEfficiencyCompareService {
  baseline: PHAST;
  modification: PHAST;

  differentObject: EfficiencyDifferentObject
  constructor() { }

  initCompareObjects() {
    if (this.baseline && this.modification) {
      this.differentObject = this.initDifferentObject();
      this.checkDifferent();
    }
  }

  checkDifferent() {
    if (this.baseline && this.modification) {
      this.differentObject.efficiency.next(this.compare(this.baseline.systemEfficiency, this.modification.systemEfficiency))
    } else {
      this.disableAll();
    }
  }

  disableAll() {
    this.differentObject.efficiency.next(false);
  }

  initDifferentObject(): EfficiencyDifferentObject {
    let object: EfficiencyDifferentObject = {
      efficiency: new BehaviorSubject<boolean>(null)
    }
    return object;
  }

  compare(a: any, b: any) {
    //if both exist
    if (a && b) {
      //compare
      if (a != b) {
        //not equal
        return true;
      } else {
        //equal
        return false;
      }
    }
    //check one exists
    else if ((a && !b) || (!a && b)) {
      //not equal
      return true
    } else {
      //equal
      return false;
    }
  }

}
export interface EfficiencyDifferentObject {
  efficiency: BehaviorSubject<boolean>;
}
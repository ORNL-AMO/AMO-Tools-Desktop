import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class HeatSystemEfficiencyCompareService {
  baseline: PHAST;
  modification: PHAST;

  constructor() { }
  compareEfficiency(){
    if(this.baseline && this.modification){
      return this.compare(this.baseline.systemEfficiency, this.modification.systemEfficiency)
    }
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
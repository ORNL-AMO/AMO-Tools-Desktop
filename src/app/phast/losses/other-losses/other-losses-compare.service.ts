import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OtherLoss } from '../../../shared/models/losses/otherLoss';

@Injectable()
export class OtherLossesCompareService {

  baselineOtherLoss: OtherLoss[];
  modifiedOtherLoss: OtherLoss[];

  //used to hold behavior subjects for each modification
  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineOtherLoss && this.modifiedOtherLoss) {
      if (this.baselineOtherLoss.length == this.modifiedOtherLoss.length) {
        let numLosses = this.baselineOtherLoss.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkOtherLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  initDifferentObject(): OtherLossDifferent {
    let tmpDifferent: OtherLossDifferent = {
      description: new BehaviorSubject<boolean>(null),
      heatLoss: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }

  checkOtherLosses() {
    if (this.baselineOtherLoss && this.modifiedOtherLoss) {
      if (this.baselineOtherLoss.length != 0 && this.modifiedOtherLoss.length != 0 && this.baselineOtherLoss.length == this.modifiedOtherLoss.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //description
          this.differentArray[lossIndex].different.description.next(this.compare(this.baselineOtherLoss[lossIndex].description, this.modifiedOtherLoss[lossIndex].description));
          //heatLoss
          this.differentArray[lossIndex].different.heatLoss.next(this.compare(this.baselineOtherLoss[lossIndex].heatLoss, this.modifiedOtherLoss[lossIndex].heatLoss));
        }
      } else {
        this.disableAll();
      }
    } else {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.motorPhase.next(false);
      this.differentArray[lossIndex].different.heatLoss.next(false);
    }
  }
  compare(a: any, b: any) {
    if (a && b) {
      if (a != b) {
        return true;
      } else {
        return false;
      }
    }
    else if ((a && !b) || (!a && b)) {
      return true
    } else {
      return false;
    }
  }
}


export interface OtherLossDifferent {
  description: BehaviorSubject<boolean>,
  heatLoss: BehaviorSubject<boolean>
}
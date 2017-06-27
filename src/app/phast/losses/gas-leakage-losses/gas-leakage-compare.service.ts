import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LeakageLoss } from "../../../shared/models/losses/leakageLoss";
@Injectable()
export class GasLeakageCompareService {
  baselineLeakageLoss: LeakageLoss[];
  modifiedLeakageLoss: LeakageLoss[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      if (this.baselineLeakageLoss.length == this.baselineLeakageLoss.length) {
        let numLosses = this.baselineLeakageLoss.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkLeakageLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): GasLeakageDifferent {
    let tmpDifferent = {
      draftPressure: new BehaviorSubject<boolean>(null),
      openingArea: new BehaviorSubject<boolean>(null),
      leakageGasTemperature: new BehaviorSubject<boolean>(null),
      ambientTemperature: new BehaviorSubject<boolean>(null),
      specificGravity: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  checkLeakageLosses() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      if (this.baselineLeakageLoss.length != 0 && this.modifiedLeakageLoss.length != 0) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //draftPressure
          this.differentArray[lossIndex].different.draftPressure.next(this.compare(this.baselineLeakageLoss[lossIndex].draftPressure, this.modifiedLeakageLoss[lossIndex].draftPressure));
          //openingArea
          this.differentArray[lossIndex].different.openingArea.next(this.compare(this.baselineLeakageLoss[lossIndex].openingArea, this.modifiedLeakageLoss[lossIndex].openingArea));
          //leakageGasTemperature
          this.differentArray[lossIndex].different.leakageGasTemperature.next(this.compare(this.baselineLeakageLoss[lossIndex].leakageGasTemperature, this.modifiedLeakageLoss[lossIndex].leakageGasTemperature));
          //ambientTemperature
          this.differentArray[lossIndex].different.ambientTemperature.next(this.compare(this.baselineLeakageLoss[lossIndex].ambientTemperature, this.modifiedLeakageLoss[lossIndex].ambientTemperature));
          //specificGravity
          this.differentArray[lossIndex].different.specificGravity.next(this.compare(this.baselineLeakageLoss[lossIndex].specificGravity, this.modifiedLeakageLoss[lossIndex].specificGravity));
        }
      } else {
        this.disableAll();
      }
    }
    else if ((this.baselineLeakageLoss && !this.modifiedLeakageLoss) || (!this.baselineLeakageLoss && this.modifiedLeakageLoss)) {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.draftPressure.next(false);
      this.differentArray[lossIndex].different.openingArea.next(false);
      this.differentArray[lossIndex].different.leakageGasTemperature.next(false);
      this.differentArray[lossIndex].different.ambientTemperature.next(false);
      this.differentArray[lossIndex].different.specificGravity.next(false);
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

export interface GasLeakageDifferent {
  draftPressure: BehaviorSubject<boolean>,
  openingArea: BehaviorSubject<boolean>,
  leakageGasTemperature: BehaviorSubject<boolean>,
  ambientTemperature: BehaviorSubject<boolean>,
  //coefficient: BehaviorSubject<boolean>,
  specificGravity: BehaviorSubject<boolean>,
  // correctionFactor: BehaviorSubject<boolean>,
  // heatLoss: BehaviorSubject<boolean>
}
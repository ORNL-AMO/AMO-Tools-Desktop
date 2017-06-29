import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExhaustGas } from '../../../shared/models/losses/exhaustGas';

@Injectable()
export class ExhaustGasCompareService {

  baselineExhaustGasLosses: ExhaustGas[];
  modifiedExhaustGasLosses: ExhaustGas[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineExhaustGasLosses && this.modifiedExhaustGasLosses) {
      if (this.baselineExhaustGasLosses.length == this.modifiedExhaustGasLosses.length) {
        let numLosses = this.baselineExhaustGasLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject(this.baselineExhaustGasLosses[i].otherLossObjects.length)
          })
        }
        //this.checkFixtureLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(numOther: number): ExhaustGasDifferent {
    let tmpBehaviorArray = new Array<BehaviorSubject<boolean>>();
    for (let i = 0; i < numOther; i++) {
      tmpBehaviorArray.push(new BehaviorSubject<boolean>(null));
    }

    let tmpDifferent: ExhaustGasDifferent = {
      cycleTime: new BehaviorSubject<boolean>(null),
      offGasTemp: new BehaviorSubject<boolean>(null),
      CO: new BehaviorSubject<boolean>(null),
      O2: new BehaviorSubject<boolean>(null),
      H2: new BehaviorSubject<boolean>(null),
      CO2: new BehaviorSubject<boolean>(null),
      combustibleGases: new BehaviorSubject<boolean>(null),
      vfr: new BehaviorSubject<boolean>(null),
      dustLoading: new BehaviorSubject<boolean>(null),
      otherLossObjects: tmpBehaviorArray,
      otherLosses: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
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

export interface ExhaustGasDifferent {
  cycleTime: BehaviorSubject<boolean>,
  offGasTemp: BehaviorSubject<boolean>,
  CO: BehaviorSubject<boolean>,
  O2: BehaviorSubject<boolean>,
  H2: BehaviorSubject<boolean>,
  CO2: BehaviorSubject<boolean>,
  combustibleGases: BehaviorSubject<boolean>,
  vfr: BehaviorSubject<boolean>,
  dustLoading: BehaviorSubject<boolean>,
  otherLossObjects: Array<BehaviorSubject<boolean>>,
  otherLosses: BehaviorSubject<boolean>
}

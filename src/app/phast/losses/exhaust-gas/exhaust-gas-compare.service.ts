import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';

@Injectable()
export class ExhaustGasCompareService {

  baselineExhaustGasLosses: ExhaustGasEAF[];
  modifiedExhaustGasLosses: ExhaustGasEAF[];

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
            different: this.initDifferentObject()
          })
        }
        this.checkExhaustGasLosses();
      }
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }


  initDifferentObject(): ExhaustGasDifferent {
    let tmpDifferent: ExhaustGasDifferent = {
      offGasTemp: new BehaviorSubject<boolean>(null),
      CO: new BehaviorSubject<boolean>(null),
      H2: new BehaviorSubject<boolean>(null),
      combustibleGases: new BehaviorSubject<boolean>(null),
      vfr: new BehaviorSubject<boolean>(null),
      dustLoading: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  checkExhaustGasLosses() {
    if (this.baselineExhaustGasLosses && this.modifiedExhaustGasLosses) {
      if (this.baselineExhaustGasLosses.length != 0 && this.modifiedExhaustGasLosses.length != 0 && this.baselineExhaustGasLosses.length == this.modifiedExhaustGasLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //offGasTemp
          this.differentArray[lossIndex].different.offGasTemp.next(this.compare(this.baselineExhaustGasLosses[lossIndex].offGasTemp, this.modifiedExhaustGasLosses[lossIndex].offGasTemp));
          //CO
          this.differentArray[lossIndex].different.CO.next(this.compare(this.baselineExhaustGasLosses[lossIndex].CO, this.modifiedExhaustGasLosses[lossIndex].CO));
          //H2
          this.differentArray[lossIndex].different.H2.next(this.compare(this.baselineExhaustGasLosses[lossIndex].H2, this.modifiedExhaustGasLosses[lossIndex].H2));
          //combustibleGases
          this.differentArray[lossIndex].different.combustibleGases.next(this.compare(this.baselineExhaustGasLosses[lossIndex].combustibleGases, this.modifiedExhaustGasLosses[lossIndex].combustibleGases));
          //vfr
          this.differentArray[lossIndex].different.vfr.next(this.compare(this.baselineExhaustGasLosses[lossIndex].vfr, this.modifiedExhaustGasLosses[lossIndex].vfr));
          //dustLoading
          this.differentArray[lossIndex].different.dustLoading.next(this.compare(this.baselineExhaustGasLosses[lossIndex].dustLoading, this.modifiedExhaustGasLosses[lossIndex].dustLoading));
        }
      } else {
        this.disableAll()
      }
    } else {
      this.disableAll()
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.offGasTemp.next(false);
      this.differentArray[lossIndex].different.CO.next(false);
      this.differentArray[lossIndex].different.H2.next(false);
      this.differentArray[lossIndex].different.combustibleGases.next(false);
      this.differentArray[lossIndex].different.vfr.next(false);
      this.differentArray[lossIndex].different.dustLoading.next(false);
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

export interface ExhaustGasDifferent {
  offGasTemp: BehaviorSubject<boolean>,
  CO: BehaviorSubject<boolean>,
  H2: BehaviorSubject<boolean>,
  combustibleGases: BehaviorSubject<boolean>,
  vfr: BehaviorSubject<boolean>,
  dustLoading: BehaviorSubject<boolean>,
}

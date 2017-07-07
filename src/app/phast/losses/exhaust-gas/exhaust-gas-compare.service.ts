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
        this.checkExhaustGasLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject(1)
    })
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
      otherLossObjects: tmpBehaviorArray
    }
    return tmpDifferent;
  }

  checkExhaustGasLosses() {
    if (this.baselineExhaustGasLosses && this.modifiedExhaustGasLosses) {
      if (this.baselineExhaustGasLosses.length != 0 && this.modifiedExhaustGasLosses.length != 0 && this.baselineExhaustGasLosses.length == this.modifiedExhaustGasLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //cycleTime
          this.differentArray[lossIndex].different.cycleTime.next(this.compare(this.baselineExhaustGasLosses[lossIndex].cycleTime, this.modifiedExhaustGasLosses[lossIndex].cycleTime));
          //offGasTemp
          this.differentArray[lossIndex].different.offGasTemp.next(this.compare(this.baselineExhaustGasLosses[lossIndex].offGasTemp, this.modifiedExhaustGasLosses[lossIndex].offGasTemp));
          //CO
          this.differentArray[lossIndex].different.CO.next(this.compare(this.baselineExhaustGasLosses[lossIndex].CO, this.modifiedExhaustGasLosses[lossIndex].CO));
          //O2
          this.differentArray[lossIndex].different.O2.next(this.compare(this.baselineExhaustGasLosses[lossIndex].O2, this.modifiedExhaustGasLosses[lossIndex].O2));
          //H2
          this.differentArray[lossIndex].different.H2.next(this.compare(this.baselineExhaustGasLosses[lossIndex].H2, this.modifiedExhaustGasLosses[lossIndex].H2));
          //CO2
          this.differentArray[lossIndex].different.CO2.next(this.compare(this.baselineExhaustGasLosses[lossIndex].CO2, this.modifiedExhaustGasLosses[lossIndex].CO2));
          //combustibleGases
          this.differentArray[lossIndex].different.combustibleGases.next(this.compare(this.baselineExhaustGasLosses[lossIndex].combustibleGases, this.modifiedExhaustGasLosses[lossIndex].combustibleGases));
          //vfr
          this.differentArray[lossIndex].different.vfr.next(this.compare(this.baselineExhaustGasLosses[lossIndex].vfr, this.modifiedExhaustGasLosses[lossIndex].vfr));
          //dustLoading
          this.differentArray[lossIndex].different.dustLoading.next(this.compare(this.baselineExhaustGasLosses[lossIndex].dustLoading, this.modifiedExhaustGasLosses[lossIndex].dustLoading));
          //otherLossObjects
          let i = 0;
          this.differentArray[lossIndex].different.otherLossObjects.forEach(obj => {
            obj.next(this.compare(this.baselineExhaustGasLosses[lossIndex].otherLossObjects[i], this.modifiedExhaustGasLosses[lossIndex].otherLossObjects[i]));
            i++;
          });
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
      this.differentArray[lossIndex].different.cycleTime.next(false);
      this.differentArray[lossIndex].different.offGasTemp.next(false);
      this.differentArray[lossIndex].different.CO.next(false);
      this.differentArray[lossIndex].different.O2.next(false);
      this.differentArray[lossIndex].different.H2.next(false);
      this.differentArray[lossIndex].different.CO2.next(false);
      this.differentArray[lossIndex].different.combustibleGases.next(false);
      this.differentArray[lossIndex].different.vfr.next(false);
      this.differentArray[lossIndex].different.dustLoading.next(false);
      let i = 0;
      this.differentArray[lossIndex].different.otherLossObjects.forEach(obj => {
        obj.next(false);
        i++;
      });
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
  cycleTime: BehaviorSubject<boolean>,
  offGasTemp: BehaviorSubject<boolean>,
  CO: BehaviorSubject<boolean>,
  O2: BehaviorSubject<boolean>,
  H2: BehaviorSubject<boolean>,
  CO2: BehaviorSubject<boolean>,
  combustibleGases: BehaviorSubject<boolean>,
  vfr: BehaviorSubject<boolean>,
  dustLoading: BehaviorSubject<boolean>,
  otherLossObjects: Array<BehaviorSubject<boolean>>
}

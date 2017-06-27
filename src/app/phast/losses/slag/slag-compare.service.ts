import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Slag } from '../../../shared/models/losses/slag';

@Injectable()
export class SlagCompareService {

  baselineSlag: Slag[];
  modifiedSlag: Slag[];

  //used to hold behavior subjects for each modification
  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineSlag && this.modifiedSlag) {
      if (this.baselineSlag.length == this.modifiedSlag.length) {
        let numLosses = this.baselineSlag.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkSlagLosses();
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

  checkSlagLosses() {
    if (this.baselineSlag && this.modifiedSlag) {
      if (this.baselineSlag.length != 0 && this.modifiedSlag.length != 0) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //weight
          this.differentArray[lossIndex].different.weight.next(this.compare(this.baselineSlag[lossIndex].weight, this.modifiedSlag[lossIndex].weight));
          //inletTemperature
          this.differentArray[lossIndex].different.inletTemperature.next(this.compare(this.baselineSlag[lossIndex].inletTemperature, this.modifiedSlag[lossIndex].inletTemperature));
          //outletTemperature
          this.differentArray[lossIndex].different.outletTemperature.next(this.compare(this.baselineSlag[lossIndex].outletTemperature, this.modifiedSlag[lossIndex].outletTemperature));
          //specificHeat
          this.differentArray[lossIndex].different.specificHeat.next(this.compare(this.baselineSlag[lossIndex].specificHeat, this.modifiedSlag[lossIndex].specificHeat));
          //correctionFactor
          this.differentArray[lossIndex].different.correctionFactor.next(this.compare(this.baselineSlag[lossIndex].correctionFactor, this.modifiedSlag[lossIndex].correctionFactor));
        }
      } else {
        this.disableAll();
      }
    }
    else if ((this.baselineSlag && !this.modifiedSlag) || (!this.baselineSlag && this.modifiedSlag)) {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.weight.next(false);
      this.differentArray[lossIndex].different.inletTemperature.next(false);
      this.differentArray[lossIndex].different.outletTemperature.next(false);
      this.differentArray[lossIndex].different.specificHeat.next(false);
      this.differentArray[lossIndex].different.correctionFactor.next(false);
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

  initDifferentObject(): SlagDifferent {
    let tmpDifferent: SlagDifferent = {
      weight: new BehaviorSubject<boolean>(null),
      inletTemperature: new BehaviorSubject<boolean>(null),
      outletTemperature: new BehaviorSubject<boolean>(null),
      specificHeat: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }
}

export interface SlagDifferent {
  weight: BehaviorSubject<boolean>,
  inletTemperature: BehaviorSubject<boolean>,
  outletTemperature: BehaviorSubject<boolean>,
  specificHeat: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>
}

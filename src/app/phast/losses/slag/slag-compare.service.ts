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

  checkSlagLosses() {
    this.checkWeight();
    this.checkInletTemperature();
    this.checkOutletTemperature();
    this.checkSpecificHeat();
    this.checkCorrectionFactor();
  }

  //weight
  checkWeight() {
    if (this.baselineSlag && this.modifiedSlag) {
      for (let lossIndex = 0; lossIndex < this.baselineSlag.length; lossIndex++) {
        if (this.baselineSlag[lossIndex].weight != this.modifiedSlag[lossIndex].weight) {
          this.differentArray[lossIndex].different.weight.next(true);
        } else {
          this.differentArray[lossIndex].different.weight.next(false);
        }
      }
    }
  }
  //inletTemperature
  checkInletTemperature() {
    if (this.baselineSlag && this.modifiedSlag) {
      for (let lossIndex = 0; lossIndex < this.baselineSlag.length; lossIndex++) {
        if (this.baselineSlag[lossIndex].inletTemperature != this.modifiedSlag[lossIndex].inletTemperature) {
          this.differentArray[lossIndex].different.inletTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.inletTemperature.next(false);
        }
      }
    }
  }
  //outletTemperature
  checkOutletTemperature() {
    if (this.baselineSlag && this.modifiedSlag) {
      for (let lossIndex = 0; lossIndex < this.baselineSlag.length; lossIndex++) {
        if (this.baselineSlag[lossIndex].outletTemperature != this.modifiedSlag[lossIndex].outletTemperature) {
          this.differentArray[lossIndex].different.outletTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.outletTemperature.next(false);
        }
      }
    }
  }
  //specificHeat
  checkSpecificHeat() {
    if (this.baselineSlag && this.modifiedSlag) {
      for (let lossIndex = 0; lossIndex < this.baselineSlag.length; lossIndex++) {
        if (this.baselineSlag[lossIndex].specificHeat != this.modifiedSlag[lossIndex].specificHeat) {
          this.differentArray[lossIndex].different.specificHeat.next(true);
        } else {
          this.differentArray[lossIndex].different.specificHeat.next(false);
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactor() {
    if (this.baselineSlag && this.modifiedSlag) {
      for (let lossIndex = 0; lossIndex < this.baselineSlag.length; lossIndex++) {
        if (this.baselineSlag[lossIndex].correctionFactor != this.modifiedSlag[lossIndex].correctionFactor) {
          this.differentArray[lossIndex].different.correctionFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.correctionFactor.next(false);
        }
      }
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

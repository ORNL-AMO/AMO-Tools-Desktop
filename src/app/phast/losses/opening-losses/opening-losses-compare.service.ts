import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';

@Injectable()
export class OpeningLossesCompareService {
  baselineOpeningLosses: OpeningLoss[];
  modifiedOpeningLosses: OpeningLoss[];

  //used to hold behavior subjects for each modification
  differentArray: Array<any>;

  constructor() { }


  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      if (this.baselineOpeningLosses.length == this.modifiedOpeningLosses.length) {
        let numLosses = this.baselineOpeningLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkOpeningLosses();
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


  checkOpeningLosses() {
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      if (this.baselineOpeningLosses.length != 0 && this.modifiedOpeningLosses.length != 0) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //numberOfOpenings
          this.differentArray[lossIndex].different.numberOfOpenings.next(this.compare(this.baselineOpeningLosses[lossIndex].numberOfOpenings, this.modifiedOpeningLosses[lossIndex].numberOfOpenings));
          //emissivity
          this.differentArray[lossIndex].different.emissivity.next(this.compare(this.baselineOpeningLosses[lossIndex].emissivity, this.modifiedOpeningLosses[lossIndex].emissivity));
          //thickness
          this.differentArray[lossIndex].different.thickness.next(this.compare(this.baselineOpeningLosses[lossIndex].thickness, this.modifiedOpeningLosses[lossIndex].thickness));
          //ambientTemperature
          this.differentArray[lossIndex].different.ambientTemperature.next(this.compare(this.baselineOpeningLosses[lossIndex].ambientTemperature, this.modifiedOpeningLosses[lossIndex].ambientTemperature));
          //insideTemperature
          this.differentArray[lossIndex].different.insideTemperature.next(this.compare(this.baselineOpeningLosses[lossIndex].insideTemperature, this.modifiedOpeningLosses[lossIndex].insideTemperature));
          //percentTimeOpen
          this.differentArray[lossIndex].different.percentTimeOpen.next(this.compare(this.baselineOpeningLosses[lossIndex].percentTimeOpen, this.modifiedOpeningLosses[lossIndex].percentTimeOpen));
          //viewFactor
          this.differentArray[lossIndex].different.viewFactor.next(this.compare(this.baselineOpeningLosses[lossIndex].viewFactor, this.modifiedOpeningLosses[lossIndex].viewFactor));
          //openingType
          this.differentArray[lossIndex].different.openingType.next(this.compare(this.baselineOpeningLosses[lossIndex].openingType, this.modifiedOpeningLosses[lossIndex].openingType));
          //lengthOfOpening
          this.differentArray[lossIndex].different.lengthOfOpening.next(this.compare(this.baselineOpeningLosses[lossIndex].lengthOfOpening, this.modifiedOpeningLosses[lossIndex].lengthOfOpening));
          //heightOfOpening
          this.differentArray[lossIndex].different.heightOfOpening.next(this.compare(this.baselineOpeningLosses[lossIndex].heightOfOpening, this.modifiedOpeningLosses[lossIndex].heightOfOpening));
        }
      } else {
        this.disableAll();
      }
    }
    else if ((this.baselineOpeningLosses && !this.modifiedOpeningLosses) || (!this.baselineOpeningLosses && this.modifiedOpeningLosses)) {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.numberOfOpenings.next(false);
      this.differentArray[lossIndex].different.emissivity.next(false);
      this.differentArray[lossIndex].different.thickness.next(false);
      this.differentArray[lossIndex].different.ambientTemperature.next(false);
      this.differentArray[lossIndex].different.insideTemperature.next(false);
      this.differentArray[lossIndex].different.percentTimeOpen.next(false);
      this.differentArray[lossIndex].different.viewFactor.next(false);
      this.differentArray[lossIndex].different.openingType.next(false);
      this.differentArray[lossIndex].different.lengthOfOpening.next(false);
      this.differentArray[lossIndex].different.heightOfOpening.next(false);
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

  initDifferentObject(): OpeningLossDifferent {
    let tmpDifferent: OpeningLossDifferent = {
      numberOfOpenings: new BehaviorSubject<boolean>(null),
      emissivity: new BehaviorSubject<boolean>(null),
      thickness: new BehaviorSubject<boolean>(null),
      ambientTemperature: new BehaviorSubject<boolean>(null),
      insideTemperature: new BehaviorSubject<boolean>(null),
      percentTimeOpen: new BehaviorSubject<boolean>(null),
      viewFactor: new BehaviorSubject<boolean>(null),
      openingType: new BehaviorSubject<boolean>(null),
      lengthOfOpening: new BehaviorSubject<boolean>(null),
      heightOfOpening: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }
}

export interface OpeningLossDifferent {
  numberOfOpenings: BehaviorSubject<boolean>,
  emissivity: BehaviorSubject<boolean>,
  thickness: BehaviorSubject<boolean>,
  ambientTemperature: BehaviorSubject<boolean>,
  insideTemperature: BehaviorSubject<boolean>,
  percentTimeOpen: BehaviorSubject<boolean>,
  viewFactor: BehaviorSubject<boolean>,
  openingType: BehaviorSubject<boolean>,
  lengthOfOpening: BehaviorSubject<boolean>,
  heightOfOpening: BehaviorSubject<boolean>,
}
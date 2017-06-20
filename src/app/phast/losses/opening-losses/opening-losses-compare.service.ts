import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpeningLoss } from '../../../shared/models/losses/openingLoss';

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

  checkOpeningLosses() {
    this.checkNumberOfOpenings();
    this.checkEmissivity();
    this.checkThickness();
    this.checkAmbientTemperature();
    this.checkInsideTemperature();
    this.checkPercentTimeOpen();
    this.checkViewFactor();
    this.checkOpeningType();
    this.checkHeightOfOpening();
    this.checkLengthOfOpening();
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

  //numberOfOpenings
  checkNumberOfOpenings() {
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
        if (this.baselineOpeningLosses[lossIndex].numberOfOpenings != this.modifiedOpeningLosses[lossIndex].numberOfOpenings) {
          this.differentArray[lossIndex].different.numberOfOpenings.next(true);
        } else {
          this.differentArray[lossIndex].different.numberOfOpenings.next(false);
        }
      }
    }
  }
  //emissivity
  checkEmissivity() {
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
        if (this.baselineOpeningLosses[lossIndex].emissivity != this.modifiedOpeningLosses[lossIndex].emissivity) {
          this.differentArray[lossIndex].different.emissivity.next(true);
        } else {
          this.differentArray[lossIndex].different.emissivity.next(false);
        }
      }
    }
  }
  //thickness
  checkThickness() {
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
        if (this.baselineOpeningLosses[lossIndex].thickness != this.modifiedOpeningLosses[lossIndex].thickness) {
          this.differentArray[lossIndex].different.thickness.next(true);
        } else {
          this.differentArray[lossIndex].different.thickness.next(false);
        }
      }
    }
  }
  //ambientTemperature
  checkAmbientTemperature() {
    if (this.baselineOpeningLosses && this.modifiedOpeningLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
        if (this.baselineOpeningLosses[lossIndex].ambientTemperature != this.modifiedOpeningLosses[lossIndex].ambientTemperature) {
          this.differentArray[lossIndex].different.ambientTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.ambientTemperature.next(false);
        }
      }
    }
  }
  //insideTemperature
  checkInsideTemperature() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].insideTemperature != this.modifiedOpeningLosses[lossIndex].insideTemperature) {
        this.differentArray[lossIndex].different.insideTemperature.next(true);
      } else {
        this.differentArray[lossIndex].different.insideTemperature.next(false);
      }
    }
  }

  //percentTimeOpen
  checkPercentTimeOpen() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].percentTimeOpen != this.modifiedOpeningLosses[lossIndex].percentTimeOpen) {
        this.differentArray[lossIndex].different.percentTimeOpen.next(true);
      } else {
        this.differentArray[lossIndex].different.percentTimeOpen.next(false);
      }
    }
  }
  //viewFactor
  checkViewFactor() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].viewFactor != this.modifiedOpeningLosses[lossIndex].viewFactor) {
        this.differentArray[lossIndex].different.viewFactor.next(true);
      } else {
        this.differentArray[lossIndex].different.viewFactor.next(false);
      }
    }
  }
  //openingType
  checkOpeningType() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].openingType != this.modifiedOpeningLosses[lossIndex].openingType) {
        this.differentArray[lossIndex].different.openingType.next(true);
      } else {
        this.differentArray[lossIndex].different.openingType.next(false);
      }
    }
  }
  //lengthOfOpening
  checkLengthOfOpening() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].lengthOfOpening != this.modifiedOpeningLosses[lossIndex].lengthOfOpening) {
        this.differentArray[lossIndex].different.lengthOfOpening.next(true);
      } else {
        this.differentArray[lossIndex].different.lengthOfOpening.next(false);
      }
    }
  }
  //heightOfOpening
  checkHeightOfOpening() {
    for (let lossIndex = 0; lossIndex < this.baselineOpeningLosses.length; lossIndex++) {
      if (this.baselineOpeningLosses[lossIndex].heightOfOpening != this.modifiedOpeningLosses[lossIndex].heightOfOpening) {
        this.differentArray[lossIndex].different.heightOfOpening.next(true);
      } else {
        this.differentArray[lossIndex].different.heightOfOpening.next(false);
      }
    }
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
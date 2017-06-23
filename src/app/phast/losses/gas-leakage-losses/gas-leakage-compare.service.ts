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
      //coefficient: new BehaviorSubject<boolean>(null),
      specificGravity: new BehaviorSubject<boolean>(null),
      // correctionFactor: new BehaviorSubject<boolean>(null),
      // heatLoss: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  checkLeakageLosses() {
    this.checkDraftPressure();
    this.checkOpeningArea();
    this.checkLeakageGasTemperature();
    this.checkAmbientTemperature();
    //this.checkCoefficient();
    this.checkSpecificGravity();
    // this.checkCorrectionFactor();
    // this.checkHeatLoss();
  }

  //draftPressure
  checkDraftPressure() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].draftPressure != this.modifiedLeakageLoss[lossIndex].draftPressure) {
          this.differentArray[lossIndex].different.draftPressure.next(true);
        } else {
          this.differentArray[lossIndex].different.draftPressure.next(false);
        }
      }
    }
  }
  //openingArea
  checkOpeningArea() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].openingArea != this.modifiedLeakageLoss[lossIndex].openingArea) {
          this.differentArray[lossIndex].different.openingArea.next(true);
        } else {
          this.differentArray[lossIndex].different.openingArea.next(false);
        }
      }
    }
  }
  //leakageGasTemperature
  checkLeakageGasTemperature() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].leakageGasTemperature != this.modifiedLeakageLoss[lossIndex].leakageGasTemperature) {
          this.differentArray[lossIndex].different.leakageGasTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.leakageGasTemperature.next(false);
        }
      }
    }
  }
  //ambientTemperature
  checkAmbientTemperature() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].ambientTemperature != this.modifiedLeakageLoss[lossIndex].ambientTemperature) {
          this.differentArray[lossIndex].different.ambientTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.ambientTemperature.next(false);
        }
      }
    }
  }
  //coefficient
  checkCoefficient() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].coefficient != this.modifiedLeakageLoss[lossIndex].coefficient) {
          this.differentArray[lossIndex].different.coefficient.next(true);
        } else {
          this.differentArray[lossIndex].different.coefficient.next(false);
        }
      }
    }
  }
  //specificGravity
  checkSpecificGravity() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].specificGravity != this.modifiedLeakageLoss[lossIndex].specificGravity) {
          this.differentArray[lossIndex].different.specificGravity.next(true);
        } else {
          this.differentArray[lossIndex].different.specificGravity.next(false);
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactor() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].correctionFactor != this.modifiedLeakageLoss[lossIndex].correctionFactor) {
          this.differentArray[lossIndex].different.correctionFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.correctionFactor.next(false);
        }
      }
    }
  }
  //heatLoss
  checkHeatLoss() {
    if (this.baselineLeakageLoss && this.modifiedLeakageLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineLeakageLoss.length; lossIndex++) {
        if (this.baselineLeakageLoss[lossIndex].heatLoss != this.modifiedLeakageLoss[lossIndex].heatLoss) {
          this.differentArray[lossIndex].different.heatLoss.next(true);
        } else {
          this.differentArray[lossIndex].different.heatLoss.next(false);
        }
      }
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
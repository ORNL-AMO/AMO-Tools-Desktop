import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FixtureLoss } from "../../../shared/models/losses/fixtureLoss";

@Injectable()
export class FixtureLossesCompareService {

  baselineFixtureLosses: FixtureLoss[];
  modifiedFixtureLosses: FixtureLoss[];

  differentArray: Array<any>;
  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      if (this.baselineFixtureLosses.length == this.modifiedFixtureLosses.length) {
        let numLosses = this.baselineFixtureLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkFixtureLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): FixtureLossDifferent {
    let tmpDifferent: FixtureLossDifferent = {
      specificHeat: new BehaviorSubject<boolean>(null),
      feedRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      finalTemperature: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
      materialName: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }


  checkFixtureLosses() {
    this.checkSpecificHeat();
    this.checkFeedRate();
    this.checkInitialTemperature();
    this.checkFinalTemperature();
    this.checkCorrectionFactor();
    this.checkMaterialName();
  }

  //specificHeat
  checkSpecificHeat() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].specificHeat != this.modifiedFixtureLosses[lossIndex].specificHeat) {
          this.differentArray[lossIndex].different.specificHeat.next(true);
        } else {
          this.differentArray[lossIndex].different.specificHeat.next(false);
        }
      }
    }
  }
  //feedRate
  checkFeedRate() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].feedRate != this.modifiedFixtureLosses[lossIndex].feedRate) {
          this.differentArray[lossIndex].different.feedRate.next(true);
        } else {
          this.differentArray[lossIndex].different.feedRate.next(false);
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperature() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].initialTemperature != this.modifiedFixtureLosses[lossIndex].initialTemperature) {
          this.differentArray[lossIndex].different.initialTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.initialTemperature.next(false);
        }
      }
    }
  }
  //finalTemperature
  checkFinalTemperature() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].finalTemperature != this.modifiedFixtureLosses[lossIndex].finalTemperature) {
          this.differentArray[lossIndex].different.finalTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.finalTemperature.next(false);
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactor() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].correctionFactor != this.modifiedFixtureLosses[lossIndex].correctionFactor) {
          this.differentArray[lossIndex].different.correctionFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.correctionFactor.next(false);
        }
      }
    }
  }
  //materialName
  checkMaterialName() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineFixtureLosses.length; lossIndex++) {
        if (this.baselineFixtureLosses[lossIndex].materialName != this.modifiedFixtureLosses[lossIndex].materialName) {
          this.differentArray[lossIndex].different.materialName.next(true);
        } else {
          this.differentArray[lossIndex].different.materialName.next(false);
        }
      }
    }
  }
}

export interface FixtureLossDifferent {
  specificHeat: BehaviorSubject<boolean>,
  feedRate: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  finalTemperature: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
  materialName: BehaviorSubject<boolean>,
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WallLoss } from '../../../shared/models/losses/wallLoss';

@Injectable()
export class WallLossCompareService {

  baselineWallLosses: WallLoss[];
  modifiedWallLosses: WallLoss[];

  //used to hold behavior subjects for each modification
  differentArray: Array<any>;
  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      if (this.baselineWallLosses.length == this.modifiedWallLosses.length) {
        let numLosses = this.baselineWallLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkWallLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  checkWallLosses(){
    this.checkSurfaceTemperature();
    this.checkAmbientTemperature();
    this.checkSurfaceArea();
    this.checkSurfaceEmissivity();
    this.checkSurfaceShape();
    this.checkWindVelocity();
 //   this.checkConditionFactor();
    this.checkCorrectionFactor();
  }

  initDifferentObject(): WallLossDifferent {
    let tmpDifferent: WallLossDifferent = {
      surfaceArea: new BehaviorSubject<boolean>(null),
      ambientTemperature: new BehaviorSubject<boolean>(null),
      surfaceTemperature: new BehaviorSubject<boolean>(null),
      windVelocity: new BehaviorSubject<boolean>(null),
      surfaceEmissivity: new BehaviorSubject<boolean>(null),
      surfaceShape: new BehaviorSubject<boolean>(null),
      conditionFactor: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }

  //surfaceArea
  checkSurfaceArea() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].surfaceArea != this.modifiedWallLosses[lossIndex].surfaceArea) {
          this.differentArray[lossIndex].different.surfaceArea.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceArea.next(false);
        }
      }
    }
  }
  //ambientTemperature
  checkAmbientTemperature() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].ambientTemperature != this.modifiedWallLosses[lossIndex].ambientTemperature) {
          this.differentArray[lossIndex].different.ambientTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.ambientTemperature.next(false);
        }
      }
    }
  }
  //surfaceTemperature
  checkSurfaceTemperature() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].surfaceTemperature != this.modifiedWallLosses[lossIndex].surfaceTemperature) {
          this.differentArray[lossIndex].different.surfaceTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceTemperature.next(false);
        }
      }
    }
  }
  //windVelocity
  checkWindVelocity() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].windVelocity != this.modifiedWallLosses[lossIndex].windVelocity) {
          this.differentArray[lossIndex].different.windVelocity.next(true);
        } else {
          this.differentArray[lossIndex].different.windVelocity.next(false);
        }
      }
    }
  }
  //surfaceEmissivity
  checkSurfaceEmissivity() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].surfaceEmissivity != this.modifiedWallLosses[lossIndex].surfaceEmissivity) {
          this.differentArray[lossIndex].different.surfaceEmissivity.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceEmissivity.next(false);
        }
      }
    }
  }
  //surfaceShape
  checkSurfaceShape() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].surfaceShape != this.modifiedWallLosses[lossIndex].surfaceShape) {
          this.differentArray[lossIndex].different.surfaceShape.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceShape.next(false);
        }
      }
    }
  }
  //conditionFactor
  // checkConditionFactor() {
  //   if (this.baselineWallLosses && this.modifiedWallLosses) {
  //     for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
  //       if (this.baselineWallLosses[lossIndex].conditionFactor != this.modifiedWallLosses[lossIndex].conditionFactor) {
  //         this.differentArray[lossIndex].different.conditionFactor.next(true);
  //       } else {
  //         this.differentArray[lossIndex].different.conditionFactor.next(false);
  //       }
  //     }
  //   }
  // }
  //correctionFactor
  checkCorrectionFactor() {
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineWallLosses.length; lossIndex++) {
        if (this.baselineWallLosses[lossIndex].correctionFactor != this.modifiedWallLosses[lossIndex].correctionFactor) {
          this.differentArray[lossIndex].different.correctionFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.correctionFactor.next(false);
        }
      }
    }
  }

}

export interface WallLossDifferent {
  surfaceArea: BehaviorSubject<boolean>,
  ambientTemperature: BehaviorSubject<boolean>,
  surfaceTemperature: BehaviorSubject<boolean>,
  windVelocity: BehaviorSubject<boolean>,
  surfaceEmissivity: BehaviorSubject<boolean>,
  surfaceShape: BehaviorSubject<boolean>,
  conditionFactor: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { ExtendedSurface } from '../../../shared/models/losses/extendedSurface';
@Injectable()
export class ExtendedSurfaceCompareService {

  baselineSurface: ExtendedSurface[];
  modifiedSurface: ExtendedSurface[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineSurface && this.modifiedSurface) {
      if (this.baselineSurface.length == this.modifiedSurface.length) {
        let numLosses = this.baselineSurface.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkExtendedSurfaceLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  checkExtendedSurfaceLosses() {
    this.checkSurfaceArea();
    this.checkAmbientTemperature();
    this.checkSurfaceTemperature();
    this.checkSurfaceEmissivity();
  }

  initDifferentObject(): ExtendedSurfaceDifferent {
    let tmpDifferent: ExtendedSurfaceDifferent = {
      surfaceArea: new BehaviorSubject<boolean>(null),
      ambientTemperature: new BehaviorSubject<boolean>(null),
      surfaceTemperature: new BehaviorSubject<boolean>(null),
      surfaceEmissivity: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  //surfaceArea
  checkSurfaceArea() {
    if (this.baselineSurface && this.modifiedSurface) {
      for (let lossIndex = 0; lossIndex < this.baselineSurface.length; lossIndex++) {
        if (this.baselineSurface[lossIndex].surfaceArea != this.modifiedSurface[lossIndex].surfaceArea) {
          this.differentArray[lossIndex].different.surfaceArea.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceArea.next(false);
        }
      }
    }
  }
  //ambientTemperature
  checkAmbientTemperature() {
    if (this.baselineSurface && this.modifiedSurface) {
      for (let lossIndex = 0; lossIndex < this.baselineSurface.length; lossIndex++) {
        if (this.baselineSurface[lossIndex].ambientTemperature != this.modifiedSurface[lossIndex].ambientTemperature) {
          this.differentArray[lossIndex].different.ambientTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.ambientTemperature.next(false);
        }
      }
    }
  }
  //surfaceTemperature
  checkSurfaceTemperature() {
    if (this.baselineSurface && this.modifiedSurface) {
      for (let lossIndex = 0; lossIndex < this.baselineSurface.length; lossIndex++) {
        if (this.baselineSurface[lossIndex].surfaceTemperature != this.modifiedSurface[lossIndex].surfaceTemperature) {
          this.differentArray[lossIndex].different.surfaceTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceTemperature.next(false);
        }
      }
    }
  }
  //surfaceEmissivity
  checkSurfaceEmissivity() {
    if (this.baselineSurface && this.modifiedSurface) {
      for (let lossIndex = 0; lossIndex < this.baselineSurface.length; lossIndex++) {
        if (this.baselineSurface[lossIndex].surfaceEmissivity != this.modifiedSurface[lossIndex].surfaceEmissivity) {
          this.differentArray[lossIndex].different.surfaceEmissivity.next(true);
        } else {
          this.differentArray[lossIndex].different.surfaceEmissivity.next(false);
        }
      }
    }
  }
}


export interface ExtendedSurfaceDifferent {
  surfaceArea: BehaviorSubject<boolean>,
  ambientTemperature: BehaviorSubject<boolean>,
  surfaceTemperature: BehaviorSubject<boolean>,
  surfaceEmissivity: BehaviorSubject<boolean>
}
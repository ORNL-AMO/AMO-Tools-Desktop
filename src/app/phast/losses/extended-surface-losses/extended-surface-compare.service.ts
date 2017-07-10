import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
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
    if (this.baselineSurface && this.modifiedSurface) {
      if (this.baselineSurface.length != 0 && this.modifiedSurface.length && this.baselineSurface.length == this.modifiedSurface.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //surfaceArea
          this.differentArray[lossIndex].different.surfaceArea.next(this.compare(this.baselineSurface[lossIndex].surfaceArea, this.modifiedSurface[lossIndex].surfaceArea));
          //ambientTemperature
          this.differentArray[lossIndex].different.ambientTemperature.next(this.compare(this.baselineSurface[lossIndex].ambientTemperature, this.modifiedSurface[lossIndex].ambientTemperature));
          //surfaceTemperature
          this.differentArray[lossIndex].different.surfaceTemperature.next(this.compare(this.baselineSurface[lossIndex].surfaceTemperature, this.modifiedSurface[lossIndex].surfaceTemperature));
          //surfaceEmissivity
          this.differentArray[lossIndex].different.surfaceEmissivity.next(this.compare(this.baselineSurface[lossIndex].surfaceEmissivity, this.modifiedSurface[lossIndex].surfaceEmissivity));
        }
      } else {
        this.disableAll();
      }
    } else {
      this.disableAll();
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
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

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.surfaceArea.next(false);
      this.differentArray[lossIndex].different.ambientTemperature.next(false);
      this.differentArray[lossIndex].different.surfaceTemperature.next(false);
      this.differentArray[lossIndex].different.surfaceEmissivity.next(false);
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

export interface ExtendedSurfaceDifferent {
  surfaceArea: BehaviorSubject<boolean>,
  ambientTemperature: BehaviorSubject<boolean>,
  surfaceTemperature: BehaviorSubject<boolean>,
  surfaceEmissivity: BehaviorSubject<boolean>
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PHAST } from '../../../shared/models/phast';
import { WallLoss } from '../../../shared/models/losses/wallLoss';

@Injectable()
export class WallLossCompareService {

  baselineWallLosses: WallLoss[];
  modifiedWallLosses: WallLoss[];


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
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
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

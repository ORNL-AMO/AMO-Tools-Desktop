import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WallLoss } from '../../../shared/models/losses/wallLoss';

@Injectable()
export class WallLossCompareService {
  //baseline wall losses
  baselineWallLosses: WallLoss[];
  //selected modification wall losses
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
          this.addObject(i);
        }
        this.checkWallLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }
  //add different object to different array
  //called when new loss is added in component
  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  checkWallLosses() {
    //check both baseline and modified set
    if (this.baselineWallLosses && this.modifiedWallLosses) {
      //check losses exist in baseline and modified
      if (this.baselineWallLosses.length != 0 && this.modifiedWallLosses.length != 0) {
        //iterate each different object and check vals
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //surface area
          this.differentArray[lossIndex].different.surfaceArea.next(this.compare(this.baselineWallLosses[lossIndex].surfaceArea, this.modifiedWallLosses[lossIndex].surfaceArea));
          //surfaceTemperature
          this.differentArray[lossIndex].different.surfaceTemperature.next(this.compare(this.baselineWallLosses[lossIndex].surfaceTemperature, this.modifiedWallLosses[lossIndex].surfaceTemperature));
          //ambientTemperature
          this.differentArray[lossIndex].different.ambientTemperature.next(this.compare(this.baselineWallLosses[lossIndex].ambientTemperature, this.modifiedWallLosses[lossIndex].ambientTemperature));
          //surfaceEmissivity
          this.differentArray[lossIndex].different.surfaceEmissivity.next(this.compare(this.baselineWallLosses[lossIndex].surfaceEmissivity, this.modifiedWallLosses[lossIndex].surfaceEmissivity));
          //surfaceShape
          this.differentArray[lossIndex].different.surfaceShape.next(this.compare(this.baselineWallLosses[lossIndex].surfaceShape, this.modifiedWallLosses[lossIndex].surfaceShape));
          //windVelocity
          this.differentArray[lossIndex].different.windVelocity.next(this.compare(this.baselineWallLosses[lossIndex].windVelocity, this.modifiedWallLosses[lossIndex].windVelocity));
          //correctionFactor
          this.differentArray[lossIndex].different.correctionFactor.next(this.compare(this.baselineWallLosses[lossIndex].correctionFactor, this.modifiedWallLosses[lossIndex].correctionFactor));
        }
      }
      //should be called if all losses removed from baseline or modified
      else {
        this.disableAll();
      }
    }
    //disable all difference classes if only one of baseline/modified exist
    else if ((this.baselineWallLosses && !this.modifiedWallLosses) || (!this.baselineWallLosses && this.modifiedWallLosses)) {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.surfaceArea.next(false);
      this.differentArray[lossIndex].different.ambientTemperature.next(false);
      this.differentArray[lossIndex].different.surfaceTemperature.next(false);
      this.differentArray[lossIndex].different.windVelocity.next(false);
      this.differentArray[lossIndex].different.surfaceEmissivity.next(false);
      this.differentArray[lossIndex].different.surfaceShape.next(false);
      this.differentArray[lossIndex].different.correctionFactor.next(false);
    }
  }
  //init set of behavior subject to go with each loss
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

  compare(a: any, b: any) {
    //if both exist
    if (a && b) {
      //compare
      if (a != b) {
        //not equal
        return true;
      } else {
        //equal
        return false;
      }
    }
    //check one exists
    else if ((a && !b) || (!a && b)) {
      //not equal
      return true
    } else {
      //equal
      return false;
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

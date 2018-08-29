import { Injectable } from '@angular/core';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class WallLossCompareService {
  //baseline wall losses
  baselineWallLosses: WallLoss[];
  //selected modification wall losses
  modifiedWallLosses: WallLoss[];

  constructor() {
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineWallLosses.length;
    let isDiff: boolean = false;
    if (this.modifiedWallLosses) {
      for (index; index < numLoss; index++) {
        if (this.compareLoss(index) == true) {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }

  compareLoss(index: number): boolean {
    return (
      this.compareSurfaceArea(index) ||
      this.compareAmbientTemperature(index) ||
      this.compareSurfaceTemperature(index) ||
      this.compareWindVelocity(index) ||
      this.compareSurfaceEmissivity(index) ||
      this.compareSurfaceShape(index) ||
      this.compareConditionFactor(index) ||
      this.compareCorrectionFactor(index)
    )
  }

  compareSurfaceArea(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].surfaceArea, this.modifiedWallLosses[index].surfaceArea);
  }
  compareAmbientTemperature(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].ambientTemperature, this.modifiedWallLosses[index].ambientTemperature);
  }
  compareSurfaceTemperature(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].surfaceTemperature, this.modifiedWallLosses[index].surfaceTemperature);
  }
  compareWindVelocity(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].windVelocity, this.modifiedWallLosses[index].windVelocity);
  }
  compareSurfaceEmissivity(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].surfaceEmissivity, this.modifiedWallLosses[index].surfaceEmissivity);
  }
  compareSurfaceShape(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].surfaceShape, this.modifiedWallLosses[index].surfaceShape);
  }
  compareConditionFactor(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].conditionFactor, this.modifiedWallLosses[index].conditionFactor);
  }
  compareCorrectionFactor(index: number): boolean {
    return this.compare(this.baselineWallLosses[index].correctionFactor, this.modifiedWallLosses[index].correctionFactor);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.wallLosses) {
        let index = 0;
        baseline.losses.wallLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.wallLosses[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: WallLoss, modification: WallLoss): boolean {
    return (
      this.compare(baseline.surfaceArea, modification.surfaceArea) ||
      this.compare(baseline.ambientTemperature, modification.ambientTemperature) ||
      this.compare(baseline.surfaceTemperature, modification.surfaceTemperature) ||
      this.compare(baseline.windVelocity, modification.windVelocity) ||
      this.compare(baseline.surfaceEmissivity, modification.surfaceEmissivity) ||
      this.compare(baseline.surfaceShape, modification.surfaceShape) ||
      this.compare(baseline.conditionFactor, modification.conditionFactor) ||
      this.compare(baseline.correctionFactor, modification.correctionFactor)
    )
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
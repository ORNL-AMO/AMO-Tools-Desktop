import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';

@Injectable()
export class WallLossCompareService {
  //baseline wall losses
  baselineWallLosses: WallLoss[];
  //selected modification wall losses
  modifiedWallLosses: WallLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
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
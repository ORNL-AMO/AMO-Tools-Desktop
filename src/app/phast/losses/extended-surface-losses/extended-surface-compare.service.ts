import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
import { PHAST } from '../../../shared/models/phast/phast';
@Injectable()
export class ExtendedSurfaceCompareService {

  baselineSurface: ExtendedSurface[];
  modifiedSurface: ExtendedSurface[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineSurface.length;
    let isDiff: boolean = false;
    if (this.modifiedSurface) {
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
      this.compareSurfaceEmissivity(index)
    )
  }

  compareSurfaceArea(index: number): boolean {
    return this.compare(this.baselineSurface[index].surfaceArea, this.modifiedSurface[index].surfaceArea);
  }
  compareAmbientTemperature(index: number): boolean {
    return this.compare(this.baselineSurface[index].ambientTemperature, this.modifiedSurface[index].ambientTemperature);
  }
  compareSurfaceTemperature(index: number): boolean {
    return this.compare(this.baselineSurface[index].surfaceTemperature, this.modifiedSurface[index].surfaceTemperature);
  }
  compareSurfaceEmissivity(index: number): boolean {
    return this.compare(this.baselineSurface[index].surfaceEmissivity, this.modifiedSurface[index].surfaceEmissivity);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.extendedSurfaces) {
        let index = 0;
        baseline.losses.extendedSurfaces.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.extendedSurfaces[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: ExtendedSurface, modification: ExtendedSurface): boolean {
    return (
      this.compare(baseline.surfaceArea, modification.surfaceArea) ||
      this.compare(baseline.ambientTemperature, modification.ambientTemperature) ||
      this.compare(baseline.surfaceTemperature, modification.surfaceTemperature) ||
      this.compare(baseline.surfaceEmissivity, modification.surfaceEmissivity)
    )
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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
@Injectable()
export class ExtendedSurfaceCompareService {

  baselineSurface: ExtendedSurface[];
  modifiedSurface: ExtendedSurface[];
  inputError: BehaviorSubject<boolean>;
  constructor() { 
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean{
    let index = 0;
    let numLoss = this.baselineSurface.length;
    let isDiff: boolean = false;
    for (index; index < numLoss; index++) {
      if(this.compareLoss(index) == true){
        isDiff = true;
      }
    }
    return isDiff;
  }

  compareLoss(index: number): boolean{
    return (
      this.compareSurfaceArea(index) ||
      this.compareAmbientTemperature(index) ||
      this.compareSurfaceTemperature(index) ||
      this.compareSurfaceEmissivity(index)
    )
  }

  compareSurfaceArea(index: number): boolean{
    return this.compare(this.baselineSurface[index].surfaceArea, this.modifiedSurface[index].surfaceArea);
  }
  compareAmbientTemperature(index: number): boolean{
    return this.compare(this.baselineSurface[index].ambientTemperature, this.modifiedSurface[index].ambientTemperature);
  }
  compareSurfaceTemperature(index: number): boolean{
    return this.compare(this.baselineSurface[index].surfaceTemperature, this.modifiedSurface[index].surfaceTemperature);
  }
  compareSurfaceEmissivity(index: number): boolean{
    return this.compare(this.baselineSurface[index].surfaceEmissivity, this.modifiedSurface[index].surfaceEmissivity);
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

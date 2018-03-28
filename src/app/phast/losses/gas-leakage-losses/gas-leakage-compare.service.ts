import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LeakageLoss } from "../../../shared/models/phast/losses/leakageLoss";
@Injectable()
export class GasLeakageCompareService {
  baselineLeakageLoss: LeakageLoss[];
  modifiedLeakageLoss: LeakageLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() { 
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean{
    let index = 0;
    let numLoss = this.baselineLeakageLoss.length;
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
      this.compareDraftPressure(index) ||
      this.compareOpeningArea(index) ||
      this.compareLeakageGasTemperature(index) ||
      this.compareAmbientTemperature(index) ||
      this.compareSpecificGravity(index)
    )
  }
  compareDraftPressure(index: number): boolean{
    return this.compare(this.baselineLeakageLoss[index].draftPressure, this.modifiedLeakageLoss[index].draftPressure);
  }
  compareOpeningArea(index: number): boolean{
    return this.compare(this.baselineLeakageLoss[index].openingArea, this.modifiedLeakageLoss[index].openingArea);
  }
  compareLeakageGasTemperature(index: number): boolean{
    return this.compare(this.baselineLeakageLoss[index].leakageGasTemperature, this.modifiedLeakageLoss[index].leakageGasTemperature);
  }
  compareAmbientTemperature(index: number): boolean{
    return this.compare(this.baselineLeakageLoss[index].ambientTemperature, this.modifiedLeakageLoss[index].ambientTemperature);
  }
  compareSpecificGravity(index: number): boolean{
    return this.compare(this.baselineLeakageLoss[index].specificGravity, this.modifiedLeakageLoss[index].specificGravity);
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

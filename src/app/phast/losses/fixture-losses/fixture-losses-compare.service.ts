import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FixtureLoss } from "../../../shared/models/phast/losses/fixtureLoss";

@Injectable()
export class FixtureLossesCompareService {

  baselineFixtureLosses: FixtureLoss[];
  modifiedFixtureLosses: FixtureLoss[];
  inputError: BehaviorSubject<boolean>;
  constructor() { 
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean{
    let index = 0;
    let numLoss = this.baselineFixtureLosses.length;
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
      this.compareSpecificHeat(index) ||
      this.compareFeedRate(index) ||
      this.compareInitialTemperature(index) ||
      this.compareFinalTemperature(index) ||
      this.compareCorrectionFactor(index) ||
      this.compareMaterialName(index)
    )
  }
  compareSpecificHeat(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].specificHeat, this.modifiedFixtureLosses[index].specificHeat);
  }

  compareFeedRate(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].feedRate, this.modifiedFixtureLosses[index].feedRate);
  }

  compareInitialTemperature(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].initialTemperature, this.modifiedFixtureLosses[index].initialTemperature);
  }

  compareFinalTemperature(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].finalTemperature, this.modifiedFixtureLosses[index].finalTemperature);
  }

  compareCorrectionFactor(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].correctionFactor, this.modifiedFixtureLosses[index].correctionFactor);
  }

  compareMaterialName(index: number): boolean{
    return this.compare(this.baselineFixtureLosses[index].materialName, this.modifiedFixtureLosses[index].materialName);
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
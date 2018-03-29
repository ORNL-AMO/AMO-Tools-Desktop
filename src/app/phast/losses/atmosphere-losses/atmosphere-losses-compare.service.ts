import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
@Injectable()
export class AtmosphereLossesCompareService {

  baselineAtmosphereLosses: AtmosphereLoss[];
  modifiedAtmosphereLosses: AtmosphereLoss[];
  inputError: BehaviorSubject<boolean>;
  constructor() { 
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean{
    let index = 0;
    let numLoss = this.baselineAtmosphereLosses.length;
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
      this.compareAtmosphereGas(index) ||
      this.compareSpecificHeat(index) ||
      this.compareInletTemperature(index) ||
      this.compareOutletTemperature(index) ||
      this.compareFlowRate(index) ||
      this.compareCorrectionFactor(index) 
    )
  }

  compareAtmosphereGas(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].atmosphereGas, this.modifiedAtmosphereLosses[index].atmosphereGas);
  }
  compareSpecificHeat(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].specificHeat, this.modifiedAtmosphereLosses[index].specificHeat);
  }
  compareInletTemperature(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].inletTemperature, this.modifiedAtmosphereLosses[index].inletTemperature);
  }
  compareOutletTemperature(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].outletTemperature, this.modifiedAtmosphereLosses[index].outletTemperature);
  }
  compareFlowRate(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].flowRate, this.modifiedAtmosphereLosses[index].flowRate);
  }
  compareCorrectionFactor(index: number): boolean{
    return this.compare(this.baselineAtmosphereLosses[index].correctionFactor, this.modifiedAtmosphereLosses[index].correctionFactor);
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

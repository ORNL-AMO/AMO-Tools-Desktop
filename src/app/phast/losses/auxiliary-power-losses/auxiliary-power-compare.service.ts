import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AuxiliaryPowerLoss } from '../../../shared/models/phast/losses/auxiliaryPowerLoss';

@Injectable()
export class AuxiliaryPowerCompareService {

  baselineAuxLosses: AuxiliaryPowerLoss[];
  modifiedAuxLosses: AuxiliaryPowerLoss[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }
  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineAuxLosses.length;
    let isDiff: boolean = false;
    if (this.modifiedAuxLosses) {
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
      this.compareMotorPhase(index) ||
      this.compareSupplyVoltage(index) ||
      this.compareAvgCurrent(index) ||
      this.comparePowerFactor(index) ||
      this.compareOperatingTime(index)
    )
  }

  compareMotorPhase(index: number): boolean {
    return this.compare(this.baselineAuxLosses[index].motorPhase, this.modifiedAuxLosses[index].motorPhase);
  }
  compareSupplyVoltage(index: number): boolean {
    return this.compare(this.baselineAuxLosses[index].supplyVoltage, this.modifiedAuxLosses[index].supplyVoltage);
  }
  compareAvgCurrent(index: number): boolean {
    return this.compare(this.baselineAuxLosses[index].avgCurrent, this.modifiedAuxLosses[index].avgCurrent);
  }
  comparePowerFactor(index: number): boolean {
    return this.compare(this.baselineAuxLosses[index].powerFactor, this.modifiedAuxLosses[index].powerFactor);
  }
  compareOperatingTime(index: number): boolean {
    return this.compare(this.baselineAuxLosses[index].operatingTime, this.modifiedAuxLosses[index].operatingTime);
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

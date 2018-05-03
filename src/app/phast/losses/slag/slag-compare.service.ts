import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class SlagCompareService {

  baselineSlag: Slag[];
  modifiedSlag: Slag[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineSlag.length;
    let isDiff: boolean = false;
    if (this.modifiedSlag) {
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
      this.compareWeight(index) ||
      this.compareInletTemperature(index) ||
      this.compareOutletTemperature(index) ||
      this.compareSpecificHeat(index) ||
      this.compareCorrectionFactor(index)
    )
  }
  compareWeight(index: number): boolean {
    return this.compare(this.baselineSlag[index].weight, this.modifiedSlag[index].weight);
  }
  compareInletTemperature(index: number): boolean {
    return this.compare(this.baselineSlag[index].inletTemperature, this.modifiedSlag[index].inletTemperature);
  }
  compareOutletTemperature(index: number): boolean {
    return this.compare(this.baselineSlag[index].outletTemperature, this.modifiedSlag[index].outletTemperature);
  }
  compareSpecificHeat(index: number): boolean {
    return this.compare(this.baselineSlag[index].specificHeat, this.modifiedSlag[index].specificHeat);
  }
  compareCorrectionFactor(index: number): boolean {
    return this.compare(this.baselineSlag[index].correctionFactor, this.modifiedSlag[index].correctionFactor);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.slagLosses) {
        let index = 0;
        baseline.losses.slagLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.slagLosses[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: Slag, modification: Slag): boolean {
    return (
      this.compare(baseline.weight, modification.weight) ||
      this.compare(baseline.inletTemperature, modification.inletTemperature) ||
      this.compare(baseline.outletTemperature, modification.outletTemperature) ||
      this.compare(baseline.specificHeat, modification.specificHeat) ||
      this.compare(baseline.correctionFactor, modification.correctionFactor)
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

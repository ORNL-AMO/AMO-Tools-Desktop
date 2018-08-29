import { Injectable } from '@angular/core';
import { FixtureLoss } from "../../../shared/models/phast/losses/fixtureLoss";
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class FixtureLossesCompareService {

  baselineFixtureLosses: FixtureLoss[];
  modifiedFixtureLosses: FixtureLoss[];
  constructor() {
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineFixtureLosses.length;
    let isDiff: boolean = false;
    if (this.modifiedFixtureLosses) {
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
      this.compareSpecificHeat(index) ||
      this.compareFeedRate(index) ||
      this.compareInitialTemperature(index) ||
      this.compareFinalTemperature(index) ||
      this.compareCorrectionFactor(index) ||
      this.compareMaterialName(index)
    )
  }
  compareSpecificHeat(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].specificHeat, this.modifiedFixtureLosses[index].specificHeat);
  }

  compareFeedRate(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].feedRate, this.modifiedFixtureLosses[index].feedRate);
  }

  compareInitialTemperature(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].initialTemperature, this.modifiedFixtureLosses[index].initialTemperature);
  }

  compareFinalTemperature(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].finalTemperature, this.modifiedFixtureLosses[index].finalTemperature);
  }

  compareCorrectionFactor(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].correctionFactor, this.modifiedFixtureLosses[index].correctionFactor);
  }

  compareMaterialName(index: number): boolean {
    return this.compare(this.baselineFixtureLosses[index].materialName, this.modifiedFixtureLosses[index].materialName);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.fixtureLosses) {
        let index = 0;
        baseline.losses.fixtureLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.fixtureLosses[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: FixtureLoss, modification: FixtureLoss): boolean {
    return (
      this.compare(baseline.specificHeat, modification.specificHeat) ||
      this.compare(baseline.feedRate, modification.feedRate) ||
      this.compare(baseline.initialTemperature, modification.initialTemperature) ||
      this.compare(baseline.finalTemperature, modification.finalTemperature) ||
      this.compare(baseline.correctionFactor, modification.correctionFactor) || 
      this.compare(baseline.materialName, modification.materialName) 
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
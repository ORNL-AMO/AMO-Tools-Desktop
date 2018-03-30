import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class OtherLossesCompareService {

  baselineOtherLoss: OtherLoss[];
  modifiedOtherLoss: OtherLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineOtherLoss.length;
    let isDiff: boolean = false;
    if (this.modifiedOtherLoss) {
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
      this.compareDescription(index) ||
      this.compareHeatLoss(index)
    )
  }
  compareDescription(index: number): boolean {
    return this.compare(this.baselineOtherLoss[index].description, this.modifiedOtherLoss[index].description);
  }
  compareHeatLoss(index: number): boolean {
    return this.compare(this.baselineOtherLoss[index].heatLoss, this.modifiedOtherLoss[index].heatLoss);
  }


  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.otherLosses) {
        let index = 0;
        baseline.losses.otherLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.otherLosses[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: OtherLoss, modification: OtherLoss): boolean {
    return (
      this.compare(baseline.description, modification.description) ||
      this.compare(baseline.heatLoss, modification.heatLoss)
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

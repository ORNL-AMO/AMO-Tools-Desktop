import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';

@Injectable()
export class OpeningLossesCompareService {
  baselineOpeningLosses: OpeningLoss[];
  modifiedOpeningLosses: OpeningLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineOpeningLosses.length;
    let isDiff: boolean = false;
    for (index; index < numLoss; index++) {
      if (this.compareLoss(index) == true) {
        isDiff = true;
      }
    }
    return isDiff;
  }

  compareLoss(index: number): boolean {
    return (
      this.compareNumberOfOpenings(index) ||
      this.compareEmissivity(index) ||
      this.compareThickness(index) ||
      this.compareAmbientTemperature(index) ||
      this.compareInsideTemperature(index) ||
      this.comparePercentTimeOpen(index) ||
      this.compareViewFactor(index) ||
      this.compareOpeningType(index) ||
      this.compareLengthOfOpening(index) ||
      this.compareHeightOfOpening(index)
    )
  }

  compareNumberOfOpenings(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].numberOfOpenings, this.modifiedOpeningLosses[index].numberOfOpenings);
  }
  compareEmissivity(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].emissivity, this.modifiedOpeningLosses[index].emissivity);
  }
  compareThickness(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].thickness, this.modifiedOpeningLosses[index].thickness);
  }
  compareAmbientTemperature(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].ambientTemperature, this.modifiedOpeningLosses[index].ambientTemperature);
  }
  compareInsideTemperature(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].insideTemperature, this.modifiedOpeningLosses[index].insideTemperature);
  }
  comparePercentTimeOpen(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].percentTimeOpen, this.modifiedOpeningLosses[index].percentTimeOpen);
  }
  compareViewFactor(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].viewFactor, this.modifiedOpeningLosses[index].viewFactor);
  }
  compareOpeningType(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].openingType, this.modifiedOpeningLosses[index].openingType);
  }
  compareLengthOfOpening(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].lengthOfOpening, this.modifiedOpeningLosses[index].lengthOfOpening);
  }
  compareHeightOfOpening(index: number): boolean {
    return this.compare(this.baselineOpeningLosses[index].heightOfOpening, this.modifiedOpeningLosses[index].heightOfOpening);
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

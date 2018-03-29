import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';

@Injectable()
export class ExhaustGasCompareService {

  baselineExhaustGasLosses: ExhaustGasEAF[];
  modifiedExhaustGasLosses: ExhaustGasEAF[];

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }
  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineExhaustGasLosses.length;
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
      this.compareOffGasTemp(index) ||
      this.compareCO(index) ||
      this.compareH2(index) ||
      this.compareCombustibleGases(index) ||
      this.compareVfr(index) ||
      this.compareDustLoading(index)
    )
  }
  compareOffGasTemp(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].offGasTemp, this.modifiedExhaustGasLosses[index].offGasTemp);
  }

  compareCO(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].CO, this.modifiedExhaustGasLosses[index].CO);
  }
  compareH2(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].H2, this.modifiedExhaustGasLosses[index].H2);
  }
  compareCombustibleGases(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].combustibleGases, this.modifiedExhaustGasLosses[index].combustibleGases);
  }
  compareVfr(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].vfr, this.modifiedExhaustGasLosses[index].vfr);
  }
  compareDustLoading(index: number): boolean {
    return this.compare(this.baselineExhaustGasLosses[index].dustLoading, this.modifiedExhaustGasLosses[index].dustLoading);
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

export interface ExhaustGasDifferent {
  offGasTemp: BehaviorSubject<boolean>,
  CO: BehaviorSubject<boolean>,
  H2: BehaviorSubject<boolean>,
  combustibleGases: BehaviorSubject<boolean>,
  vfr: BehaviorSubject<boolean>,
  dustLoading: BehaviorSubject<boolean>,
}

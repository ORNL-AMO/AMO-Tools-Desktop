import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';

@Injectable()
export class OtherLossesCompareService {

  baselineOtherLoss: OtherLoss[];
  modifiedOtherLoss: OtherLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() { 
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean{
    let index = 0;
    let numLoss = this.baselineOtherLoss.length;
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
      this.compareDescription(index) ||
      this.compareHeatLoss(index)
    )
  }
  compareDescription(index: number): boolean{
    return this.compare(this.baselineOtherLoss[index].description, this.modifiedOtherLoss[index].description);
  }
  compareHeatLoss(index: number): boolean{
    return this.compare(this.baselineOtherLoss[index].heatLoss, this.modifiedOtherLoss[index].heatLoss);
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

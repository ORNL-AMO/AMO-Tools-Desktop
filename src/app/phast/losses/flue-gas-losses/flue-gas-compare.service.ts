import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlueGas } from "../../../shared/models/losses/flueGas";

@Injectable()
export class FlueGasCompareService {
  baselineFlueGasLoss: FlueGas[];
  modifiedFlueGasLoss: FlueGas[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      if (this.baselineFlueGasLoss.length == this.modifiedFlueGasLoss.length) {
        let numLosses = this.baselineFlueGasLoss.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkFlueGasLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }
  checkFlueGasLosses() {

  }

  initDifferentObject() {

  }
}

export interface FlueGasDifferent {

}
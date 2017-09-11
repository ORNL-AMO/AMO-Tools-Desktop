import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';

@Injectable()
export class EnergyInputExhaustGasCompareService {


  baselineEnergyInputExhaustGasLosses: EnergyInputExhaustGasLoss[];
  modifiedEnergyInputExhaustGasLosses: EnergyInputExhaustGasLoss[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineEnergyInputExhaustGasLosses && this.modifiedEnergyInputExhaustGasLosses) {
      if (this.baselineEnergyInputExhaustGasLosses.length == this.modifiedEnergyInputExhaustGasLosses.length) {
        let numLosses = this.baselineEnergyInputExhaustGasLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkExhaustGasLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  // addOther() {
  //   this.differentArray.forEach(diff => {
  //     diff.different.otherLossObjects.push(new BehaviorSubject<boolean>(null));
  //   })
  // }

  initDifferentObject(): EnergyInputExhaustGasDifferent {
    // let tmpBehaviorArray = new Array<BehaviorSubject<boolean>>();
    // for (let i = 0; i < numOther; i++) {
    //   tmpBehaviorArray.push(new BehaviorSubject<boolean>(null));
    // }

    let tmpDifferent: EnergyInputExhaustGasDifferent = {
      excessAir: new BehaviorSubject<boolean>(null),
      combustionAirTemp: new BehaviorSubject<boolean>(null),
      exhaustGasTemp: new BehaviorSubject<boolean>(null),
      totalHeatInput: new BehaviorSubject<boolean>(null),
      electricalPowerInput: new BehaviorSubject<boolean>(null),
      //otherLossObjects: tmpBehaviorArray
    }
    return tmpDifferent;
  }

  checkExhaustGasLosses() {
    if (this.baselineEnergyInputExhaustGasLosses && this.modifiedEnergyInputExhaustGasLosses) {
      if (this.baselineEnergyInputExhaustGasLosses.length != 0 && this.modifiedEnergyInputExhaustGasLosses.length != 0 && this.baselineEnergyInputExhaustGasLosses.length == this.modifiedEnergyInputExhaustGasLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //excessAir
          this.differentArray[lossIndex].different.excessAir.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].excessAir, this.modifiedEnergyInputExhaustGasLosses[lossIndex].excessAir));
          //combustionAirTemp
          this.differentArray[lossIndex].different.combustionAirTemp.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].combustionAirTemp, this.modifiedEnergyInputExhaustGasLosses[lossIndex].combustionAirTemp));
          //exhaustGasTemp
          this.differentArray[lossIndex].different.exhaustGasTemp.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].exhaustGasTemp, this.modifiedEnergyInputExhaustGasLosses[lossIndex].exhaustGasTemp));
          //totalHeatInput
          this.differentArray[lossIndex].different.totalHeatInput.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].totalHeatInput, this.modifiedEnergyInputExhaustGasLosses[lossIndex].totalHeatInput));
          //electricalPowerInput
          this.differentArray[lossIndex].different.electricalPowerInput.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].electricalPowerInput, this.modifiedEnergyInputExhaustGasLosses[lossIndex].electricalPowerInput));
          //otherLossObjects
          // let i = 0;
          // this.differentArray[lossIndex].different.otherLossObjects.forEach(obj => {
          //   obj.next(this.compare(this.baselineEnergyInputExhaustGasLosses[lossIndex].otherLossObjects[i], this.modifiedEnergyInputExhaustGasLosses[lossIndex].otherLossObjects[i]));
          //   i++;
          // });
        }
      } else {
        this.disableAll()
      }
    } else {
      this.disableAll()
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.excessAir.next(false);
      this.differentArray[lossIndex].different.combustionAirTemp.next(false);
      this.differentArray[lossIndex].different.exhaustGasTemp.next(false);
      this.differentArray[lossIndex].different.totalHeatInput.next(false);
      this.differentArray[lossIndex].different.electricalPowerInput.next(false);
      // let i = 0;
      // this.differentArray[lossIndex].different.otherLossObjects.forEach(obj => {
      //   obj.next(false);
      //   i++;
      // });
    }
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

export interface EnergyInputExhaustGasDifferent {
  excessAir: BehaviorSubject<boolean>,
  combustionAirTemp: BehaviorSubject<boolean>,
  exhaustGasTemp: BehaviorSubject<boolean>,
  totalHeatInput: BehaviorSubject<boolean>,
  electricalPowerInput: BehaviorSubject<boolean>,
  //otherLossObjects: Array<BehaviorSubject<boolean>>
}

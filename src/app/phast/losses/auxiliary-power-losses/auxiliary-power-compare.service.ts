import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AuxiliaryPowerLoss } from '../../../shared/models/phast/losses/auxiliaryPowerLoss';

@Injectable()
export class AuxiliaryPowerCompareService {

  baselineAuxLosses: AuxiliaryPowerLoss[];
  modifiedAuxLosses: AuxiliaryPowerLoss[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      if (this.baselineAuxLosses.length == this.modifiedAuxLosses.length) {
        let numLosses = this.baselineAuxLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkAuxLosses();
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

  initDifferentObject(): AuxiliaryPowerDifferent {
    let tmpDifferent: AuxiliaryPowerDifferent = {
      motorPhase: new BehaviorSubject<boolean>(null),
      supplyVoltage: new BehaviorSubject<boolean>(null),
      avgCurrent: new BehaviorSubject<boolean>(null),
      powerFactor: new BehaviorSubject<boolean>(null),
      operatingTime: new BehaviorSubject<boolean>(null),
      // powerUsed: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  checkAuxLosses() {
    if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      if (this.baselineAuxLosses.length != 0 && this.modifiedAuxLosses.length != 0 && this.baselineAuxLosses.length == this.modifiedAuxLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //motorPhase
          this.differentArray[lossIndex].different.motorPhase.next(this.compare(this.baselineAuxLosses[lossIndex].motorPhase, this.modifiedAuxLosses[lossIndex].motorPhase));
          //supplyVoltage
          this.differentArray[lossIndex].different.supplyVoltage.next(this.compare(this.baselineAuxLosses[lossIndex].supplyVoltage, this.modifiedAuxLosses[lossIndex].supplyVoltage));
          //avgCurrent
          this.differentArray[lossIndex].different.avgCurrent.next(this.compare(this.baselineAuxLosses[lossIndex].avgCurrent, this.modifiedAuxLosses[lossIndex].avgCurrent));
          //powerFactor
          this.differentArray[lossIndex].different.powerFactor.next(this.compare(this.baselineAuxLosses[lossIndex].powerFactor, this.modifiedAuxLosses[lossIndex].powerFactor));
          //operatingTime
          this.differentArray[lossIndex].different.operatingTime.next(this.compare(this.baselineAuxLosses[lossIndex].operatingTime, this.modifiedAuxLosses[lossIndex].operatingTime));
        }
      } else {
        this.disableAll();
      }
    } else {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.motorPhase.next(false);
      this.differentArray[lossIndex].different.supplyVoltage.next(false);
      this.differentArray[lossIndex].different.avgCurrent.next(false);
      this.differentArray[lossIndex].different.powerFactor.next(false);
      this.differentArray[lossIndex].different.operatingTime.next(false);
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

export interface AuxiliaryPowerDifferent {
  motorPhase: BehaviorSubject<boolean>,
  supplyVoltage: BehaviorSubject<boolean>,
  avgCurrent: BehaviorSubject<boolean>,
  powerFactor: BehaviorSubject<boolean>,
  operatingTime: BehaviorSubject<boolean>,
  // powerUsed: BehaviorSubject<boolean>
}
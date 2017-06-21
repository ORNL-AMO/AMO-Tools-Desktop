import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AuxiliaryPowerLoss } from '../../../shared/models/losses/auxiliaryPowerLoss';

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

  checkAuxLosses(){
    this.checkMotorPhase();
    this.checkSupplyVoltage();
    this.checkAvgCurrent();
    this.checkPowerFactor();
    this.checkOperatingTime();
   // this.checkPowerUsed();
  }

  //motorPhase
  checkMotorPhase(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].motorPhase != this.modifiedAuxLosses[lossIndex].motorPhase) {
          this.differentArray[lossIndex].different.motorPhase.next(true);
        } else {
          this.differentArray[lossIndex].different.motorPhase.next(false);
        }
      }
    }
  }
  //supplyVoltage
  checkSupplyVoltage(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].supplyVoltage != this.modifiedAuxLosses[lossIndex].supplyVoltage) {
          this.differentArray[lossIndex].different.supplyVoltage.next(true);
        } else {
          this.differentArray[lossIndex].different.supplyVoltage.next(false);
        }
      }
    }
  }
  //avgCurrent
  checkAvgCurrent(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].avgCurrent != this.modifiedAuxLosses[lossIndex].avgCurrent) {
          this.differentArray[lossIndex].different.avgCurrent.next(true);
        } else {
          this.differentArray[lossIndex].different.avgCurrent.next(false);
        }
      }
    }
  }
  //powerFactor
  checkPowerFactor(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].powerFactor != this.modifiedAuxLosses[lossIndex].powerFactor) {
          this.differentArray[lossIndex].different.powerFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.powerFactor.next(false);
        }
      }
    }
  }
  //operatingTime
  checkOperatingTime(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].operatingTime != this.modifiedAuxLosses[lossIndex].operatingTime) {
          this.differentArray[lossIndex].different.operatingTime.next(true);
        } else {
          this.differentArray[lossIndex].different.operatingTime.next(false);
        }
      }
    }
  }
  //powerUsed
  checkPowerUsed(){
   if (this.baselineAuxLosses && this.modifiedAuxLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAuxLosses.length; lossIndex++) {
        if (this.baselineAuxLosses[lossIndex].powerUsed != this.modifiedAuxLosses[lossIndex].powerUsed) {
          this.differentArray[lossIndex].different.powerUsed.next(true);
        } else {
          this.differentArray[lossIndex].different.powerUsed.next(false);
        }
      }
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
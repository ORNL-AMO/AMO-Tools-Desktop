import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AtmosphereLoss } from '../../../shared/models/losses/atmosphereLoss';
@Injectable()
export class AtmosphereLossesCompareService {

  baselineAtmosphereLosses: AtmosphereLoss[];
  modifiedAtmosphereLosses: AtmosphereLoss[];

  differentArray: Array<any>;
  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      if (this.baselineAtmosphereLosses.length == this.modifiedAtmosphereLosses.length) {
        let numLosses = this.baselineAtmosphereLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkAtmosphereLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): AtmosphereLossDifferent {
    let tmpDifferent: AtmosphereLossDifferent = {
      atmosphereGas: new BehaviorSubject<boolean>(null),
      specificHeat: new BehaviorSubject<boolean>(null),
      inletTemperature: new BehaviorSubject<boolean>(null),
      outletTemperature: new BehaviorSubject<boolean>(null),
      flowRate: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  checkAtmosphereLosses() {
    this.checkAtmosphereGas();
    this.checkSpecificHeat();
    this.checkInletTemperature();
    this.checkOutletTemperature();
    this.checkFlowRate();
    this.checkCorrectionFactor();
  }

  //atmosphereGas
  checkAtmosphereGas() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].atmosphereGas != this.modifiedAtmosphereLosses[lossIndex].atmosphereGas) {
          this.differentArray[lossIndex].different.atmosphereGas.next(true);
        } else {
          this.differentArray[lossIndex].different.atmosphereGas.next(false);
        }
      }
    }
  }
  //specificHeat
  checkSpecificHeat() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].specificHeat != this.modifiedAtmosphereLosses[lossIndex].specificHeat) {
          this.differentArray[lossIndex].different.specificHeat.next(true);
        } else {
          this.differentArray[lossIndex].different.specificHeat.next(false);
        }
      }
    }
  }
  //inletTemperature
  checkInletTemperature() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].inletTemperature != this.modifiedAtmosphereLosses[lossIndex].inletTemperature) {
          this.differentArray[lossIndex].different.inletTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.inletTemperature.next(false);
        }
      }
    }
  }
  //outletTemperature
  checkOutletTemperature() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].outletTemperature != this.modifiedAtmosphereLosses[lossIndex].outletTemperature) {
          this.differentArray[lossIndex].different.outletTemperature.next(true);
        } else {
          this.differentArray[lossIndex].different.outletTemperature.next(false);
        }
      }
    }
  }
  //flowRate
  checkFlowRate() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].flowRate != this.modifiedAtmosphereLosses[lossIndex].flowRate) {
          this.differentArray[lossIndex].different.flowRate.next(true);
        } else {
          this.differentArray[lossIndex].different.flowRate.next(false);
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactor() {
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineAtmosphereLosses.length; lossIndex++) {
        if (this.baselineAtmosphereLosses[lossIndex].correctionFactor != this.modifiedAtmosphereLosses[lossIndex].correctionFactor) {
          this.differentArray[lossIndex].different.correctionFactor.next(true);
        } else {
          this.differentArray[lossIndex].different.correctionFactor.next(false);
        }
      }
    }
  }
}

export interface AtmosphereLossDifferent {
  atmosphereGas: BehaviorSubject<boolean>,
  specificHeat: BehaviorSubject<boolean>,
  inletTemperature: BehaviorSubject<boolean>,
  outletTemperature: BehaviorSubject<boolean>,
  flowRate: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>
}

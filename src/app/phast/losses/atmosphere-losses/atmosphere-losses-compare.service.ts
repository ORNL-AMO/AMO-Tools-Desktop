import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
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
      }
    }
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
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
    if (this.baselineAtmosphereLosses && this.modifiedAtmosphereLosses) {
      if (this.baselineAtmosphereLosses.length != 0 && this.modifiedAtmosphereLosses.length != 0 && this.baselineAtmosphereLosses.length == this.modifiedAtmosphereLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //atmosphereGas
          this.differentArray[lossIndex].different.atmosphereGas.next(this.compare(this.baselineAtmosphereLosses[lossIndex].atmosphereGas, this.modifiedAtmosphereLosses[lossIndex].atmosphereGas));
          //specificHeat
          this.differentArray[lossIndex].different.specificHeat.next(this.compare(this.baselineAtmosphereLosses[lossIndex].specificHeat, this.modifiedAtmosphereLosses[lossIndex].specificHeat));
          //inletTemperature
          this.differentArray[lossIndex].different.inletTemperature.next(this.compare(this.baselineAtmosphereLosses[lossIndex].inletTemperature, this.modifiedAtmosphereLosses[lossIndex].inletTemperature));
          //outletTemperature
          this.differentArray[lossIndex].different.outletTemperature.next(this.compare(this.baselineAtmosphereLosses[lossIndex].outletTemperature, this.modifiedAtmosphereLosses[lossIndex].outletTemperature));
          //flowRate
          this.differentArray[lossIndex].different.flowRate.next(this.compare(this.baselineAtmosphereLosses[lossIndex].flowRate, this.modifiedAtmosphereLosses[lossIndex].flowRate));
          //correctionFactor
          this.differentArray[lossIndex].different.correctionFactor.next(this.compare(this.baselineAtmosphereLosses[lossIndex].correctionFactor, this.modifiedAtmosphereLosses[lossIndex].correctionFactor));
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
      this.differentArray[lossIndex].different.atmosphereGas.next(false);
      this.differentArray[lossIndex].different.specificHeat.next(false);
      this.differentArray[lossIndex].different.inletTemperature.next(false);
      this.differentArray[lossIndex].different.outletTemperature.next(false);
      this.differentArray[lossIndex].different.flowRate.next(false);
      this.differentArray[lossIndex].different.correctionFactor.next(false);
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

export interface AtmosphereLossDifferent {
  atmosphereGas: BehaviorSubject<boolean>,
  specificHeat: BehaviorSubject<boolean>,
  inletTemperature: BehaviorSubject<boolean>,
  outletTemperature: BehaviorSubject<boolean>,
  flowRate: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>
}

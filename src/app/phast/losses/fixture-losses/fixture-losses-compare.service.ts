import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FixtureLoss } from "../../../shared/models/phast/losses/fixtureLoss";

@Injectable()
export class FixtureLossesCompareService {

  baselineFixtureLosses: FixtureLoss[];
  modifiedFixtureLosses: FixtureLoss[];

  differentArray: Array<any>;
  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      if (this.baselineFixtureLosses.length == this.modifiedFixtureLosses.length) {
        let numLosses = this.baselineFixtureLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkFixtureLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): FixtureLossDifferent {
    let tmpDifferent: FixtureLossDifferent = {
      specificHeat: new BehaviorSubject<boolean>(null),
      feedRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      finalTemperature: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
      materialName: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  checkFixtureLosses() {
    if (this.baselineFixtureLosses && this.modifiedFixtureLosses) {
      if (this.baselineFixtureLosses.length != 0 && this.modifiedFixtureLosses.length && this.baselineFixtureLosses.length == this.modifiedFixtureLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //specificHeat
          this.differentArray[lossIndex].different.specificHeat.next(this.compare(this.baselineFixtureLosses[lossIndex].specificHeat, this.modifiedFixtureLosses[lossIndex].specificHeat));
          //feedRate
          this.differentArray[lossIndex].different.feedRate.next(this.compare(this.baselineFixtureLosses[lossIndex].feedRate, this.modifiedFixtureLosses[lossIndex].feedRate));
          //initialTemperature
          this.differentArray[lossIndex].different.initialTemperature.next(this.compare(this.baselineFixtureLosses[lossIndex].initialTemperature, this.modifiedFixtureLosses[lossIndex].initialTemperature));
          //finalTemperature
          this.differentArray[lossIndex].different.finalTemperature.next(this.compare(this.baselineFixtureLosses[lossIndex].finalTemperature, this.modifiedFixtureLosses[lossIndex].finalTemperature));
          //correctionFactor
          this.differentArray[lossIndex].different.correctionFactor.next(this.compare(this.baselineFixtureLosses[lossIndex].correctionFactor, this.modifiedFixtureLosses[lossIndex].correctionFactor));
          //materialName
          this.differentArray[lossIndex].different.materialName.next(this.compare(this.baselineFixtureLosses[lossIndex].materialName, this.modifiedFixtureLosses[lossIndex].materialName));
        }
      }else{
        this.disableAll();
      }
    }else{
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.specificHeat.next(false);
      this.differentArray[lossIndex].different.feedRate.next(false);
      this.differentArray[lossIndex].different.initialTemperature.next(false);
      this.differentArray[lossIndex].different.finalTemperature.next(false);
      this.differentArray[lossIndex].different.correctionFactor.next(false);
      this.differentArray[lossIndex].different.materialName.next(false);
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

export interface FixtureLossDifferent {
  specificHeat: BehaviorSubject<boolean>,
  feedRate: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  finalTemperature: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
  materialName: BehaviorSubject<boolean>,
}
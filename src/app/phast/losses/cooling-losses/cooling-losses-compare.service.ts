import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { CoolingLoss } from "../../../shared/models/phast/losses/coolingLoss";
@Injectable()
export class CoolingLossesCompareService {

  baselineCoolingLosses: CoolingLoss[];
  modifiedCoolingLosses: CoolingLoss[];

  differentArray: Array<any>;

  constructor() {

  }
  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      if (this.baselineCoolingLosses.length == this.modifiedCoolingLosses.length) {
        let numLosses = this.baselineCoolingLosses.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkCoolingLosses();
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

  initDifferentObject(): CoolingLossDifferent {
    let tmpGasDifferent: GasCoolingLossDifferent = {
      flowRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      finalTemperature: new BehaviorSubject<boolean>(null),
      specificHeat: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
      gasDensity: new BehaviorSubject<boolean>(null)
    }
    let tmpLiquidDifferent: LiquidCoolingLossDifferent = {
      flowRate: new BehaviorSubject<boolean>(null),
      density: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      outletTemperature: new BehaviorSubject<boolean>(null),
      specificHeat: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
    }
    let tmpWaterDifferent: WaterCoolingLossDifferent = {
      flowRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      outletTemperature: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
    }
    let tmpDifferent: CoolingLossDifferent = {
      coolingLossType: new BehaviorSubject<boolean>(null),
      gasCoolingLossDifferent: tmpGasDifferent,
      liquidCoolingLossDifferent: tmpLiquidDifferent,
      waterCoolingLossDifferent: tmpWaterDifferent
    }
    return tmpDifferent;
  }

  checkCoolingLosses() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      if (this.baselineCoolingLosses.length != 0 && this.modifiedCoolingLosses.length != 0 && this.baselineCoolingLosses.length == this.modifiedCoolingLosses.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          this.differentArray[lossIndex].different.coolingLossType.next(this.compare(this.baselineCoolingLosses[lossIndex].coolingLossType, this.modifiedCoolingLosses[lossIndex].coolingLossType));
          if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Gas') {
            //flowRate
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.flowRate.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.flowRate, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.flowRate));
            //initialTemperature
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.initialTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.initialTemperature, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.initialTemperature));
            //finalTemperature
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.finalTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.finalTemperature, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.finalTemperature));
            //specificHeat
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.specificHeat.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.specificHeat, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.specificHeat));
            //correctionFactor
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.correctionFactor.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.correctionFactor, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.correctionFactor));
            //gasDensity
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.gasDensity.next(this.compare(this.baselineCoolingLosses[lossIndex].gasCoolingLoss.gasDensity, this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.gasDensity));

          }
          else if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Liquid') {
            //flowRate
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.flowRate.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.flowRate, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.flowRate));
            //density
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.density.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.density, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.density));
            //initialTemperature
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.initialTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.initialTemperature, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.initialTemperature));
            //outletTemperature
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.outletTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.outletTemperature, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.outletTemperature));
            //specificHeat
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.specificHeat.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.specificHeat, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.specificHeat));
            //correctionFactor
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.correctionFactor.next(this.compare(this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.correctionFactor, this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.correctionFactor));
          }
          else if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Water' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Water') {
            //flowRate
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.flowRate.next(this.compare(this.baselineCoolingLosses[lossIndex].waterCoolingLoss.flowRate, this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.flowRate));
            //initialTemperature
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.initialTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].waterCoolingLoss.initialTemperature, this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.initialTemperature));
            //outletTemperature
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.outletTemperature.next(this.compare(this.baselineCoolingLosses[lossIndex].waterCoolingLoss.outletTemperature, this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.outletTemperature));
            //correctionFactor
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.correctionFactor.next(this.compare(this.baselineCoolingLosses[lossIndex].waterCoolingLoss.correctionFactor, this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.correctionFactor));
          } else {
            this.disableIndexed(lossIndex);
          }
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
      this.differentArray[lossIndex].different.coolingLossType.next(false);
      //gasCooling
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.flowRate.next(false);
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.finalTemperature.next(false);
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.specificHeat.next(false);
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.correctionFactor.next(false);
      this.differentArray[lossIndex].different.gasCoolingLossDifferent.gasDensity.next(false);
      //liquidCooling
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.flowRate.next(false);
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.density.next(false);
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.outletTemperature.next(false);
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.specificHeat.next(false);
      this.differentArray[lossIndex].different.liquidCoolingLossDifferent.correctionFactor.next(false);
      //waterCooling
      this.differentArray[lossIndex].different.waterCoolingLossDifferent.flowRate.next(false);
      this.differentArray[lossIndex].different.waterCoolingLossDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.waterCoolingLossDifferent.outletTemperature.next(false);
      this.differentArray[lossIndex].different.waterCoolingLossDifferent.correctionFactor.next(false);
    }
  }

  disableIndexed(lossIndex: number) {
    this.differentArray[lossIndex].different.coolingLossType.next(false);
    //gasCooling
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.flowRate.next(false);
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.finalTemperature.next(false);
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.specificHeat.next(false);
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.correctionFactor.next(false);
    this.differentArray[lossIndex].different.gasCoolingLossDifferent.gasDensity.next(false);
    //liquidCooling
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.flowRate.next(false);
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.density.next(false);
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.outletTemperature.next(false);
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.specificHeat.next(false);
    this.differentArray[lossIndex].different.liquidCoolingLossDifferent.correctionFactor.next(false);
    //waterCooling
    this.differentArray[lossIndex].different.waterCoolingLossDifferent.flowRate.next(false);
    this.differentArray[lossIndex].different.waterCoolingLossDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.waterCoolingLossDifferent.outletTemperature.next(false);
    this.differentArray[lossIndex].different.waterCoolingLossDifferent.correctionFactor.next(false);
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

export interface CoolingLossDifferent {
  coolingLossType: BehaviorSubject<boolean>,
  gasCoolingLossDifferent: GasCoolingLossDifferent,
  liquidCoolingLossDifferent: LiquidCoolingLossDifferent,
  waterCoolingLossDifferent: WaterCoolingLossDifferent
}

export interface GasCoolingLossDifferent {
  flowRate: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  finalTemperature: BehaviorSubject<boolean>,
  specificHeat: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
  gasDensity: BehaviorSubject<boolean>
}

export interface LiquidCoolingLossDifferent {
  flowRate: BehaviorSubject<boolean>,
  density: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  outletTemperature: BehaviorSubject<boolean>,
  specificHeat: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
}

export interface WaterCoolingLossDifferent {
  flowRate: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  outletTemperature: BehaviorSubject<boolean>,
  correctionFactor: BehaviorSubject<boolean>,
}
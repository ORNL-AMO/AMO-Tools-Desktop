import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { CoolingLoss } from "../../../shared/models/losses/coolingLoss";
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

  initDifferentObject(): CoolingLossDifferent {
    let tmpGasDifferent: GasCoolingLossDifferent = {
      flowRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      finalTemperature: new BehaviorSubject<boolean>(null),
      specificHeat: new BehaviorSubject<boolean>(null),
      correctionFactor: new BehaviorSubject<boolean>(null),
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
    this.checkCoolingLossType()
    this.checkFlowRateGas();
    this.checkInitialTemperatureGas();
    this.checkFinalTemperatureGas();
    this.checkSpecificHeatGas();
    this.checkCorrectFactorGas();
    this.checkFlowRateLiquid();
    this.checkDensityLiquid();
    this.checkInitialTemperatureLiquid();
    this.checkOutletTemperatureLiquid();
    this.checkSpecificHeatLiquid();
    this.checkCorrectionFactorLiquid();
    this.checkFlowRateWater();
    this.checkInitialTemperatureWater();
    this.checkOutletTemperatureWater();
    this.checkCorrectionFactorWater();
  }

  //coolingLossType
  checkCoolingLossType() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType != this.modifiedCoolingLosses[lossIndex].coolingLossType) {
          this.differentArray[lossIndex].different.coolingLossType.next(true);
        } else {
          this.differentArray[lossIndex].different.coolingLossType.next(false);
        }
      }
    }
  }
  //gas ( 'Other Gas' )
  //flowRate
  checkFlowRateGas() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Gas') {
          if (this.baselineCoolingLosses[lossIndex].gasCoolingLoss.flowRate != this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.flowRate) {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.flowRate.next(true);
          } else {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.flowRate.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureGas() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Gas') {
          if (this.baselineCoolingLosses[lossIndex].gasCoolingLoss.initialTemperature != this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.initialTemperature) {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //finalTemperature
  checkFinalTemperatureGas() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Gas') {
          if (this.baselineCoolingLosses[lossIndex].gasCoolingLoss.finalTemperature != this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.finalTemperature) {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.finalTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.finalTemperature.next(false);
          }
        }
      }
    }
  }
  //specificHeat
  checkSpecificHeatGas() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Gas') {
          if (this.baselineCoolingLosses[lossIndex].gasCoolingLoss.specificHeat != this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.specificHeat) {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.specificHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.specificHeat.next(false);
          }
        }
      }
    }
  }
  //correctionFactor
  checkCorrectFactorGas() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Gas' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Gas') {
          if (this.baselineCoolingLosses[lossIndex].gasCoolingLoss.correctionFactor != this.modifiedCoolingLosses[lossIndex].gasCoolingLoss.correctionFactor) {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.correctionFactor.next(true);
          } else {
            this.differentArray[lossIndex].different.gasCoolingLossDifferent.correctionFactor.next(false);
          }
        }
      }
    }
  }

  //liquid ( 'Other Liquid' )
  //flowRate
  checkFlowRateLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.flowRate != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.flowRate) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.flowRate.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.flowRate.next(false);
          }
        }
      }
    }
  }
  //density
  checkDensityLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.density != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.density) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.density.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.density.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.initialTemperature != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.initialTemperature) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //outletTemperature
  checkOutletTemperatureLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.outletTemperature != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.outletTemperature) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.outletTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.outletTemperature.next(false);
          }
        }
      }
    }
  }
  //specificHeat
  checkSpecificHeatLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.specificHeat != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.specificHeat) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.specificHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.specificHeat.next(false);
          }
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactorLiquid() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Other Liquid' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Other Liquid') {
          if (this.baselineCoolingLosses[lossIndex].liquidCoolingLoss.correctionFactor != this.modifiedCoolingLosses[lossIndex].liquidCoolingLoss.correctionFactor) {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.correctionFactor.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidCoolingLossDifferent.correctionFactor.next(false);
          }
        }
      }
    }
  }

  //water ( 'Water' )
  //flowRate
  checkFlowRateWater() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Water' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Water') {
          if (this.baselineCoolingLosses[lossIndex].waterCoolingLoss.flowRate != this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.flowRate) {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.flowRate.next(true);
          } else {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.flowRate.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureWater() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Water' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Water') {
          if (this.baselineCoolingLosses[lossIndex].waterCoolingLoss.initialTemperature != this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.initialTemperature) {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //outletTemperature
  checkOutletTemperatureWater() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Water' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Water') {
          if (this.baselineCoolingLosses[lossIndex].waterCoolingLoss.outletTemperature != this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.outletTemperature) {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.outletTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.outletTemperature.next(false);
          }
        }
      }
    }
  }
  //correctionFactor
  checkCorrectionFactorWater() {
    if (this.baselineCoolingLosses && this.modifiedCoolingLosses) {
      for (let lossIndex = 0; lossIndex < this.baselineCoolingLosses.length; lossIndex++) {
        if (this.baselineCoolingLosses[lossIndex].coolingLossType == 'Water' && this.modifiedCoolingLosses[lossIndex].coolingLossType == 'Water') {
          if (this.baselineCoolingLosses[lossIndex].waterCoolingLoss.correctionFactor != this.modifiedCoolingLosses[lossIndex].waterCoolingLoss.correctionFactor) {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.correctionFactor.next(true);
          } else {
            this.differentArray[lossIndex].different.waterCoolingLossDifferent.correctionFactor.next(false);
          }
        }
      }
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
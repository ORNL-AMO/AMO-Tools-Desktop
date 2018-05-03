import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { CoolingLoss } from "../../../shared/models/phast/losses/coolingLoss";
import { PHAST } from '../../../shared/models/phast/phast';
@Injectable()
export class CoolingLossesCompareService {

  baselineCoolingLosses: CoolingLoss[];
  modifiedCoolingLosses: CoolingLoss[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineCoolingLosses.length;
    let isDiff: boolean = false;
    if (this.modifiedCoolingLosses) {
      for (index; index < numLoss; index++) {
        let typeCheck = this.compareLossType(index);
        if (typeCheck == false) {
          if (this.baselineCoolingLosses[index].coolingLossType == 'Liquid') {
            if (this.compareLiquidLoss(index) == true) {
              isDiff = true;
            }
          } else if (this.baselineCoolingLosses[index].coolingLossType == 'Gas') {
            if (this.compareGasLoss(index) == true) {
              isDiff = true;
            }
          }
        } else {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }

  compareLossType(index: number) {
    return this.compare(this.baselineCoolingLosses[index].coolingLossType, this.modifiedCoolingLosses[index].coolingLossType);
  }

  compareCoolingMedium(index: number) {
    return this.compare(this.baselineCoolingLosses[index].coolingMedium, this.modifiedCoolingLosses[index].coolingMedium);
  }
  //gas
  compareGasLoss(index: number): boolean {
    return (
      this.compareGasFlowRate(index) ||
      this.compareGasInitialTemperature(index) ||
      this.compareGasFinalTemperature(index) ||
      this.compareGasSpecificHeat(index) ||
      this.compareGasCorrectionFactor(index) ||
      this.compareGasDensity(index) ||
      this.compareCoolingMedium(index)
    )
  }
  compareGasFlowRate(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.flowRate, this.modifiedCoolingLosses[index].gasCoolingLoss.flowRate);
  }
  compareGasInitialTemperature(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.initialTemperature, this.modifiedCoolingLosses[index].gasCoolingLoss.initialTemperature);
  }
  compareGasFinalTemperature(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.finalTemperature, this.modifiedCoolingLosses[index].gasCoolingLoss.finalTemperature);
  }
  compareGasSpecificHeat(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.specificHeat, this.modifiedCoolingLosses[index].gasCoolingLoss.specificHeat);
  }
  compareGasCorrectionFactor(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.correctionFactor, this.modifiedCoolingLosses[index].gasCoolingLoss.correctionFactor);
  }
  compareGasDensity(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].gasCoolingLoss.gasDensity, this.modifiedCoolingLosses[index].gasCoolingLoss.gasDensity);
  }

  //liquid
  compareLiquidLoss(index: number): boolean {
    return (
      this.compareLiquidFlowRate(index) ||
      this.compareLiquidDensity(index) ||
      this.compareLiquidInitialTemperature(index) ||
      this.compareLiquidOutletTemperature(index) ||
      this.compareLiquidSpecificHeat(index) ||
      this.compareLiquidCorrectionFactor(index) ||
      this.compareCoolingMedium(index)
    )
  }
  compareLiquidFlowRate(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.flowRate, this.modifiedCoolingLosses[index].liquidCoolingLoss.flowRate);
  }
  compareLiquidDensity(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.density, this.modifiedCoolingLosses[index].liquidCoolingLoss.density);
  }
  compareLiquidInitialTemperature(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.initialTemperature, this.modifiedCoolingLosses[index].liquidCoolingLoss.initialTemperature);
  }
  compareLiquidOutletTemperature(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.outletTemperature, this.modifiedCoolingLosses[index].liquidCoolingLoss.outletTemperature);
  }
  compareLiquidSpecificHeat(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.specificHeat, this.modifiedCoolingLosses[index].liquidCoolingLoss.specificHeat);
  }
  compareLiquidCorrectionFactor(index: number): boolean {
    return this.compare(this.baselineCoolingLosses[index].liquidCoolingLoss.correctionFactor, this.modifiedCoolingLosses[index].liquidCoolingLoss.correctionFactor);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.coolingLosses) {
        let index = 0;
        baseline.losses.coolingLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.coolingLosses[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: CoolingLoss, modification: CoolingLoss) {
    let isDiff: boolean = false;
    if (this.compare(baseline.coolingLossType, modification.coolingLossType)) {
      isDiff = true;
    } else {
      if (baseline.coolingLossType == 'Gas') {
        if (this.compare(baseline.gasCoolingLoss.flowRate, modification.gasCoolingLoss.flowRate) ||
          this.compare(baseline.gasCoolingLoss.initialTemperature, modification.gasCoolingLoss.initialTemperature) ||
          this.compare(baseline.gasCoolingLoss.finalTemperature, modification.gasCoolingLoss.finalTemperature) ||
          this.compare(baseline.gasCoolingLoss.specificHeat, modification.gasCoolingLoss.specificHeat) ||
          this.compare(baseline.gasCoolingLoss.gasDensity, modification.gasCoolingLoss.gasDensity) ||
          this.compare(baseline.gasCoolingLoss.correctionFactor, modification.gasCoolingLoss.correctionFactor)) {
          isDiff = true;
        }
      } else if (baseline.coolingLossType == 'Liquid') {
        if (this.compare(baseline.liquidCoolingLoss.flowRate, modification.liquidCoolingLoss.flowRate) ||
          this.compare(baseline.liquidCoolingLoss.initialTemperature, modification.liquidCoolingLoss.initialTemperature) ||
          this.compare(baseline.liquidCoolingLoss.outletTemperature, modification.liquidCoolingLoss.outletTemperature) ||
          this.compare(baseline.liquidCoolingLoss.specificHeat, modification.liquidCoolingLoss.specificHeat) ||
          this.compare(baseline.liquidCoolingLoss.specificHeat, modification.liquidCoolingLoss.specificHeat) ||
          this.compare(baseline.liquidCoolingLoss.correctionFactor, modification.liquidCoolingLoss.correctionFactor)) {
          isDiff = true;
        }
      }
    }
    return isDiff
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

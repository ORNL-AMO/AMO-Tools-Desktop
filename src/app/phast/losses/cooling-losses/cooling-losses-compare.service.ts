import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { CoolingLoss } from "../../../shared/models/phast/losses/coolingLoss";
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

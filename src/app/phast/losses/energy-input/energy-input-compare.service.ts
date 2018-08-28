import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class EnergyInputCompareService {

  baselineEnergyInput: EnergyInputEAF[];
  modifiedEnergyInput: EnergyInputEAF[];

  constructor() {
  }
  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineEnergyInput.length;
    let isDiff: boolean = false;
    if (this.modifiedEnergyInput) {
      for (index; index < numLoss; index++) {
        if (this.compareLoss(index) == true) {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }

  compareLoss(index: number): boolean {
    return (
      this.compareNaturalGasHeatInput(index) ||
      this.compareFlowRateInput(index) ||
      this.compareCoalCarbonInjection(index) ||
      this.compareCoalHeatingValue(index) ||
      this.compareElectrodeUse(index) ||
      this.compareElectrodeHeatingValue(index) ||
      this.compareOtherFuels(index) ||
      this.compareElectricityInput(index)
    )
  }

  compareNaturalGasHeatInput(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].naturalGasHeatInput, this.modifiedEnergyInput[index].naturalGasHeatInput);
  }
  compareFlowRateInput(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].flowRateInput, this.modifiedEnergyInput[index].flowRateInput);
  }
  compareCoalCarbonInjection(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].coalCarbonInjection, this.modifiedEnergyInput[index].coalCarbonInjection);
  }
  compareCoalHeatingValue(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].coalHeatingValue, this.modifiedEnergyInput[index].coalHeatingValue);
  }
  compareElectrodeUse(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].electrodeUse, this.modifiedEnergyInput[index].electrodeUse);
  }
  compareElectrodeHeatingValue(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].electrodeHeatingValue, this.modifiedEnergyInput[index].electrodeHeatingValue);
  }
  compareOtherFuels(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].otherFuels, this.modifiedEnergyInput[index].otherFuels);
  }
  compareElectricityInput(index: number): boolean {
    return this.compare(this.baselineEnergyInput[index].electricityInput, this.modifiedEnergyInput[index].electricityInput);
  }

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.energyInputEAF) {
        let index = 0;
        baseline.losses.energyInputEAF.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.energyInputEAF[index]) == true) {
            isDiff = true;
          }
          index++;
        })
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: EnergyInputEAF, modification: EnergyInputEAF): boolean {
    return (
      this.compare(baseline.naturalGasHeatInput, modification.naturalGasHeatInput) ||
      this.compare(baseline.coalCarbonInjection, modification.coalCarbonInjection) ||
      this.compare(baseline.coalHeatingValue, modification.coalHeatingValue) ||
      this.compare(baseline.electrodeUse, modification.electrodeUse) ||
      this.compare(baseline.electrodeHeatingValue, modification.electrodeHeatingValue) ||
      this.compare(baseline.otherFuels, modification.otherFuels) ||
      this.compare(baseline.electricityInput, modification.electricityInput) ||
      this.compare(baseline.flowRateInput, modification.flowRateInput)
    )
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
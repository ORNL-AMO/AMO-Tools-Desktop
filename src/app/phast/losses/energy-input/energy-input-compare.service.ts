import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { EnergyInput } from '../../../shared/models/losses/energyInput';

@Injectable()
export class EnergyInputCompareService {

  baselineEnergyInput: EnergyInput[];
  modifiedEnergyInput: EnergyInput[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      if (this.baselineEnergyInput.length == this.modifiedEnergyInput.length) {
        let numLosses = this.baselineEnergyInput.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkEnergyInputs();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): EnergyInputDifferent {
    let tmpDifferent: EnergyInputDifferent = {
      naturalGasHeatInput: new BehaviorSubject<boolean>(null),
      naturalGasFlow: new BehaviorSubject<boolean>(null),
      measuredOxygenFlow: new BehaviorSubject<boolean>(null),
      coalCarbonInjection: new BehaviorSubject<boolean>(null),
      coalHeatingValue: new BehaviorSubject<boolean>(null),
      electrodeUse: new BehaviorSubject<boolean>(null),
      electrodeHeatingValue: new BehaviorSubject<boolean>(null),
      otherFuels: new BehaviorSubject<boolean>(null),
      electricityInput: new BehaviorSubject<boolean>(null)
    }
    return tmpDifferent;
  }

  checkEnergyInputs() {
    this.checkNaturalGasFlow();
    this.checkNaturalGasHeatInput();
    this.checkMeasureOxygenFlow();
    this.checkCoalCarbonInjection();
    this.checkCoalHeatingValue();
    this.checkElectrodeUse();
    this.checkElectrodeHeatingValue();
    this.checkOtherFuels();
    this.checkElectricityInput();
  }

  //naturalGasHeatInput
  checkNaturalGasHeatInput(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].naturalGasHeatInput != this.modifiedEnergyInput[lossIndex].naturalGasHeatInput) {
          this.differentArray[lossIndex].different.naturalGasHeatInput.next(true);
        } else {
          this.differentArray[lossIndex].different.naturalGasHeatInput.next(false);
        }
      }
    }
  }
  //naturalGasFlow
  checkNaturalGasFlow(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].naturalGasFlow != this.modifiedEnergyInput[lossIndex].naturalGasFlow) {
          this.differentArray[lossIndex].different.naturalGasFlow.next(true);
        } else {
          this.differentArray[lossIndex].different.naturalGasFlow.next(false);
        }
      }
    }
  }
  //measuredOxygenFlow
  checkMeasureOxygenFlow(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].measuredOxygenFlow != this.modifiedEnergyInput[lossIndex].measuredOxygenFlow) {
          this.differentArray[lossIndex].different.measuredOxygenFlow.next(true);
        } else {
          this.differentArray[lossIndex].different.measuredOxygenFlow.next(false);
        }
      }
    }
  }
  //coalCarbonInjection
  checkCoalCarbonInjection(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].coalCarbonInjection != this.modifiedEnergyInput[lossIndex].coalCarbonInjection) {
          this.differentArray[lossIndex].different.coalCarbonInjection.next(true);
        } else {
          this.differentArray[lossIndex].different.coalCarbonInjection.next(false);
        }
      }
    }
  }
  //coalHeatingValue
  checkCoalHeatingValue(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].coalHeatingValue != this.modifiedEnergyInput[lossIndex].coalHeatingValue) {
          this.differentArray[lossIndex].different.coalHeatingValue.next(true);
        } else {
          this.differentArray[lossIndex].different.coalHeatingValue.next(false);
        }
      }
    }
  }
  //electrodeUse
  checkElectrodeUse(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].electrodeUse != this.modifiedEnergyInput[lossIndex].electrodeUse) {
          this.differentArray[lossIndex].different.electrodeUse.next(true);
        } else {
          this.differentArray[lossIndex].different.electrodeUse.next(false);
        }
      }
    }
  }
  //electrodeHeatingValue
  checkElectrodeHeatingValue(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].electrodeHeatingValue != this.modifiedEnergyInput[lossIndex].electrodeHeatingValue) {
          this.differentArray[lossIndex].different.electrodeHeatingValue.next(true);
        } else {
          this.differentArray[lossIndex].different.electrodeHeatingValue.next(false);
        }
      }
    }
  }
  //otherFuels
  checkOtherFuels(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].otherFuels != this.modifiedEnergyInput[lossIndex].otherFuels) {
          this.differentArray[lossIndex].different.otherFuels.next(true);
        } else {
          this.differentArray[lossIndex].different.otherFuels.next(false);
        }
      }
    }
  }
  //electricityInput
  checkElectricityInput(){
    if (this.baselineEnergyInput && this.modifiedEnergyInput) {
      for (let lossIndex = 0; lossIndex < this.baselineEnergyInput.length; lossIndex++) {
        if (this.baselineEnergyInput[lossIndex].electricityInput != this.modifiedEnergyInput[lossIndex].electricityInput) {
          this.differentArray[lossIndex].different.electricityInput.next(true);
        } else {
          this.differentArray[lossIndex].different.electricityInput.next(false);
        }
      }
    }
  }

}

export interface EnergyInputDifferent {
  naturalGasHeatInput: BehaviorSubject<boolean>,
  naturalGasFlow: BehaviorSubject<boolean>,
  measuredOxygenFlow: BehaviorSubject<boolean>,
  coalCarbonInjection: BehaviorSubject<boolean>,
  coalHeatingValue: BehaviorSubject<boolean>,
  electrodeUse: BehaviorSubject<boolean>,
  electrodeHeatingValue: BehaviorSubject<boolean>,
  otherFuels: BehaviorSubject<boolean>,
  electricityInput: BehaviorSubject<boolean>
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlueGas } from "../../../shared/models/losses/flueGas";

@Injectable()
export class FlueGasCompareService {
  baselineFlueGasLoss: FlueGas[];
  modifiedFlueGasLoss: FlueGas[];

  differentArray: Array<any>;

  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      if (this.baselineFlueGasLoss.length == this.modifiedFlueGasLoss.length) {
        let numLosses = this.baselineFlueGasLoss.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkFlueGasLosses();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): FlueGasDifferent {
    let tmpByVolume: FlueGasVolumeDifferent = {
      gasTypeId: new BehaviorSubject<boolean>(null),
      flueGasTemperature: new BehaviorSubject<boolean>(null),
      excessAirPercentage: new BehaviorSubject<boolean>(null),
      combustionAirTemperature: new BehaviorSubject<boolean>(null),
    }
    let tmpByMass: FlueGasMassDifferent = {
      gasTypeId: new BehaviorSubject<boolean>(null),
      flueGasTemperature: new BehaviorSubject<boolean>(null),
      excessAirPercentage: new BehaviorSubject<boolean>(null),
      combustionAirTemperature: new BehaviorSubject<boolean>(null),
      fuelTemperature: new BehaviorSubject<boolean>(null),
      ashDischargeTemperature: new BehaviorSubject<boolean>(null),
      moistureInAirComposition: new BehaviorSubject<boolean>(null),
      unburnedCarbonInAsh: new BehaviorSubject<boolean>(null),
    }
    let tmpDifferent: FlueGasDifferent = {
      flueGasType: new BehaviorSubject<boolean>(null),
      flueGasVolumeDifferent: tmpByVolume,
      flueGasMassDifferent: tmpByMass
    }
    return tmpDifferent;
  }

  checkFlueGasLosses() {
    //volume
    this.checkGasTypeIdVolume();
    this.checkFlueGasTemperatureVolume();
    this.checkExcessAirPercentageVolume();
    this.checkCombustionAirTemperatureVolume();
    //mass
    this.checkGasTypeIdMass();
    this.checkFlueGasTemperatureMass();
    this.checkCombustionAirTemperatureMass();
    this.checkFuelTemperature();
    this.checkAshDischargeTemperature();
    this.checkMoistureInAirComposition();
    this.checkUnburnedCarbonInAsh();
    this.checkExcessAirPercentageMass();
  }

  //volume
  //gasTypeId
  checkGasTypeIdVolume() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Volume" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Volume") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByVolume.gasTypeId != this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.gasTypeId) {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.gasTypeId.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.gasTypeId.next(false);
          }
        }
      }
    }
  }
  //flueGasTemperature
  checkFlueGasTemperatureVolume() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Volume" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Volume") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByVolume.flueGasTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.flueGasTemperature) {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.next(false);
          }
        }
      }
    }
  }
  //excessAirPercentage
  checkExcessAirPercentageVolume() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Volume" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Volume") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByVolume.excessAirPercentage != this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.excessAirPercentage) {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.next(false);
          }
        }
      }
    }
  }
  //combustionAirTemperature
  checkCombustionAirTemperatureVolume() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Volume" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Volume") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByVolume.combustionAirTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.combustionAirTemperature) {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.next(false);
          }
        }
      }
    }
  }
  //mass
  //gasTypeId
  checkGasTypeIdMass() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.gasTypeId != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.gasTypeId) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.gasTypeId.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.gasTypeId.next(false);
          }
        }
      }
    }
  }
  //flueGasTemperature
  checkFlueGasTemperatureMass() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.flueGasTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.flueGasTemperature) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.flueGasTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.flueGasTemperature.next(false);
          }
        }
      }
    }
  }
  //combustionAirTemperature
  checkCombustionAirTemperatureMass() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.combustionAirTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.combustionAirTemperature) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.combustionAirTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.combustionAirTemperature.next(false);
          }
        }
      }
    }
  }
  //fuelTemperature
  checkFuelTemperature() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.fuelTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.fuelTemperature) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.fuelTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.fuelTemperature.next(false);
          }
        }
      }
    }
  }
  //ashDischargeTemperature
  checkAshDischargeTemperature() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.ashDischargeTemperature != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.ashDischargeTemperature) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.next(false);
          }
        }
      }
    }
  }
  //moistureInAirComposition
  checkMoistureInAirComposition() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.moistureInAirComposition != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.moistureInAirComposition) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.moistureInAirComposition.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.moistureInAirComposition.next(false);
          }
        }
      }
    }
  }
  //unburnedCarbonInAsh
  checkUnburnedCarbonInAsh() {
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.unburnedCarbonInAsh != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.unburnedCarbonInAsh) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.next(false);
          }
        }
      }
    }
  }
  //excessAirPercentage
  checkExcessAirPercentageMass(){
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      for (let lossIndex = 0; lossIndex < this.baselineFlueGasLoss.length; lossIndex++) {
        if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
          if (this.baselineFlueGasLoss[lossIndex].flueGasByMass.excessAirPercentage != this.modifiedFlueGasLoss[lossIndex].flueGasByMass.excessAirPercentage) {
            this.differentArray[lossIndex].different.flueGasMassDifferent.excessAirPercentage.next(true);
          } else {
            this.differentArray[lossIndex].different.flueGasMassDifferent.excessAirPercentage.next(false);
          }
        }
      }
    }
  }
}

export interface FlueGasDifferent {
  flueGasType: BehaviorSubject<boolean>,
  flueGasVolumeDifferent: FlueGasVolumeDifferent,
  flueGasMassDifferent: FlueGasMassDifferent
}

export interface FlueGasVolumeDifferent {
  gasTypeId: BehaviorSubject<boolean>,
  flueGasTemperature: BehaviorSubject<boolean>,
  excessAirPercentage: BehaviorSubject<boolean>,
  combustionAirTemperature: BehaviorSubject<boolean>,
}

export interface FlueGasMassDifferent {
  gasTypeId: BehaviorSubject<boolean>,
  flueGasTemperature: BehaviorSubject<boolean>,
  excessAirPercentage: BehaviorSubject<boolean>,
  combustionAirTemperature: BehaviorSubject<boolean>,
  fuelTemperature: BehaviorSubject<boolean>,
  ashDischargeTemperature: BehaviorSubject<boolean>,
  moistureInAirComposition: BehaviorSubject<boolean>,
  unburnedCarbonInAsh: BehaviorSubject<boolean>,
}
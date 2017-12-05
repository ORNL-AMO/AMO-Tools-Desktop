import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlueGas } from "../../../shared/models/phast/losses/flueGas";

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

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
  }

  initDifferentObject(): FlueGasDifferent {
    let tmpByVolume: FlueGasVolumeDifferent = {
      gasTypeId: new BehaviorSubject<boolean>(null),
      flueGasTemperature: new BehaviorSubject<boolean>(null),
      excessAirPercentage: new BehaviorSubject<boolean>(null),
      combustionAirTemperature: new BehaviorSubject<boolean>(null),
      fuelTemperature: new BehaviorSubject<boolean>(null),
      oxygenCalculationMethod: new BehaviorSubject<boolean>(null),
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
    if (this.baselineFlueGasLoss && this.modifiedFlueGasLoss) {
      if (this.baselineFlueGasLoss.length != 0 && this.modifiedFlueGasLoss.length != 0 && this.baselineFlueGasLoss.length == this.modifiedFlueGasLoss.length) {
        for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
          //volume
          if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Volume" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Volume") {
            //gasTypeId
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.gasTypeId.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByVolume.gasTypeId, this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.gasTypeId))
            //flueGasTemperature
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByVolume.flueGasTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.flueGasTemperature))
            //excessAirPercentage
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByVolume.excessAirPercentage, this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.excessAirPercentage))
            //combustionAirTemperature
            this.differentArray[lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByVolume.combustionAirTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByVolume.combustionAirTemperature))
          }
          //mass
          else if (this.baselineFlueGasLoss[lossIndex].flueGasType == "By Mass" && this.modifiedFlueGasLoss[lossIndex].flueGasType == "By Mass") {
            //gasTypeId
            this.differentArray[lossIndex].different.flueGasMassDifferent.gasTypeId.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.gasTypeId, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.gasTypeId))
            //flueGasTemperature
            this.differentArray[lossIndex].different.flueGasMassDifferent.flueGasTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.flueGasTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.flueGasTemperature))
            //excessAirPercentage
            this.differentArray[lossIndex].different.flueGasMassDifferent.excessAirPercentage.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.excessAirPercentage, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.excessAirPercentage))
            //combustionAirTemperature
            this.differentArray[lossIndex].different.flueGasMassDifferent.combustionAirTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.combustionAirTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.combustionAirTemperature))
            //fuelTemperature
            this.differentArray[lossIndex].different.flueGasMassDifferent.fuelTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.fuelTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.fuelTemperature))
            //ashDischargeTemperature
            this.differentArray[lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.ashDischargeTemperature, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.ashDischargeTemperature))
            //moistureInAirComposition
            this.differentArray[lossIndex].different.flueGasMassDifferent.moistureInAirComposition.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.moistureInAirComposition, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.moistureInAirComposition))
            //unburnedCarbonInAsh
            this.differentArray[lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.next(this.compare(this.baselineFlueGasLoss[lossIndex].flueGasByMass.unburnedCarbonInAsh, this.modifiedFlueGasLoss[lossIndex].flueGasByMass.unburnedCarbonInAsh))
          } else {
            this.disableIndexed(lossIndex);
          }
        }
      } else {
        this.disableAll();
      }
    }
    else if ((this.baselineFlueGasLoss && !this.modifiedFlueGasLoss) || (!this.baselineFlueGasLoss && this.modifiedFlueGasLoss)) {
      this.disableAll();
    }
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.differentArray.length; lossIndex++) {
      this.differentArray[lossIndex].different.flueGasVolumeDifferent.gasTypeId.next(false);
      this.differentArray[lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.next(false);
      this.differentArray[lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasVolumeDifferent.fuelTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.gasTypeId.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.flueGasTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.excessAirPercentage.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.combustionAirTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.fuelTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.moistureInAirComposition.next(false);
      this.differentArray[lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.next(false);
    }
  }

  disableIndexed(lossIndex: number) {
    this.differentArray[lossIndex].different.flueGasVolumeDifferent.gasTypeId.next(false);
    this.differentArray[lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.next(false);
    this.differentArray[lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasVolumeDifferent.fuelTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.gasTypeId.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.flueGasTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.excessAirPercentage.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.combustionAirTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.fuelTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.moistureInAirComposition.next(false);
    this.differentArray[lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.next(false);
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
  fuelTemperature: BehaviorSubject<boolean>,
  oxygenCalculationMethod: BehaviorSubject<boolean>,
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

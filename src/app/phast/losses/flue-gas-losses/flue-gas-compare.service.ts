import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlueGas } from "../../../shared/models/phast/losses/flueGas";

@Injectable()
export class FlueGasCompareService {
  baselineFlueGasLoss: FlueGas[];
  modifiedFlueGasLoss: FlueGas[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllLosses() {
    let index = 0;
    let numLoss = this.baselineFlueGasLoss.length;
    let isDiff: boolean = false;
    if (this.modifiedFlueGasLoss) {
      for (index; index < numLoss; index++) {
        let typeCheck = this.compareLossType(index);
        if (typeCheck == false) {
          if (this.baselineFlueGasLoss[index].flueGasType == 'By Volume') {
            if (this.compareByVolumeLoss(index) == true) {
              isDiff = true;
            }
          } else if (this.baselineFlueGasLoss[index].flueGasType == 'By Mass') {
            if (this.compareByMassLoss(index) == true) {
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
    return this.compare(this.baselineFlueGasLoss[index].flueGasType, this.modifiedFlueGasLoss[index].flueGasType);
  }
  //by mass
  compareByMassLoss(index: number) {
    return (this.compareMassGasTypeId(index) ||
      this.compareMassFlueGasTemperature(index) ||
      this.compareMassExcessAirPercentage(index) ||
      this.compareMassCombustionAirTemperature(index) ||
      this.compareMassFuelTemperature(index) ||
      this.compareMassAshDischargeTemperature(index) ||
      this.compareMassMoistureInAirComposition(index) ||
      this.compareMassUnburnedCarbonInAsh(index))
  }
  compareMassGasTypeId(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.gasTypeId, this.modifiedFlueGasLoss[index].flueGasByMass.gasTypeId);
  }
  compareMassFlueGasTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.flueGasTemperature, this.modifiedFlueGasLoss[index].flueGasByMass.flueGasTemperature);
  }
  compareMassExcessAirPercentage(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.excessAirPercentage, this.modifiedFlueGasLoss[index].flueGasByMass.excessAirPercentage);
  }
  compareMassCombustionAirTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.combustionAirTemperature, this.modifiedFlueGasLoss[index].flueGasByMass.combustionAirTemperature);
  }
  compareMassFuelTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.fuelTemperature, this.modifiedFlueGasLoss[index].flueGasByMass.fuelTemperature);
  }
  compareMassAshDischargeTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.ashDischargeTemperature, this.modifiedFlueGasLoss[index].flueGasByMass.ashDischargeTemperature);
  }
  compareMassMoistureInAirComposition(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.moistureInAirComposition, this.modifiedFlueGasLoss[index].flueGasByMass.moistureInAirComposition);
  }
  compareMassUnburnedCarbonInAsh(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.unburnedCarbonInAsh, this.modifiedFlueGasLoss[index].flueGasByMass.unburnedCarbonInAsh);
  }
  compareMassOxygenCalculationMethod(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.oxygenCalculationMethod, this.modifiedFlueGasLoss[index].flueGasByMass.oxygenCalculationMethod);
  }
  //by volume
  compareByVolumeLoss(index: number) {
    return (this.compareVolumeGasTypeId(index) ||
      this.compareVolumeFlueGasTemperature(index) ||
      this.compareVolumeExcessAirPercentage(index) ||
      this.compareVolumeCombustionAirTemperature(index) ||
      this.compareVolumeFuelTemperature(index) ||
      this.compareVolumeOxygenCalculationMethod(index))
  }
  compareVolumeGasTypeId(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.gasTypeId, this.modifiedFlueGasLoss[index].flueGasByVolume.gasTypeId);
  }
  compareVolumeFlueGasTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.flueGasTemperature, this.modifiedFlueGasLoss[index].flueGasByVolume.flueGasTemperature);
  }
  compareVolumeExcessAirPercentage(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.excessAirPercentage, this.modifiedFlueGasLoss[index].flueGasByVolume.excessAirPercentage);
  }
  compareVolumeCombustionAirTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.combustionAirTemperature, this.modifiedFlueGasLoss[index].flueGasByVolume.combustionAirTemperature);
  }
  compareVolumeFuelTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.fuelTemperature, this.modifiedFlueGasLoss[index].flueGasByVolume.fuelTemperature);
  }
  compareVolumeOxygenCalculationMethod(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.oxygenCalculationMethod, this.modifiedFlueGasLoss[index].flueGasByVolume.oxygenCalculationMethod);
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

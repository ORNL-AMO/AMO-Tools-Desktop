import { Injectable } from '@angular/core';
import { FlueGas } from "../../../shared/models/phast/losses/flueGas";
import { PHAST } from '../../../shared/models/phast/phast';
import { PsychrometricResults } from '../../../shared/models/fans';
import { BehaviorSubject } from 'rxjs';
import { BaseGasDensity } from '../../../shared/models/fans';

@Injectable()
export class FlueGasCompareService {
  baselineFlueGasLoss: FlueGas[];
  modifiedFlueGasLoss: FlueGas[];
  moistureSubject: BehaviorSubject<PsychrometricResults>;
  currentField: BehaviorSubject<string>;
  baseGasDensity: BaseGasDensity; 

  constructor() {
    this.baseGasDensity = {
      barometricPressure: 29.92,
      dewPoint: 0,
      dryBulbTemp: 68,
      gasDensity: 0.07516579558441701,
      gasType: "AIR",
      inputType: "relativeHumidity",
      relativeHumidity: 0,
      specificGravity: 1,
      specificHeatGas: 0.24,
      specificHeatRatio: 1.4,
      staticPressure: 0,
      wetBulbTemp: 118.999
    };
    this.moistureSubject = new BehaviorSubject<PsychrometricResults>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  setPsychrometricResults(results: PsychrometricResults) {
    this.moistureSubject.next(results);
  }

  setCurrentField(currField: string) {
    this.currentField.next(currField);
  }

  setCurrentDensity(currDensity: BaseGasDensity) {
    this.baseGasDensity = currDensity;
  }

  compareAllLosses() {
    let index = 0;
    let numLoss = this.baselineFlueGasLoss.length;
    let isDiff: boolean = false;
    if (this.modifiedFlueGasLoss) {
      for (index; index < numLoss; index++) {
        let typeCheck = this.compareLossType(index);
        if (typeCheck === false) {
          if (this.baselineFlueGasLoss[index].flueGasType === 'By Volume') {
            if (this.compareByVolumeLoss(index) === true) {
              isDiff = true;
            }
          } else if (this.baselineFlueGasLoss[index].flueGasType === 'By Mass') {
            if (this.compareByMassLoss(index) === true) {
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
      this.compareMassMoistureInAirCombustion(index) ||
      this.compareMassUnburnedCarbonInAsh(index));
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
  compareMassAmbientAirTemp(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.ambientAirTemp, this.modifiedFlueGasLoss[index].flueGasByMass.ambientAirTemp);
  }
  compareMassAshDischargeTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.ashDischargeTemperature, this.modifiedFlueGasLoss[index].flueGasByMass.ashDischargeTemperature);
  }
  compareMassMoistureInAirCombustion(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByMass.moistureInAirCombustion, this.modifiedFlueGasLoss[index].flueGasByMass.moistureInAirCombustion);
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
      this.compareVolumeOxygenCalculationMethod(index));
  }
  compareVolumeGasTypeId(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.gasTypeId, this.modifiedFlueGasLoss[index].flueGasByVolume.gasTypeId);
  }
  compareVolumeFlueGasTemperature(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.flueGasTemperature, this.modifiedFlueGasLoss[index].flueGasByVolume.flueGasTemperature);
  }
  compareVolumeAmbientAirTemp(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.ambientAirTemp, this.modifiedFlueGasLoss[index].flueGasByVolume.ambientAirTemp);
  }
  compareVolumeMoistureInAirCombustion(index: number) {
    return this.compare(this.baselineFlueGasLoss[index].flueGasByVolume.moistureInAirCombustion, this.modifiedFlueGasLoss[index].flueGasByVolume.moistureInAirCombustion);
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

  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.flueGasLosses) {
        let index = 0;
        baseline.losses.flueGasLosses.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.flueGasLosses[index]) === true) {
            isDiff = true;
          }
          index++;
        });
      }
    }
    return isDiff;
  }

  compareBaseModLoss(baseline: FlueGas, modification: FlueGas) {
    let isDiff: boolean = false;
    if (this.compare(baseline.flueGasType, modification.flueGasType)) {
      isDiff = true;
    } else {
      if (baseline.flueGasType === 'By Volume') {
        if (this.compare(baseline.flueGasByVolume.gasTypeId, modification.flueGasByVolume.gasTypeId) ||
          this.compare(baseline.flueGasByVolume.flueGasTemperature, modification.flueGasByVolume.flueGasTemperature) ||
          this.compare(baseline.flueGasByVolume.excessAirPercentage, modification.flueGasByVolume.excessAirPercentage) ||
          this.compare(baseline.flueGasByVolume.combustionAirTemperature, modification.flueGasByVolume.combustionAirTemperature) ||
          this.compare(baseline.flueGasByVolume.fuelTemperature, modification.flueGasByVolume.fuelTemperature) ||
          this.compare(baseline.flueGasByVolume.oxygenCalculationMethod, modification.flueGasByVolume.oxygenCalculationMethod)) {
          isDiff = true;
        }
      } else if (baseline.flueGasType === 'By Mass') {
        if (this.compare(baseline.flueGasByMass.gasTypeId, modification.flueGasByMass.gasTypeId) ||
          this.compare(baseline.flueGasByMass.flueGasTemperature, modification.flueGasByMass.flueGasTemperature) ||
          this.compare(baseline.flueGasByMass.excessAirPercentage, modification.flueGasByMass.excessAirPercentage) ||
          this.compare(baseline.flueGasByMass.combustionAirTemperature, modification.flueGasByMass.combustionAirTemperature) ||
          this.compare(baseline.flueGasByMass.fuelTemperature, modification.flueGasByMass.fuelTemperature) ||
          this.compare(baseline.flueGasByMass.ashDischargeTemperature, modification.flueGasByMass.ashDischargeTemperature) ||
          this.compare(baseline.flueGasByMass.moistureInAirCombustion, modification.flueGasByMass.moistureInAirCombustion) ||
          this.compare(baseline.flueGasByMass.unburnedCarbonInAsh, modification.flueGasByMass.unburnedCarbonInAsh) ||
          this.compare(baseline.flueGasByMass.oxygenCalculationMethod, modification.flueGasByMass.oxygenCalculationMethod)) {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }


  compare(a: any, b: any) {
    if (a && b) {
      if (a !== b) {
        return true;
      } else {
        return false;
      }
    }
    else if ((a && !b) || (!a && b)) {
      return true;
    } else {
      return false;
    }
  }

}

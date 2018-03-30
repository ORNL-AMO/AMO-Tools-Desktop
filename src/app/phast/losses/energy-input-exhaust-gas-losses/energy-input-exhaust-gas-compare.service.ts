import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';

@Injectable()
export class EnergyInputExhaustGasCompareService {
  baselineEnergyInputExhaustGasLosses: EnergyInputExhaustGasLoss[];
  modifiedEnergyInputExhaustGasLosses: EnergyInputExhaustGasLoss[];

  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }
  compareAllLosses(): boolean {
    let index = 0;
    let numLoss = this.baselineEnergyInputExhaustGasLosses.length;
    let isDiff: boolean = false;
    if (this.modifiedEnergyInputExhaustGasLosses) {
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
      this.compareExcessAir(index) ||
      this.compareCombustionAirTemp(index) ||
      this.compareExhaustGasTemp(index) ||
      this.compareTotalHeatInput(index) ||
      this.compareElectricalPowerInput(index)
    )
  }
  compareExcessAir(index: number): boolean {
    return this.compare(this.baselineEnergyInputExhaustGasLosses[index].excessAir, this.modifiedEnergyInputExhaustGasLosses[index].excessAir);
  }
  compareCombustionAirTemp(index: number): boolean {
    return this.compare(this.baselineEnergyInputExhaustGasLosses[index].combustionAirTemp, this.modifiedEnergyInputExhaustGasLosses[index].combustionAirTemp);
  }
  compareExhaustGasTemp(index: number): boolean {
    return this.compare(this.baselineEnergyInputExhaustGasLosses[index].exhaustGasTemp, this.modifiedEnergyInputExhaustGasLosses[index].exhaustGasTemp);
  }
  compareTotalHeatInput(index: number): boolean {
    return this.compare(this.baselineEnergyInputExhaustGasLosses[index].totalHeatInput, this.modifiedEnergyInputExhaustGasLosses[index].totalHeatInput);
  }
  compareElectricalPowerInput(index: number): boolean {
    return this.compare(this.baselineEnergyInputExhaustGasLosses[index].electricalPowerInput, this.modifiedEnergyInputExhaustGasLosses[index].electricalPowerInput);
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

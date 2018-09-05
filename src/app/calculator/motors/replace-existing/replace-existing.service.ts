import { Injectable } from '@angular/core';
import { ReplaceExistingData, ReplaceExistingResults } from './replace-existing.component';

@Injectable()
export class ReplaceExistingService {
  replaceExistingData: ReplaceExistingData = {
    operatingHours: 5200,
    motorSize: 150,
    existingEfficiency: 92,
    load: 75,
    electricityCost: 0.12,
    newEfficiency: 96,
    purchaseCost: 13000
  };
  constructor() { }

  getResults(inputs: ReplaceExistingData): ReplaceExistingResults {
    let results: ReplaceExistingResults = {
      existingEnergyUse: 0,
      newEnergyUse: 0,
      existingEnergyCost: 0,
      newEnergyCost: 0,
      annualEnergySavings: 0,
      costSavings: 0,
      simplePayback: 0
    };
  
    results.existingEnergyUse = this.getExistingEnergyUse(inputs);
    results.newEnergyUse = this.getNewEnergyUse(inputs);
    results.existingEnergyCost = this.getExistingEnergyCost(inputs, results);
    results.newEnergyCost = this.getNewEnergyCost(inputs, results);
    results.annualEnergySavings = this.getAnnualEnergySavings(results);
    results.costSavings = this.getCostSavings(inputs, results);
    results.simplePayback = this.getSimplePayback(inputs, results);

    return results;
  }

  getExistingEnergyUse(inputs: ReplaceExistingData): number {
    return .746 * inputs.motorSize * inputs.load * inputs.operatingHours * (1 / inputs.existingEfficiency);
  }
  getNewEnergyUse(inputs: ReplaceExistingData): number {
    return .746 * inputs.motorSize * inputs.load * inputs.operatingHours * (1 / inputs.newEfficiency);
  }
  getExistingEnergyCost(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return results.existingEnergyUse * inputs.electricityCost;
  }
  getNewEnergyCost(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return results.newEnergyUse * inputs.electricityCost;
  }
  getAnnualEnergySavings(results: ReplaceExistingResults): number {
    return results.existingEnergyUse - results.newEnergyUse;
  }
  getCostSavings(inputs: ReplaceExistingData, results: ReplaceExistingResults): number{
    return inputs.electricityCost * results.annualEnergySavings;
  }
  getSimplePayback(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return inputs.purchaseCost / results.costSavings;
  }

  //may want to add percent savings as a result. talk to kristina first
}

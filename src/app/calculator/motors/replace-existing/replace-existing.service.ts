import { Injectable } from '@angular/core';
import { ReplaceExistingData } from './replace-existing.component';

@Injectable()
export class ReplaceExistingService {

  constructor() { }

  getResults(inputs: ReplaceExistingData): { annualEnergySavings: number, costSavings: number } {
    let results: { annualEnergySavings: number, costSavings: number } = {
      annualEnergySavings: 0,
      costSavings: 0
    }
  
    results.annualEnergySavings = this.getEnergySavings(inputs);
    results.costSavings = this.getCostSavings(results.annualEnergySavings, inputs.electricityCost);
    return results;
  }


  getEnergySavings(inputs: ReplaceExistingData): number {
    //TODO: logic for energy calculation, see word doc in issue
    return 0;
  }

  getCostSavings(enerygSavings: number, cost: number): number{
    return enerygSavings * cost;
  }

  //may want to add percent savings as a result. talk to kristina first
}

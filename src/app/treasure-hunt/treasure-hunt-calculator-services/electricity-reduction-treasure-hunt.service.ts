import { Injectable } from '@angular/core';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { Settings } from '../../shared/models/settings';
import { ElectricityReductionResults } from '../../shared/models/standalone';
import { ElectricityReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class ElectricityReductionTreasureHuntService {
  constructor(private electricityReductionService: ElectricityReductionService) { }
  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(electricityReduction: ElectricityReductionTreasureHunt) {
    this.electricityReductionService.baselineData = electricityReduction.baseline;
    this.electricityReductionService.modificationData = electricityReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.electricityReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(electricityReduction: ElectricityReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.electricityReductions) {
      treasureHunt.electricityReductions = new Array();
    }
    treasureHunt.electricityReductions.push(electricityReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.electricityReductionService.baselineData = undefined;
    this.electricityReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(electricityReduction: ElectricityReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ElectricityReductionResults = this.electricityReductionService.getResults(settings, electricityReduction.baseline, electricityReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Electricity',
    }
    
    return treasureHuntOpportunityResults;
  }

}
import { Injectable } from '@angular/core';
import { CompressedAirReductionService } from '../../calculator/compressed-air/compressed-air-reduction/compressed-air-reduction.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirReductionResults } from '../../shared/models/standalone';
import { CompressedAirReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class CaReductionTreasureHuntService {

  constructor(private compressedAirReductionService: CompressedAirReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(compressedAirReduction: CompressedAirReductionTreasureHunt) {
    this.compressedAirReductionService.baselineData = compressedAirReduction.baseline;
    this.compressedAirReductionService.modificationData = compressedAirReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.compressedAirReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(compressedAirReduction: CompressedAirReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.compressedAirReductions) {
      treasureHunt.compressedAirReductions = new Array();
    }
    treasureHunt.compressedAirReductions.push(compressedAirReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.compressedAirReductionService.baselineData = undefined;
    this.compressedAirReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(compressedAirReduction: CompressedAirReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    this.compressedAirReductionService.calculateResults(settings, compressedAirReduction.baseline, compressedAirReduction.modification);
    let results: CompressedAirReductionResults = this.compressedAirReductionService.compressedAirResults.getValue(); 
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineAggregateResults.energyCost,
      modificationCost: results.modificationAggregateResults.energyCost,
      utilityType: '',
    }

    if (compressedAirReduction.baseline[0].utilityType == 0) {
      treasureHuntOpportunityResults.utilityType = 'Compressed Air';
    } else {
      treasureHuntOpportunityResults.utilityType = 'Electricity';
    }

    return treasureHuntOpportunityResults;
  }

}
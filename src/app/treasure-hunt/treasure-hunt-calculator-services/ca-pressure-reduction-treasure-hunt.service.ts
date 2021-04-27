import { Injectable } from '@angular/core';
import { CompressedAirPressureReductionService } from '../../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirPressureReductionResults } from '../../shared/models/standalone';
import { CompressedAirPressureReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class CaPressureReductionTreasureHuntService {

  constructor(private compressedAirPressureReductionService: CompressedAirPressureReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt) {
    this.compressedAirPressureReductionService.baselineData = compressedAirPressureReduction.baseline;
    this.compressedAirPressureReductionService.modificationData = compressedAirPressureReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.compressedAirPressureReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.compressedAirPressureReductions) {
      treasureHunt.compressedAirPressureReductions = new Array();
    }
    treasureHunt.compressedAirPressureReductions.push(compressedAirPressureReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.compressedAirPressureReductionService.baselineData = undefined;
    this.compressedAirPressureReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, compressedAirPressureReduction.baseline, compressedAirPressureReduction.modification);
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
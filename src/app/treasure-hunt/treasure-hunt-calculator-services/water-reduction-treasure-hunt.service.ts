import { Injectable } from '@angular/core';
import { WaterReductionService } from '../../calculator/waste-water/water-reduction/water-reduction.service';
import { Settings } from '../../shared/models/settings';
import { WaterReductionResults } from '../../shared/models/standalone';
import { TreasureHunt, TreasureHuntOpportunityResults, WaterReductionTreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class WaterReductionTreasureHuntService {

  constructor(private waterReductionService: WaterReductionService) { }
  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(waterReduction: WaterReductionTreasureHunt) {
    this.waterReductionService.baselineData = waterReduction.baseline;
    this.waterReductionService.modificationData = waterReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.waterReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(waterReduction: WaterReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.waterReductions) {
      treasureHunt.waterReductions = new Array();
    }
    treasureHunt.waterReductions.push(waterReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.waterReductionService.baselineData = undefined;
    this.waterReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(waterReduction: WaterReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: WaterReductionResults = this.waterReductionService.getResults(settings, waterReduction.baseline, waterReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualWaterSavings,
      baselineCost: results.baselineResults.waterCost,
      modificationCost: results.modificationResults.waterCost,
      utilityType: '',
    }

    if (waterReduction.baseline[0].isWastewater == true) {
      treasureHuntOpportunityResults.utilityType = 'Waste-Water';
    } else {
      treasureHuntOpportunityResults.utilityType = 'Water';
    }

    return treasureHuntOpportunityResults;
  }

}
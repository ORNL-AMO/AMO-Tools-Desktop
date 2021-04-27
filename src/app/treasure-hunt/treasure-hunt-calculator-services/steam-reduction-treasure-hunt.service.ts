import { Injectable } from '@angular/core';
import { SteamReductionService } from '../../calculator/steam/steam-reduction/steam-reduction.service';
import { Settings } from '../../shared/models/settings';
import { SteamReductionResults } from '../../shared/models/standalone';
import { SteamReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class SteamReductionTreasureHuntService {

  constructor(private steamReductionService: SteamReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(steamReduction: SteamReductionTreasureHunt) {
    this.steamReductionService.baselineData = steamReduction.baseline;
    this.steamReductionService.modificationData = steamReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.steamReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(steamReduction: SteamReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.steamReductions) {
      treasureHunt.steamReductions = new Array();
    }
    treasureHunt.steamReductions.push(steamReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.steamReductionService.baselineData = undefined;
    this.steamReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(steamReduction: SteamReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: SteamReductionResults = this.steamReductionService.getResults(settings, steamReduction.baseline, steamReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualSteamSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Steam',
    }

    if (steamReduction.baseline[0].utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
      treasureHuntOpportunityResults.energySavings = results.annualEnergySavings;
    } else if (steamReduction.baseline[0].utilityType == 2) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
      treasureHuntOpportunityResults.energySavings = results.annualEnergySavings;
    }

    return treasureHuntOpportunityResults;
  }

}
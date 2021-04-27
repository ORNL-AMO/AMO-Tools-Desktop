import { Injectable } from '@angular/core';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { Settings } from '../../shared/models/settings';
import { NaturalGasReductionResults } from '../../shared/models/standalone';
import { NaturalGasReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class NaturalGasReductionTreasureHuntService {

  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(naturalGasReduction: NaturalGasReductionTreasureHunt) {
    this.naturalGasReductionService.baselineData = naturalGasReduction.baseline;
    this.naturalGasReductionService.modificationData = naturalGasReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.naturalGasReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(naturalGasReduction: NaturalGasReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.naturalGasReductions) {
      treasureHunt.naturalGasReductions = new Array();
    }
    treasureHunt.naturalGasReductions.push(naturalGasReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.naturalGasReductionService.baselineData = undefined;
    this.naturalGasReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(naturalGasReduction: NaturalGasReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: NaturalGasReductionResults = this.naturalGasReductionService.getResults(settings, naturalGasReduction.baseline, naturalGasReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: 'Natural Gas',
    }

    return treasureHuntOpportunityResults;
  }

}
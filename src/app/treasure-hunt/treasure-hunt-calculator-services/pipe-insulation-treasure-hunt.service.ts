import { Injectable } from '@angular/core';
import { PipeInsulationReductionService } from '../../calculator/steam/pipe-insulation-reduction/pipe-insulation-reduction.service';
import { Settings } from '../../shared/models/settings';
import { PipeInsulationReductionResults } from '../../shared/models/standalone';
import { PipeInsulationReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class PipeInsulationTreasureHuntService {

  constructor(private pipeInsulationReductionService: PipeInsulationReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(pipeInsulationReduction: PipeInsulationReductionTreasureHunt) {
    this.pipeInsulationReductionService.baselineData = pipeInsulationReduction.baseline;
    this.pipeInsulationReductionService.modificationData = pipeInsulationReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.pipeInsulationReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.pipeInsulationReductions) {
      treasureHunt.pipeInsulationReductions = new Array();
    }
    treasureHunt.pipeInsulationReductions.push(pipeInsulationReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.pipeInsulationReductionService.baselineData = undefined;
    this.pipeInsulationReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: PipeInsulationReductionResults = this.pipeInsulationReductionService.getResults(settings, pipeInsulationReduction.baseline, pipeInsulationReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualHeatSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: '',
    }

    if (pipeInsulationReduction.baseline.utilityType == 0) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
    } else if (pipeInsulationReduction.modification.utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
    }

    return treasureHuntOpportunityResults;
  }

}
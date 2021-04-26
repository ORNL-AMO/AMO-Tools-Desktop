import { Injectable } from '@angular/core';
import { TankInsulationReductionService } from '../../calculator/steam/tank-insulation-reduction/tank-insulation-reduction.service';
import { Settings } from '../../shared/models/settings';
import { TankInsulationReductionResults } from '../../shared/models/standalone';
import { TankInsulationReductionTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class TankInsulationTreasureHuntService {

  constructor(private tankInsulationReductionService: TankInsulationReductionService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(tankInsulationReduction: TankInsulationReductionTreasureHunt) {
    this.tankInsulationReductionService.baselineData = tankInsulationReduction.baseline;
    this.tankInsulationReductionService.modificationData = tankInsulationReduction.modification;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.tankInsulationReductions.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(tankInsulationReduction: TankInsulationReductionTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.tankInsulationReductions) {
      treasureHunt.tankInsulationReductions = new Array();
    }
    treasureHunt.tankInsulationReductions.push(tankInsulationReduction);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.tankInsulationReductionService.baselineData = undefined;
    this.tankInsulationReductionService.modificationData = undefined;
  }


  getTreasureHuntOpportunityResults(tankInsulationReduction: TankInsulationReductionTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: TankInsulationReductionResults = this.tankInsulationReductionService.getResults(settings, tankInsulationReduction.baseline, tankInsulationReduction.modification);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualHeatSavings,
      baselineCost: results.baselineResults.energyCost,
      modificationCost: results.modificationResults.energyCost,
      utilityType: '',
    }

    if (tankInsulationReduction.baseline.utilityType == 0) {
      treasureHuntOpportunityResults.utilityType = 'Natural Gas';
    } else if (tankInsulationReduction.modification.utilityType == 1) {
      treasureHuntOpportunityResults.utilityType = 'Other Fuel';
    }

    return treasureHuntOpportunityResults;
  }

}

import { Injectable } from '@angular/core';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingResults } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { ReplaceExistingMotorTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class ReplaceExistingTreasureHuntService {

  constructor(private replaceExistingService: ReplaceExistingService) { }

  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(replaceExistingTreasureHunt: ReplaceExistingMotorTreasureHunt) {
    this.replaceExistingService.replaceExistingData = replaceExistingTreasureHunt.replaceExistingData;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.replaceExistingMotors.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(motorReplacement: ReplaceExistingMotorTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.replaceExistingMotors) {
      treasureHunt.replaceExistingMotors = new Array();
    }
    treasureHunt.replaceExistingMotors.push(motorReplacement);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.replaceExistingService.replaceExistingData = undefined;
  }


  getTreasureHuntOpportunityResults(replaceExistingMotor: ReplaceExistingMotorTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: ReplaceExistingResults = this.replaceExistingService.getResults(replaceExistingMotor.replaceExistingData, settings);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.costSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.existingEnergyCost,
      modificationCost: results.newEnergyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

}
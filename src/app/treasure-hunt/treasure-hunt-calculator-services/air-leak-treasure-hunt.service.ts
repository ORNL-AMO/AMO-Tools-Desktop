import { Injectable } from '@angular/core';
import { AirLeakService } from '../../calculator/compressed-air/air-leak/air-leak.service';
import { Settings } from '../../shared/models/settings';
import { AirLeakSurveyOutput } from '../../shared/models/standalone';
import { AirLeakSurveyTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class AirLeakTreasureHuntService {

  constructor(
    private airLeakService: AirLeakService) { }


  initNewCalculator() {
    this.airLeakService.airLeakInput.next(undefined);
  }

  setCalculatorInputFromOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt) {
    this.airLeakService.airLeakInput.next(airLeakSurvey.airLeakSurveyInput);
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.airLeakSurveys.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.airLeakSurveys) {
      treasureHunt.airLeakSurveys = new Array();
    }
    treasureHunt.airLeakSurveys.push(airLeakSurvey);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.airLeakService.airLeakInput.next(undefined);
  }


  getTreasureHuntOpportunityResults(airLeakSurveyTreasureHunt: AirLeakSurveyTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
    let results: AirLeakSurveyOutput = this.airLeakService.getResults(settings, airLeakSurveyTreasureHunt.airLeakSurveyInput);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.savingsData.annualTotalElectricityCost,
      energySavings: 0,
      baselineCost: results.baselineData.annualTotalElectricityCost,
      modificationCost: results.modificationData.annualTotalElectricityCost,
      utilityType: '',
    }

    // utility type: 0 = compressed air, 1 = electric
    if (airLeakSurveyTreasureHunt.airLeakSurveyInput.facilityCompressorData.utilityType == 0) {
      treasureHuntOpportunityResults.energySavings = results.savingsData.annualTotalFlowRate;
      treasureHuntOpportunityResults.utilityType = 'Compressed Air';
    } else {
      treasureHuntOpportunityResults.energySavings = results.savingsData.annualTotalElectricity;
      treasureHuntOpportunityResults.utilityType = 'Electricity';
    }

    return treasureHuntOpportunityResults;
  }

}

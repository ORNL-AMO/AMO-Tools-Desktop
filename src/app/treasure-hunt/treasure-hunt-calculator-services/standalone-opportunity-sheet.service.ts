import { Injectable } from '@angular/core';
import { OpportunitySheet, TreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class StandaloneOpportunitySheetService {

  constructor() { }

  saveTreasureHuntOpportunity(opportunitySheet: OpportunitySheet, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.opportunitySheets) {
      treasureHunt.opportunitySheets = new Array();
    }
    treasureHunt.opportunitySheets.push(opportunitySheet);
    return treasureHunt;
  }
 
  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.opportunitySheets.splice(index, 1);
    return treasureHunt;
  }


  // setCalculatorInputFromOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt) {
  //   this.airLeakService.airLeakInput.next(airLeakSurvey.airLeakSurveyInput);
  // }


  // saveTreasureHuntOpportunity(airLeakSurvey: AirLeakSurveyTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
  //   if (!treasureHunt.airLeakSurveys) {
  //     treasureHunt.airLeakSurveys = new Array();
  //   }
  //   treasureHunt.airLeakSurveys.push(airLeakSurvey);
  //   return treasureHunt;
  // }

  // resetCalculatorInputs() {
  //   this.airLeakService.airLeakInput.next(undefined);
  // }
}

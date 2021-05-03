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

}

import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { TreasureHunt, OpportunitySheet, OpportunitySummary } from '../../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
@Injectable()
export class TreasureChestMenuService {

  selectAll: BehaviorSubject<boolean>
  sortBy: BehaviorSubject<SortCardsData>;
  constructor() {
    this.selectAll = new BehaviorSubject<boolean>(false);
    let defaultData: SortCardsData = this.getDefaultSortByData();
    this.sortBy = new BehaviorSubject<SortCardsData>(defaultData);
  }

  getDefaultSortByData(): SortCardsData {
    let sortCardsData: SortCardsData = {
      sortBy: 'annualCostSavings',
      teams: []
    };
    return sortCardsData;
  }

  getAllTeams(opportunityCardsData: Array<OpportunityCardData>): Array<string> {
    let teams: Array<string> = new Array();
    opportunityCardsData.forEach(item => {
      let teamName: string = this.getTeamName(item.opportunitySheet)
      if (teamName) {
        teams.push(teamName);
      };
    });
    teams = _.uniq(teams);
    return teams;
  }

  getTeamName(opportunitySheet: OpportunitySheet): string {
    if (opportunitySheet) {
      return opportunitySheet.owner;
    }
    return;
  }
}

import { Injectable } from '@angular/core';
import { OpportunityCardData } from './opportunity-cards.service';
import { SortCardsData } from './sort-cards-by.pipe';
import * as _ from 'lodash';
@Injectable()
export class SortCardsService {

  constructor() { }

  sortCards(value: Array<OpportunityCardData>, sortByData: SortCardsData): Array<OpportunityCardData> {
    if (sortByData.utilityType != 'All') {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(item.utilityType, sortByData.utilityType) });
    }
    if (sortByData.calculatorType != 'All') {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(item.opportunityType, sortByData.calculatorType) });
    }
    if (sortByData.teams.length != 0) {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(sortByData.teams, item.teamName) });
    }
    if (sortByData.equipments.length != 0) {
      value = _.filter(value, (item: OpportunityCardData) => {
        if (item.opportunitySheet) {
          return _.includes(sortByData.equipments, item.opportunitySheet.equipment);
        } else {
          return false;
        }
      });
    }
    let direction: string = 'desc';
    if (sortByData.sortBy == 'teamName' || sortByData.sortBy == 'name') {
      direction = 'asc';
    }
    value = _.orderBy(value, [sortByData.sortBy], direction);
    return value;
  }
}

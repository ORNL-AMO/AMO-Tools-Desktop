import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { OpportunityCardData } from './opportunity-cards.service';

@Pipe({
  name: 'sortCardsBy',
  pure: false
})
export class SortCardsByPipe implements PipeTransform {

  transform(value: Array<OpportunityCardData>, sortByData: SortCardsData): Array<OpportunityCardData> {
    if (sortByData.utilityType != 'All') {
      value = _.filter(value, (item: OpportunityCardData) => { return _.includes(item.utilityType, sortByData.utilityType) });
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


export interface SortCardsData {
  sortBy: string;
  teams: Array<string>;
  equipments: Array<string>;
  utilityType: string;
}

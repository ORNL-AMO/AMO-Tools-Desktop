import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { OpportunityCardData } from './opportunity-cards.service';
import { SortCardsService } from './sort-cards.service';

@Pipe({
  name: 'sortCardsBy',
  pure: true
})
export class SortCardsByPipe implements PipeTransform {

  constructor(private sortCardsService: SortCardsService) {

  }

  transform(value: Array<OpportunityCardData>, sortByData: SortCardsData): Array<OpportunityCardData> {
    value = this.sortCardsService.sortCards(value, sortByData);
    return value;
  }

}

export interface SortCardsData {
  sortBy: string;
  teams: Array<{display: string, value: string}>;
  equipments: Array<{display: string, value: string}>;
  calculatorTypes: Array<{display: string, value: string}>;
  utilityTypes: Array<{display: string, value: string}>;
}

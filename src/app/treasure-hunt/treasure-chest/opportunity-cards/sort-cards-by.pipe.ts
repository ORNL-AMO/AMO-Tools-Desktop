import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { OpportunityCardData } from './opportunity-cards.service';

@Pipe({
  name: 'sortCardsBy'
})
export class SortCardsByPipe implements PipeTransform {

  transform(value: Array<OpportunityCardData>, by: string ): Array<OpportunityCardData> {
    let direction: string = 'desc';
    if(by == 'teamName' || by == 'name'){
      direction = 'asc';
    }
    value = _.orderBy(value, [by], direction);
    return value;
  }

}

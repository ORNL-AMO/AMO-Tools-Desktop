import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { OpportunityCardData } from './opportunity-cards.service';

@Pipe({
  name: 'sortCardsBy'
})
export class SortCardsByPipe implements PipeTransform {

  transform(value: Array<OpportunityCardData>, by: string, direction: "asc" | "desc" ): any {
    value = _.orderBy(value, [by], direction);
    return value;
  }

}

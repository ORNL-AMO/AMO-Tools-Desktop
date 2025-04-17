import { Pipe, PipeTransform } from '@angular/core';
import { OpportunitySummary } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';

@Pipe({
    name: 'sortSummaries',
    pure: false,
    standalone: false
})
export class SortSummariesPipe implements PipeTransform {

  transform(summaries: Array<OpportunitySummary>, sortBy: string, direction: string): Array<OpportunitySummary> {

    let sortByArr: Array<string> = [sortBy];
    // _(summaries).toPairs().sortBy(sortByArr, [direction])
    let sortedSummaries: Array<OpportunitySummary> = _.orderBy(summaries, sortByArr, [direction]);
    return sortedSummaries;
  }

}

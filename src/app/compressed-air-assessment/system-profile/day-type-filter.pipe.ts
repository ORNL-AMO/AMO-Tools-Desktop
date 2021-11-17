import { Pipe, PipeTransform } from '@angular/core';
import { ProfileSummary, ReduceRuntimeData } from '../../shared/models/compressed-air-assessment';

@Pipe({
  name: 'dayTypeFilter',
  pure: true
})
export class DayTypeFilterPipe implements PipeTransform {

  transform(data: Array<ProfileSummary | ReduceRuntimeData>, dayTypeId: string): Array<ProfileSummary | ReduceRuntimeData> {
    return data.filter(summary => { return summary.dayTypeId == dayTypeId });
  }

}

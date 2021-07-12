import { Pipe, PipeTransform } from '@angular/core';
import { ProfileSummary } from '../../shared/models/compressed-air-assessment';

@Pipe({
  name: 'dayTypeFilter',
  pure: true
})
export class DayTypeFilterPipe implements PipeTransform {

  transform(profileSummary: Array<ProfileSummary>, dayTypeId: string): Array<ProfileSummary> {
    return profileSummary.filter(summary => { return summary.dayTypeId == dayTypeId });
  }

}

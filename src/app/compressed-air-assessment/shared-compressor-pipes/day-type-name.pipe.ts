import { Pipe, PipeTransform } from '@angular/core';
import { CompressedAirDayType } from '../../shared/models/compressed-air-assessment';

@Pipe({
  name: 'dayTypeName',
  standalone: false
})
export class DayTypeNamePipe implements PipeTransform {

  transform(dayTypeId: string, dayTypes: Array<CompressedAirDayType>): string {
    let dayType: CompressedAirDayType = dayTypes.find(dt => dt.dayTypeId === dayTypeId);
    return dayType ? dayType.name : null;
  }

}

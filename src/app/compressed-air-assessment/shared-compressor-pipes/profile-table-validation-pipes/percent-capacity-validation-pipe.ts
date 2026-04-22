import { Pipe, PipeTransform } from '@angular/core';
import { checkPercentCapacityValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Pipe({
  name: 'percentCapacityValidation',
  standalone: false
})
export class PercentCapacityValidationPipe implements PipeTransform {

  transform(value: number): string {
    if (checkPercentCapacityValid(value) != null) {
      return 'invalid';
    }
    return null;
  }
}

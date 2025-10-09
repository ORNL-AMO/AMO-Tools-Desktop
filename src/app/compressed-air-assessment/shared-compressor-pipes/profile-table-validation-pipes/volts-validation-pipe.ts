import { Pipe, PipeTransform } from '@angular/core';
import { checkIsVoltsValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Pipe({
  name: 'voltsValidation',
  standalone: false
})
export class VoltsValidationPipe implements PipeTransform {

  transform(value: number): string {
    if (checkIsVoltsValid(value) != null) {
      return 'invalid';
    }
    return null;
  }
}

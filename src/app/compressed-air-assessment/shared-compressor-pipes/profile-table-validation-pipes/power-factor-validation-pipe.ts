import { Pipe, PipeTransform } from '@angular/core';
import { checkIsPowerFactorValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Pipe({
  name: 'powerFactorValidation',
  standalone: false
})
export class PowerFactorValidationPipe implements PipeTransform {

  transform(value: number): string {
    if (checkIsPowerFactorValid(value) != null) {
      return 'invalid';
    }
    return null;
  }
}

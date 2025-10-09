import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { checkIsAmpsValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Pipe({
  name: 'ampsValidation',
  standalone: false
})
export class AmpsValidationPipe implements PipeTransform {

  transform(value: number, compressor: CompressorInventoryItem): string {
    if (checkIsAmpsValid(value, compressor) != null) {
      return 'invalid';
    }
    return null;
  }
}

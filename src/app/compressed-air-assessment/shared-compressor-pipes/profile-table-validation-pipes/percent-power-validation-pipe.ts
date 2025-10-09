import { Pipe, PipeTransform } from '@angular/core';
import { checkPercentPowerValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';

@Pipe({
  name: 'percentPowerValidation',
  standalone: false
})
export class PercentPowerValidationPipe implements PipeTransform {

  transform(value: number, compressor: CompressorInventoryItem): string {
    if (checkPercentPowerValid(value, compressor) != null) {
      return 'invalid';
    }
    return null;
  }

}

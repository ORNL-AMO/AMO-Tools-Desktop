import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { checkIsPowerValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Pipe({
  name: 'powerValidation',
  standalone: false
})
export class PowerValidationPipe implements PipeTransform {

  transform(value: number, compressor: CompressorInventoryItem): string {
    if(checkIsPowerValid(value, compressor) != null){
      return 'invalid';
    }
    return;
  }
}

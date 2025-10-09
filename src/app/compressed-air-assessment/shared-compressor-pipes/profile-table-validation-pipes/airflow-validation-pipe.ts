import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { checkIsAirflowValid } from '../../compressed-air-assessment-validation/compressedAirValidationFunctions';
import { AirflowValidation } from '../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

@Pipe({
  name: 'airflowValidation',
  standalone: false
})
export class AirflowValidationPipe implements PipeTransform {

  transform(value: number, compressor: CompressorInventoryItem): string {
    let airflowValid: AirflowValidation = checkIsAirflowValid(value, compressor)
    if (airflowValid.airFlowValid != null) {
      return 'invalid';
    } else if (airflowValid.airFlowWarning != null) {
      return 'warning';
    }
    return;
  }

}

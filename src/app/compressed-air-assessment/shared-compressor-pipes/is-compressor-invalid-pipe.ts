import { Pipe, PipeTransform } from '@angular/core';
import { CompressedAirAssessmentValidation } from '../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

@Pipe({
  name: 'isCompressorInvalid',
  standalone: false
})
export class IsCompressorInvalidPipe implements PipeTransform {

  transform(compressorId: string, validationStatus: CompressedAirAssessmentValidation): boolean {
    if (validationStatus && validationStatus.compressorItemValidations) {
      let item = validationStatus.compressorItemValidations.find(item => { return item.compressorId == compressorId; });
      if (item) {
        return !item.isValid;
      }
    }
    return false;
  }

}

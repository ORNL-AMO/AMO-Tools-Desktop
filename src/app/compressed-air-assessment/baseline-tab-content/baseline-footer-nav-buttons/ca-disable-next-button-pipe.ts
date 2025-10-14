import { Pipe, PipeTransform } from '@angular/core';
import { SetupTabRoutes } from './baseline-footer-nav-buttons';
import { CompressedAirAssessmentValidation } from '../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

@Pipe({
  name: 'caDisableNextButton',
  standalone: false
})
export class CaDisableNextButtonPipe implements PipeTransform {

  transform(setupTab: SetupTabRoutes, validationStatus: CompressedAirAssessmentValidation): boolean {
    if(setupTab == 'system-basics'){
      return false;
    } else if(setupTab == 'system-information'){
      return !validationStatus.systemInformationValid;
    } else if(setupTab == 'inventory-setup'){
      return !validationStatus.compressorsValid;
    } else if(setupTab == 'day-types-setup'){
      return !validationStatus.dayTypesValid;
    } else if(setupTab == 'system-profile-setup'){
      return !validationStatus.profileSummaryValid;
    } else if(setupTab == 'end-uses'){
      return !validationStatus.endUsesValid;
    }
    return null;
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { SystemInformationFormService } from '../baseline-tab-content/system-information/system-information-form/system-information-form.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentValidation, CompressorItemValidation, ProfileSummaryValid } from './CompressedAirAssessmentValidation';
import { CompressorInventoryValidationService } from './compressor-inventory-validation.service';
import { DayTypeService } from '../baseline-tab-content/day-types-setup/day-types/day-type.service';
import { SystemProfileValidationService } from './system-profile-validation.service';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentValidationService {

  validationStatus: BehaviorSubject<CompressedAirAssessmentValidation>;
  constructor(private systemInformationFormService: SystemInformationFormService,
    private compressorInventoryValidationService: CompressorInventoryValidationService,
    private dayTypeService: DayTypeService,
    private systemProfileValidationService: SystemProfileValidationService
  ) {
    this.validationStatus = new BehaviorSubject<CompressedAirAssessmentValidation>(undefined);
  }

  validateCompressedAirAssessment(compressedAirAssessment: CompressedAirAssessment, settings: Settings): CompressedAirAssessmentValidation {
    let systemInformationValid: boolean = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, settings).valid;
    let compressorItemValidation: Array<CompressorItemValidation> = this.compressorInventoryValidationService.validateCompressors(compressedAirAssessment);
    let compressorsValid: boolean = compressorItemValidation.every(item => { return item.isValid });
    let dayTypesValid: boolean = this.validateDayTypes(compressedAirAssessment.compressedAirDayTypes);
    let dayTypeProfileSummariesValid: Array<ProfileSummaryValid> = new Array();
    let profileSummaryValid: boolean = true;
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      let dayTypeProfileSummaryValid: ProfileSummaryValid = this.systemProfileValidationService.checkDayTypeProfileSummaryValid(compressedAirAssessment, dayType.dayTypeId);
      dayTypeProfileSummariesValid.push(dayTypeProfileSummaryValid);
      if(!dayTypeProfileSummaryValid.isValid){
        profileSummaryValid = false;
      }
    });

    let endUsesValid: boolean = true; //TODO when end use validation in

    let baselineValid: boolean = (systemInformationValid && compressorsValid && dayTypesValid && profileSummaryValid && endUsesValid);
    let compressedAirAssessmentValidation: CompressedAirAssessmentValidation = {
      baselineValid: baselineValid,
      systemInformationValid: systemInformationValid,
      compressorsValid: compressorsValid,
      dayTypesValid: dayTypesValid,
      dayTypeProfileSummariesValid: dayTypeProfileSummariesValid,
      profileSummaryValid: profileSummaryValid,
      compressorItemValidations: compressorItemValidation,
      endUsesValid: endUsesValid
    }
    this.validationStatus.next(compressedAirAssessmentValidation);
    return compressedAirAssessmentValidation;
  }


  validateDayTypes(compressedAirDayTypes: Array<CompressedAirDayType>): boolean {
    let hasValidDayTypes: boolean = false;
    if (compressedAirDayTypes.length > 0) {
      let isDayTypeFormValid = true;
      let summedTotalDays: number = 0;
      compressedAirDayTypes.forEach(dayType => {
        if (isDayTypeFormValid) {
          isDayTypeFormValid = this.dayTypeService.getDayTypeForm(dayType).valid;
        }
        if (dayType.numberOfDays > 0) {
          summedTotalDays += dayType.numberOfDays;
        } else {
          return false;
        }
      });
      hasValidDayTypes = isDayTypeFormValid && summedTotalDays > 0 && summedTotalDays <= 365;
    }
    return hasValidDayTypes;
  }

  getDayTypeProfileSummaryValid(dayTypeId: string): ProfileSummaryValid {
    let currentValidation: CompressedAirAssessmentValidation = this.validationStatus.getValue();
    return currentValidation.dayTypeProfileSummariesValid.find(summary => { return summary.dayTypeId == dayTypeId });
  }
}

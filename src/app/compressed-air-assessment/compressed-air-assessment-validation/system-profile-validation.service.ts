import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileDataType, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { AirflowValidation, ProfileSummaryValid } from './CompressedAirAssessmentValidation';
import { checkIsAirflowValid, checkIsPowerValid, checkPercentCapacityValid, checkPercentPowerValid, checkPowerFactorInputData, getHasMissingTrimSelection } from './compressedAirValidationFunctions';

@Injectable({
  providedIn: 'root'
})
export class SystemProfileValidationService {

  constructor() { }


  validateProfileSummaries(compressedAirAssessment: CompressedAirAssessment, profileSummary: Array<ProfileSummary>,
    profileDataType: ProfileDataType, selectedDayTypeId: string
  ): ProfileSummaryValid {
    let powerError: string = undefined;
    let percentError: string = undefined;
    let airFlowError: string = undefined;
    let airFlowWarning: string = undefined;
    let powerFactorError: string = undefined;
    let voltError: string = undefined;
    let ampError: string = undefined;
    let trimSelection: boolean = false;

    profileSummary.forEach(summary => {
      if (summary.dayTypeId == selectedDayTypeId) {
        let currentCompressor: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(compressor => compressor.itemId === summary.compressorId);
        summary.profileSummaryData.forEach((data, index) => {
          if (data.order != 0) {
            if (profileDataType == 'percentCapacity') {
              percentError = checkPercentCapacityValid(data.percentCapacity);
            } else if (profileDataType == 'power') {
              powerError = checkIsPowerValid(data.power, currentCompressor);
            } else if (profileDataType == 'airflow') {
              let airflowValidation: AirflowValidation = checkIsAirflowValid(data.airflow, currentCompressor);
              airFlowError = airflowValidation.airFlowValid;
              airFlowWarning = airflowValidation.airFlowWarning;
            } else if (profileDataType == 'percentPower') {
              percentError = checkPercentPowerValid(data.percentPower, currentCompressor);
            } else if (profileDataType == 'powerFactor') {
              let powerFactorValidation: { powerFactorError: string, ampError: string, voltError: string, isValid: boolean } = checkPowerFactorInputData(data.powerFactor, data.amps, data.volts, currentCompressor);
              powerFactorError = powerFactorValidation.powerFactorError;
              ampError = powerFactorValidation.ampError;
              voltError = powerFactorValidation.voltError;
            }
          }
        });
      }
    });
    if (compressedAirAssessment.systemInformation && compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'baseTrim') {
      trimSelection = !getHasMissingTrimSelection(compressedAirAssessment);
    }
    let isValid: boolean = !(powerError || percentError || airFlowError || powerFactorError || voltError || ampError) && trimSelection;
    return {
      powerError: powerError,
      percentError: percentError,
      airFlowError: airFlowError,
      airFlowWarning: airFlowWarning,
      powerFactorError: powerFactorError,
      voltError: voltError,
      ampError: ampError,
      isValid: isValid,
      trimSelection: trimSelection,
      dayTypeId: selectedDayTypeId
    };
  }

  // getHourIntervals(systemProfileSetup: SystemProfileSetup, hours?: number) {
  //   let hourIntervals = new Array();
  //   if (hours === undefined) {
  //     hours = systemProfileSetup.numberOfHours
  //   }

  //   for (let index = 0; index < hours;) {
  //     hourIntervals.push(index);
  //     index = index + systemProfileSetup.dataInterval;
  //   }
  //   return hourIntervals;
  // }

  checkDayTypeProfileSummaryValid(compressedAirAssessment: CompressedAirAssessment, dayTypeId: string): ProfileSummaryValid {
    let profileSummary = compressedAirAssessment.systemProfile.profileSummary;
    let profileSummaryDayType: CompressedAirDayType = compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === dayTypeId);
    let profileDataType = profileSummaryDayType.profileDataType;
    return this.validateProfileSummaries(compressedAirAssessment, profileSummary, profileDataType, dayTypeId);
  }

  checkDayTypeValidTrimSelection(compressedAirAssessment: CompressedAirAssessment, daytypeId: string): boolean {
    let dayTypeIndex: number = compressedAirAssessment.systemInformation.trimSelections.findIndex(selection => daytypeId === selection.dayTypeId);
    let hasValidTrimSelection: boolean = compressedAirAssessment.systemInformation.trimSelections[dayTypeIndex].compressorId !== undefined;
    return hasValidTrimSelection;
  }
}

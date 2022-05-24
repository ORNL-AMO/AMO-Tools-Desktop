import { Injectable } from '@angular/core';
import { isNull, isUndefined } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressorInventoryItem, Modification } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { DayTypeService } from './day-types/day-type.service';
import { InventoryService } from './inventory/inventory.service';
import { SystemInformationFormService } from './system-information/system-information-form.service';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  profileTab: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  secondaryAssessmentTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  compressedAirAssessment: BehaviorSubject<CompressedAirAssessment>;
  selectedModificationId: BehaviorSubject<string>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  constructor(private systemInformationFormService: SystemInformationFormService,private convertUnitsService: ConvertUnitsService, private inventoryService: InventoryService,
    private dayTypeService: DayTypeService) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    this.profileTab = new BehaviorSubject<string>('setup');
    this.calcTab = new BehaviorSubject<string>('air-flow-conversion');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.secondaryAssessmentTab = new BehaviorSubject<string>('modifications');
    this.compressedAirAssessment = new BehaviorSubject<CompressedAirAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);
  }

  updateCompressedAir(compressedAirAssessment: CompressedAirAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      let settings: Settings = this.settings.getValue();
      let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, settings).valid;
      let hasValidCompressors = this.inventoryService.hasValidCompressors(compressedAirAssessment);
      let hasValidDayTypes = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
      let validSystemProfile = this.hasValidProfileSummaryData(compressedAirAssessment);
      compressedAirAssessment.setupDone = (hasValidSystemInformation && hasValidCompressors && hasValidDayTypes && validSystemProfile.isValid);
    }
    //TODO? set modifications valid?
    this.compressedAirAssessment.next(compressedAirAssessment);
  }

  // hasValidProfileSummaryData(compressedAirAssessment?: CompressedAirAssessment) {
  //   if (!compressedAirAssessment) {
  //     compressedAirAssessment = this.compressedAirAssessment.getValue();
  //   }
  //   let isInvalidProfileSummaryData = false;
  //   let profileSummary = compressedAirAssessment.systemProfile.profileSummary;
  //   let profileDataType = compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType;
  //   let selectedDayTypeId = compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId;

  //   isInvalidProfileSummaryData = profileSummary.some(summary => {
  //     if (summary.dayTypeId == selectedDayTypeId) {
  //       let hasInvalidData: boolean = summary.profileSummaryData.some(data => {
  //         if (data.order != 0) {
  //           if (profileDataType == 'percentCapacity' && this.checkIsInvalidNumber(data.percentCapacity)) {
  //             return true
  //           } else if (profileDataType == 'power' && this.checkIsInvalidNumber(data.power)) {
  //             return true;
  //           } else if (profileDataType == 'airflow' && this.checkIsInvalidNumber(data.airflow)) {
  //             return true;
  //           } else if (profileDataType == 'percentPower' && this.checkIsInvalidNumber(data.percentPower)) {
  //             return true;
  //           } else if (profileDataType == 'powerFactor' && (this.checkIsInvalidNumber(data.powerFactor) || this.checkIsInvalidNumber(data.amps) || this.checkIsInvalidNumber(data.volts))) {
  //             return true;
  //           }
  //         }
  //       });
  //       return hasInvalidData;
  //     }
  //   });
  //   return !isInvalidProfileSummaryData;
  // }

  getDefaultProfileSummaryValid(): ProfileSummaryValid {
    return {
      powerError: undefined,
      airFlowError: undefined,
      airFlowWarning: undefined,
      powerFactorError: undefined,
      ampError: undefined,
      voltError: undefined,
      isValid: true, 
      summaryInputValidationData: []};
  }

  hasValidProfileSummaryData(compressedAirAssessment?: CompressedAirAssessment): ProfileSummaryValid {
    let profileSummaryValid: ProfileSummaryValid = this.getDefaultProfileSummaryValid();
    if (!compressedAirAssessment) {
      compressedAirAssessment = this.compressedAirAssessment.getValue();
    }
    let profileSummary = compressedAirAssessment.systemProfile.profileSummary;
    let profileDataType = compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType;
    let selectedDayTypeId = compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId;

    profileSummary.forEach(summary => {
      let summaryInputValidationData: SummaryInputValidationData = {
        compressorId: summary.compressorId,
        airflowValidity: [],
        profileDataInputValidity: [],
        powerFactorInputValidity: []
      };

      if (summary.dayTypeId == selectedDayTypeId) {
        let hasValidData: boolean = true;
        let currentCompressor: CompressorInventoryItem = this.compressedAirAssessment.getValue().compressorInventoryItems.find(compressor => compressor.itemId === summary.compressorId);
        summary.profileSummaryData.forEach((data, index) => {
          if (data.order != 0) {
            if (profileDataType == 'percentCapacity') {
              let isPercentCapacityValid: boolean = this.checkIsInvalidNumber(data.percentCapacity);
              summaryInputValidationData.profileDataInputValidity.push(isPercentCapacityValid);
            } else if (profileDataType == 'power') {
              let isPowerValid: boolean = this.checkIsPowerValid(data.power, currentCompressor, profileSummaryValid);
              summaryInputValidationData.profileDataInputValidity.push(isPowerValid);
            } else if (profileDataType == 'airflow') {
              let airFlowValid: AirflowValidation = this.checkIsAirflowValid(data.airflow, currentCompressor, profileSummaryValid);
              summaryInputValidationData.airflowValidity.push(airFlowValid);
            } else if (profileDataType == 'percentPower') {
              let isPercentPowerValid: boolean = this.checkIsInvalidNumber(data.percentCapacity);
              summaryInputValidationData.profileDataInputValidity.push(isPercentPowerValid);
            } else if (profileDataType == 'powerFactor') {
              let powerFactorValid: PowerFactorInputValidationData = this.checkIsPowerFactorValid(data.powerFactor, data.amps, data.volts, currentCompressor, profileSummaryValid);
              summaryInputValidationData.powerFactorInputValidity.push(powerFactorValid);
            }
          }
        });

        profileSummaryValid.summaryInputValidationData.push(summaryInputValidationData);
        profileSummaryValid.isValid = hasValidData;
      }
    });
    return profileSummaryValid;
  }

  checkIsInvalidNumber(num: number): boolean {
    return num < 0 || isNaN(num) || isNull(num) || isUndefined(num);
  }

  checkIsPowerValid(power: number, currentCompressor: CompressorInventoryItem, profileSummaryValid: ProfileSummaryValid): boolean {
    let isValid: boolean = true;
    let motorServiceFactor: number = currentCompressor.nameplateData.totalPackageInputPower * currentCompressor.designDetails.serviceFactor;
    if (power > motorServiceFactor) {
      isValid = false;
      profileSummaryValid.powerError = 'Power exceeds Motor Service Factor';
    } else if (this.checkIsInvalidNumber(power)) {
      isValid = false;
      profileSummaryValid.powerError = `Power field values should be 0 or greater`;
    }
    return isValid;
  }

  checkIsAirflowValid(airflow: number, currentCompressor: CompressorInventoryItem, profileSummaryValid: ProfileSummaryValid): AirflowValidation {
    let airFlowValidation: AirflowValidation = {
      airFlowValid: true,
      airFlowWarning: false,
    }
    let airFlowLimit = currentCompressor.nameplateData.fullLoadRatedCapacity * 1.50;
    if (airflow >= airFlowLimit) {
      airFlowValidation.airFlowWarning = true;
      profileSummaryValid.airFlowWarning = `Airflow should be less than 150% of Rated Flow (${airFlowLimit})`;
    } else if ( this.checkIsInvalidNumber(airflow)) {
      airFlowValidation.airFlowValid = false;
      profileSummaryValid.airFlowError = `Airflow field values should be 0 or greater`;
    }
    return airFlowValidation;
  }

  checkIsPowerFactorValid(powerFactor: number, amps: number, volts: number, compressor: CompressorInventoryItem, profileSummaryValid: ProfileSummaryValid): PowerFactorInputValidationData {
    let powerFactorInputValidationData: PowerFactorInputValidationData = {
      powerFactorValid: true,
      ampsValid: true,
      voltsValid: true
    }
    if (powerFactor >= 1) {
      powerFactorInputValidationData.powerFactorValid = false;
      profileSummaryValid.powerFactorError = `Power Factor must be less than 1`;
    } else if ( this.checkIsInvalidNumber(powerFactor)) {
      powerFactorInputValidationData.powerFactorValid = false;
      profileSummaryValid.powerFactorError = `Power Factor field values should be 0 or greater`;
    }

    if (volts > 6600) {
      powerFactorInputValidationData.voltsValid = false;
      profileSummaryValid.voltError = 'Volts cannot be greater than 6600';
    } else if ( this.checkIsInvalidNumber(volts)) {
      powerFactorInputValidationData.voltsValid = false;
      profileSummaryValid.voltError = `Volts field values should be 0 or greater`;
    }

    let maxAmps: number = this.convertUnitsService.roundVal(compressor.nameplateData.fullLoadAmps * compressor.designDetails.serviceFactor, 2);
    if (amps >= maxAmps) {
      powerFactorInputValidationData.ampsValid = false;
      profileSummaryValid.ampError = `Amps cannot be greater than ${maxAmps}`;
    } else if ( this.checkIsInvalidNumber(amps)) {
      powerFactorInputValidationData.ampsValid = false;
      profileSummaryValid.ampError = `Amps field values should be 0 or greater`;
    }

    return powerFactorInputValidationData;
  }

}

export interface ProfileSummaryValid {
  powerError?: string,
  airFlowError?: string,
  airFlowWarning?: string,
  powerFactorError?: string,
  voltError?: string,
  ampError?: string,
  summaryInputValidationData?: Array<SummaryInputValidationData>
  profileDataInputValidity?: Array<boolean>
  isValid?: boolean,
}

export interface SummaryInputValidationData {
  compressorId: string,
  daytypeId?: string,
  profileDataInputValidity: Array<boolean>,
  airflowValidity: Array<AirflowValidation>,
  powerFactorInputValidity?: Array<PowerFactorInputValidationData>
}

export interface AirflowValidation {
  airFlowValid: boolean,
  airFlowWarning: boolean
}
export interface PowerFactorInputValidationData {
  powerFactorValid: boolean,
  ampsValid: boolean,
  voltsValid: boolean,
}
import { Injectable } from '@angular/core';
import { isNull, isUndefined } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ProfileSummaryData } from '../shared/models/compressed-air-assessment';
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
  constructor(private systemInformationFormService: SystemInformationFormService, private convertUnitsService: ConvertUnitsService, private inventoryService: InventoryService,
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
      let profileSummaryValid = this.hasValidProfileSummaryData(compressedAirAssessment);
      compressedAirAssessment.setupDone = (hasValidSystemInformation && hasValidCompressors && hasValidDayTypes && profileSummaryValid.isValid);
    }
    //TODO? set modifications valid?
    this.compressedAirAssessment.next(compressedAirAssessment);
  }

  getDefaultProfileSummaryValid(): ProfileSummaryValid {
    return {
      powerError: undefined,
      airFlowError: undefined,
      airFlowWarning: undefined,
      powerFactorError: undefined,
      ampError: undefined,
      voltError: undefined,
      isValid: true,
      summaryInputValidationData: []
    };
  }

  hasValidProfileSummaryData(compressedAirAssessment?: CompressedAirAssessment): ProfileSummaryValid {
    let profileSummaryValid: ProfileSummaryValid = this.getDefaultProfileSummaryValid();
    if (!compressedAirAssessment) {
      compressedAirAssessment = this.compressedAirAssessment.getValue();
    }
    let profileSummary = compressedAirAssessment.systemProfile.profileSummary;
    let profileDataType = compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType;
    let selectedDayTypeId = compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId;

    let hasValidSummary: boolean = true;
    profileSummary.forEach(summary => {
      let summaryInputValidationData: SummaryInputValidationData = {
        compressorId: summary.compressorId,
        airflowValidity: [],
        percentCapacityValidity: [],
        percentPowerValidity: [],
        powerValidity: [],
        powerFactorInputValidity: []
      };

      if (summary.dayTypeId == selectedDayTypeId) {
        let currentCompressor: CompressorInventoryItem = this.compressedAirAssessment.getValue().compressorInventoryItems.find(compressor => compressor.itemId === summary.compressorId);
        summary.profileSummaryData.forEach((data, index) => {
          if (data.order != 0) {
            let isValidProfileData: boolean = true;
            if (profileDataType == 'percentCapacity') {
              isValidProfileData = this.checkIsInvalidNumber(data.percentCapacity) !== true;
              if (!isValidProfileData) {
                profileSummaryValid.percentError = 'Percent must be 0 or greater'
              } else {
                if (data.percentCapacity > 150) {
                  isValidProfileData = false;
                  profileSummaryValid.percentError = 'Percent must be less than 150%';
                }
              }
              summaryInputValidationData.percentCapacityValidity.push(isValidProfileData);
            } else if (profileDataType == 'power') {
              isValidProfileData = this.checkIsPowerValid(data.power, currentCompressor, profileSummaryValid);
              summaryInputValidationData.powerValidity.push(isValidProfileData);
            } else if (profileDataType == 'airflow') {
              let airFlowValidation: AirflowValidation = this.checkIsAirflowValid(data.airflow, currentCompressor, profileSummaryValid);
              isValidProfileData = airFlowValidation.airFlowValid;
              summaryInputValidationData.airflowValidity.push(airFlowValidation);
            } else if (profileDataType == 'percentPower') {
              isValidProfileData = this.checkIsInvalidNumber(data.percentPower) !== true;
              if (!isValidProfileData) {
                profileSummaryValid.percentError = 'Percent must be 0 or greater'
              } else {
                let serviceFactorPercent: number = 100 * currentCompressor.designDetails.serviceFactor;
                if (serviceFactorPercent < data.percentPower) {
                  isValidProfileData = false;
                  profileSummaryValid.percentError = 'Percent must be less than ' + serviceFactorPercent.toFixed(0) + '%';
                }
              }
              summaryInputValidationData.percentPowerValidity.push(isValidProfileData);
            } else if (profileDataType == 'powerFactor') {
              let powerFactorValid: PowerFactorInputValidationData = this.checkIsPowerFactorValid(data.powerFactor, data.amps, data.volts, currentCompressor, profileSummaryValid);
              isValidProfileData = powerFactorValid.isValid;
              summaryInputValidationData.powerFactorInputValidity.push(powerFactorValid);
            }

            if (!isValidProfileData) {
              profileSummaryValid.isValid = false;
            }
          } else {
            if (profileDataType == 'percentCapacity') {
              summaryInputValidationData.percentCapacityValidity.push(true);
            } else if (profileDataType == 'power') {
              summaryInputValidationData.powerValidity.push(true);
            } else if (profileDataType == 'airflow') {
              summaryInputValidationData.airflowValidity.push({
                airFlowValid: true,
                airFlowWarning: false
              });
            } else if (profileDataType == 'percentPower') {
              summaryInputValidationData.percentPowerValidity.push(true);
            } else if (profileDataType == 'powerFactor') {
              summaryInputValidationData.powerFactorInputValidity.push({
                isValid: true,
                powerFactorValid: true,
                ampsValid: true,
                voltsValid: true,
              });
            }
            profileSummaryValid.isValid = true;
          }
        });
        profileSummaryValid.summaryInputValidationData.push(summaryInputValidationData);
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
    motorServiceFactor = this.convertUnitsService.roundVal(motorServiceFactor, 2);
    if (power > motorServiceFactor) {
      isValid = false;
      profileSummaryValid.powerError = `Power exceeds Motor Service Factor (${motorServiceFactor})`;
    } else if (this.checkIsInvalidNumber(power)) {
      isValid = false;
      profileSummaryValid.powerError = `Power must be 0 or greater`;
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
    } else if (this.checkIsInvalidNumber(airflow)) {
      airFlowValidation.airFlowValid = false;
      profileSummaryValid.airFlowError = `Airflow must be 0 or greater`;
    }
    return airFlowValidation;
  }

  checkIsPowerFactorValid(powerFactor: number, amps: number, volts: number, compressor: CompressorInventoryItem, profileSummaryValid: ProfileSummaryValid): PowerFactorInputValidationData {
    let powerFactorInputValidationData: PowerFactorInputValidationData = {
      powerFactorValid: true,
      ampsValid: true,
      voltsValid: true,
      isValid: true,
    }
    if (powerFactor >= 1) {
      powerFactorInputValidationData.powerFactorValid = false;
      profileSummaryValid.powerFactorError = `Power Factor must be less than 1`;
    } else if (this.checkIsInvalidNumber(powerFactor)) {
      powerFactorInputValidationData.powerFactorValid = false;
      profileSummaryValid.powerFactorError = `Power Factor must be 0 or greater`;
    }

    if (volts > 6600) {
      powerFactorInputValidationData.voltsValid = false;
      profileSummaryValid.voltError = 'Volts cannot be greater than 6600';
    } else if (this.checkIsInvalidNumber(volts)) {
      powerFactorInputValidationData.voltsValid = false;
      profileSummaryValid.voltError = `Volts must be 0 or greater`;
    }

    let maxAmps: number = this.convertUnitsService.roundVal(compressor.nameplateData.fullLoadAmps * compressor.designDetails.serviceFactor, 2);
    if (amps >= maxAmps) {
      powerFactorInputValidationData.ampsValid = false;
      profileSummaryValid.ampError = `Amps cannot be greater than ${maxAmps}`;
    } else if (this.checkIsInvalidNumber(amps)) {
      powerFactorInputValidationData.ampsValid = false;
      profileSummaryValid.ampError = `Amps must be 0 or greater`;
    }

    powerFactorInputValidationData.isValid = powerFactorInputValidationData.ampsValid && powerFactorInputValidationData.voltsValid && powerFactorInputValidationData.powerFactorValid;
    return powerFactorInputValidationData;
  }

}

export interface ProfileSummaryValid {
  powerError?: string,
  percentError?: string,
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
  powerValidity: Array<boolean>,
  percentCapacityValidity: Array<boolean>,
  percentPowerValidity: Array<boolean>,
  airflowValidity: Array<AirflowValidation>,
  powerFactorInputValidity?: Array<PowerFactorInputValidationData>
}

export interface AirflowValidation {
  airFlowValid: boolean,
  airFlowWarning: boolean
}
export interface PowerFactorInputValidationData {
  isValid: boolean,
  powerFactorValid: boolean,
  ampsValid: boolean,
  voltsValid: boolean,
}
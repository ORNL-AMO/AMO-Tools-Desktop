import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DayTypeSummary, LogToolField } from '../../../../log-tool/log-tool-models';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService, ProfileSummaryValid, } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile.service';

@Component({
  selector: 'app-operating-profile-table',
  templateUrl: './operating-profile-table.component.html',
  styleUrls: ['./operating-profile-table.component.css']
})
export class OperatingProfileTableComponent implements OnInit {


  @ViewChild('logToolFieldModal', { static: false }) public logToolFieldModal: ModalDirective;

  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
  profileSummary: Array<ProfileSummary>;
  profileDataType: "power" | "percentCapacity" | "airflow" | "powerFactor" | "percentPower";
  selectedDayTypeId: string;
  displayLogToolLink: boolean;
  fieldOptions: Array<LogToolField>
  logToolDayTypeSummaries: Array<DayTypeSummary>;
  showSelectField: boolean = false;
  fillRight: boolean = false;

  profileSummaryValid: ProfileSummaryValid;
  assessmentDayTypes: Array<CompressedAirDayType>
  inventoryItems: Array<CompressorInventoryItem>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.displayLogToolLink = (val.logToolData != undefined)
        if (this.displayLogToolLink) {
          this.logToolDayTypeSummaries = val.logToolData.dayTypeSummaries;
          this.fieldOptions = val.logToolData.logToolFields;
        }
        this.assessmentDayTypes = val.compressedAirDayTypes;
        this.profileDataType = val.systemProfile.systemProfileSetup.profileDataType;
        this.selectedDayTypeId = val.systemProfile.systemProfileSetup.dayTypeId;
        this.profileSummary = val.systemProfile.profileSummary;
        this.profileSummaryValid = this.compressedAirAssessmentService.hasValidProfileSummaryData(val);
        this.setHourIntervals(val.systemProfile.systemProfileSetup);
        this.inventoryItems = val.compressorInventoryItems;
        if (this.profileDataType) {
          this.initializeProfileSummary(val.compressorInventoryItems, val.systemProfile.systemProfileSetup, val.compressedAirDayTypes);
        }
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  updateProfileSummary(changedSummary: ProfileSummary, dataInputIndex: number) {
    let compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.fillRight) {
      this.updateSummaryDataFields(changedSummary, dataInputIndex);
    }
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.profileSummaryValid = this.compressedAirAssessmentService.hasValidProfileSummaryData(compressedAirAssessment);
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }


  updateSummaryDataFields(changedSummary: ProfileSummary, dataInputIndex: number) {
    changedSummary.profileSummaryData.forEach((summaryData, index) => {
      if (summaryData.order != 0 && index > dataInputIndex) {
        if (this.profileDataType == 'power') {
          summaryData.power = changedSummary.profileSummaryData[dataInputIndex].power;
        } else if (this.profileDataType == 'percentCapacity') {
          summaryData.percentCapacity = changedSummary.profileSummaryData[dataInputIndex].percentCapacity;
        } else if (this.profileDataType == 'airflow') {
          summaryData.airflow = changedSummary.profileSummaryData[dataInputIndex].airflow;
        } else if (this.profileDataType == 'percentPower') {
          summaryData.percentPower = changedSummary.profileSummaryData[dataInputIndex].percentPower;
        } else if (this.profileDataType == 'powerFactor') {
          summaryData.powerFactor = changedSummary.profileSummaryData[dataInputIndex].powerFactor;
          summaryData.amps = changedSummary.profileSummaryData[dataInputIndex].amps;
          summaryData.volts = changedSummary.profileSummaryData[dataInputIndex].volts;
        }
      }
    });
    this.profileSummary.forEach(summary => {
      if (summary.dayTypeId == this.selectedDayTypeId && summary.compressorId == changedSummary.compressorId) {
        summary = changedSummary;
      }
    });
  }

  findIsValidPower(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.powerValidity.find((dataInputValue, index) => index === dataIndex);
  }

  findIsValidPercentPower(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.percentPowerValidity.find((dataInputValue, index) => index === dataIndex);
  }

  findIsValidPercentCapacity(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.percentCapacityValidity.find((dataInputValue, index) => index === dataIndex);
  }

  findIsValidAirflow(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.airflowValidity.find((dataInputValue, index) => index === dataIndex).airFlowValid;
  }

  findHasAirflowWarning(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.airflowValidity.find((dataInputValue, index) => index === dataIndex).airFlowWarning;
  }

  findIsValidPowerFactor(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.powerFactorInputValidity.find((dataInputValue, index) => index === dataIndex).powerFactorValid;
  }

  findIsValidVolts(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.powerFactorInputValidity.find((dataInputValue, index) => index === dataIndex).voltsValid;
  }

  findIsValidAmps(compressorId: string, dataIndex: number): boolean { 
    let summaryInputValidationData = this.profileSummaryValid.summaryInputValidationData.find(summary => summary.compressorId === compressorId);
    return summaryInputValidationData.powerFactorInputValidity.find((dataInputValue, index) => index === dataIndex).ampsValid;
  }

  setHourIntervals(systemProfileSetup: SystemProfileSetup) {
    this.hourIntervals = new Array();
    for (let index = 0; index < systemProfileSetup.numberOfHours;) {
      this.hourIntervals.push(index + systemProfileSetup.dataInterval)
      index = index + systemProfileSetup.dataInterval;
    }
  }

  initializeProfileSummary(compressorInventoryItems: Array<CompressorInventoryItem>, systemProfileSetup: SystemProfileSetup, dayTypes: Array<CompressedAirDayType>) {
    //remove missing daytype/compressor combos
    let inventoryItemIds: Array<string> = compressorInventoryItems.map(item => { return item.itemId });
    let dayTypeIds: Array<string> = dayTypes.map(dayType => { return dayType.dayTypeId });
    this.profileSummary.filter(summary => {
      let inventoryItemExist: boolean = inventoryItemIds.includes(summary.compressorId);
      let dayTypeItemExist: boolean = dayTypeIds.includes(summary.dayTypeId);
      return (!inventoryItemExist || !dayTypeItemExist);
    });

    //add missing dayType/compressor combos
    let updatedSummary: Array<ProfileSummary> = new Array();
    compressorInventoryItems.forEach(item => {
      dayTypes.forEach(dayType => {
        let profileSummaryItem: ProfileSummary = this.checkProfileSummary(item, dayType.dayTypeId, this.profileSummary, systemProfileSetup);
        updatedSummary.push(profileSummaryItem);
      })
    });
    this.profileSummary = updatedSummary;
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.profileSummaryValid = this.compressedAirAssessmentService.hasValidProfileSummaryData(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  checkProfileSummary(inventoryItem: CompressorInventoryItem, dayTypeId: string, allProfileSummaries: Array<ProfileSummary>, systemProfileSetup: SystemProfileSetup): ProfileSummary {
    let profileSummary: ProfileSummary = allProfileSummaries.find(summary => { return summary.dayTypeId == dayTypeId && inventoryItem.itemId == summary.compressorId });
    if (profileSummary && (profileSummary.profileSummaryData.length == (systemProfileSetup.numberOfHours / systemProfileSetup.dataInterval))) {
      return profileSummary
    } else {
      let profileSummaryData: Array<ProfileSummaryData> = this.getDummyData(systemProfileSetup.numberOfHours, systemProfileSetup.dataInterval);
      profileSummary = {
        compressorId: inventoryItem.itemId,
        // compressorName: inventoryItem.name,
        dayTypeId: dayTypeId,
        profileSummaryData: profileSummaryData,
        fullLoadPressure: inventoryItem.performancePoints.fullLoad.dischargePressure,
        fullLoadCapacity: inventoryItem.performancePoints.fullLoad.airflow
      }
    }
    return profileSummary;
  }

  getDummyData(numberOfHours: number, dataInterval: number): Array<ProfileSummaryData> {
    let profileSummaryData: Array<ProfileSummaryData> = new Array();
    for (let timeInterval = 0; timeInterval < numberOfHours;) {
      profileSummaryData.push({
        power: undefined,
        airflow: undefined,
        percentCapacity: undefined,
        timeInterval: timeInterval,
        percentPower: undefined,
        percentSystemCapacity: 0,
        percentSystemPower: 0,
        order: 0,
        powerFactor: 0,
        amps: 0,
        volts: 0
      })
      timeInterval = timeInterval + dataInterval;
    }
    return profileSummaryData;
  }

  showDataFromExplorer() {
    this.showSelectField = true;
  }

  hideDataFromExplorer() {
    this.showSelectField = false;
  }

  setLogToolData(selectedProfileSummary: ProfileSummary) {
    this.profileSummary.forEach(profileSummary => {
      if (profileSummary.compressorId == selectedProfileSummary.compressorId) {
        profileSummary.logToolFieldId = selectedProfileSummary.logToolFieldId;
        this.logToolDayTypeSummaries.forEach(summary => {
          if (summary.dayType.dayTypeId == profileSummary.dayTypeId) {
            summary.hourlyAverages.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldId });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.hour });
              if (average && profileSummaryData) {
                let assessmentDayType: CompressedAirDayType = this.assessmentDayTypes.find(dayType => { return dayType.dayTypeId == profileSummary.dayTypeId });
                if (assessmentDayType) {
                  if (assessmentDayType.profileDataType == 'airflow') {
                    profileSummaryData.airflow = Number(average.value.toFixed(0));
                  } else if (assessmentDayType.profileDataType == 'percentCapacity') {
                    profileSummaryData.percentCapacity = Number(average.value.toFixed(0));
                  } else if (assessmentDayType.profileDataType == 'power') {
                    profileSummaryData.power = Number(average.value.toFixed(1));
                  } else if (assessmentDayType.profileDataType == 'percentPower') {
                    profileSummaryData.percentPower = Number(average.value.toFixed(1));
                  }
                }
              }
            });
          }
        });
      }
    });
    this.save();
  }


  setLogToolDataPowerFactor(selectedProfileSummary: ProfileSummary) {
    this.profileSummary.forEach(profileSummary => {
      if (profileSummary.compressorId == selectedProfileSummary.compressorId) {
        profileSummary.logToolFieldIdPowerFactor = selectedProfileSummary.logToolFieldIdPowerFactor;
        this.logToolDayTypeSummaries.forEach(summary => {
          if (summary.dayType.dayTypeId == profileSummary.dayTypeId) {
            summary.hourlyAverages.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdPowerFactor });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.hour });
              if (average && profileSummaryData) {
                let assessmentDayType: CompressedAirDayType = this.assessmentDayTypes.find(dayType => { return dayType.dayTypeId == profileSummary.dayTypeId });
                if (assessmentDayType) {
                  profileSummaryData.powerFactor = Number(average.value.toFixed(0));
                }
              }
            });
          }
        });
      }
    });
    this.save();
  }

  setLogToolDataAmps(selectedProfileSummary: ProfileSummary) {
    this.profileSummary.forEach(profileSummary => {
      if (profileSummary.compressorId == selectedProfileSummary.compressorId) {
        profileSummary.logToolFieldIdAmps = selectedProfileSummary.logToolFieldIdAmps;
        this.logToolDayTypeSummaries.forEach(summary => {
          if (summary.dayType.dayTypeId == profileSummary.dayTypeId) {
            summary.hourlyAverages.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdAmps });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.hour });
              if (average && profileSummaryData) {
                let assessmentDayType: CompressedAirDayType = this.assessmentDayTypes.find(dayType => { return dayType.dayTypeId == profileSummary.dayTypeId });
                if (assessmentDayType) {
                  profileSummaryData.amps = Number(average.value.toFixed(0));
                }
              }
            });
          }
        });
      }
    });
    this.save();
  }

  setLogToolDataVolts(selectedProfileSummary: ProfileSummary) {
    this.profileSummary.forEach(profileSummary => {
      if (profileSummary.compressorId == selectedProfileSummary.compressorId) {
        profileSummary.logToolFieldIdVolts = selectedProfileSummary.logToolFieldIdVolts;
        this.logToolDayTypeSummaries.forEach(summary => {
          if (summary.dayType.dayTypeId == profileSummary.dayTypeId) {
            summary.hourlyAverages.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdVolts });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.hour });
              if (average && profileSummaryData) {
                let assessmentDayType: CompressedAirDayType = this.assessmentDayTypes.find(dayType => { return dayType.dayTypeId == profileSummary.dayTypeId });
                if (assessmentDayType) {
                  profileSummaryData.volts = Number(average.value.toFixed(0));
                }
              }
            });
          }
        });
      }
    });
    this.save();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DayTypeSummary, LogToolField } from '../../../../../log-tool/log-tool-models';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { CompressedAirAssessmentValidationService } from '../../../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { getHourIntervals } from '../../../../compressed-air-assessment-validation/compressedAirValidationFunctions';
import { ProfileSummaryValid } from '../../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
@Component({
  selector: 'app-operating-profile-table',
  templateUrl: './operating-profile-table.component.html',
  styleUrls: ['./operating-profile-table.component.css'],
  standalone: false
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

  assessmentDayTypes: Array<CompressedAirDayType>
  inventoryItems: Array<CompressorInventoryItem>;

  profileSummaryValid: ProfileSummaryValid;
  profileSummaryValidSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private router: Router,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService
  ) { }

  ngOnInit(): void {
    this.profileSummaryValidSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      this.setProfileSummaryValid();
    });

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
        this.hourIntervals = getHourIntervals(val.systemProfile.systemProfileSetup);
        this.inventoryItems = val.compressorInventoryItems;
        this.setProfileSummaryValid();
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.profileSummaryValidSub.unsubscribe();
  }

  setProfileSummaryValid() {
    if (this.selectedDayTypeId) {
      this.profileSummaryValid = this.compressedAirAssessmentValidationService.getDayTypeProfileSummaryValid(this.selectedDayTypeId);
    }
  }

  updateProfileSummary(changedSummary: ProfileSummary, dataInputIndex: number) {
    let compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (this.fillRight) {
      this.updateSummaryDataFields(changedSummary, dataInputIndex);
    }
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
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

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.profileSummary;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  showDataFromExplorer() {
    this.showSelectField = true;
  }

  visitDataExplorer() {
    this.router.navigateByUrl('log-tool');
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
            summary.dayAveragesByInterval.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldId });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => {
                return summaryData.timeInterval == hourlyAverage.interval
              });
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
            summary.dayAveragesByInterval.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdPowerFactor });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.interval });
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
            summary.dayAveragesByInterval.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdAmps });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.interval });
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
            summary.dayAveragesByInterval.forEach(hourlyAverage => {
              let average = hourlyAverage.averages.find(average => { return average.field.fieldId == profileSummary.logToolFieldIdVolts });
              let profileSummaryData = profileSummary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == hourlyAverage.interval });
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

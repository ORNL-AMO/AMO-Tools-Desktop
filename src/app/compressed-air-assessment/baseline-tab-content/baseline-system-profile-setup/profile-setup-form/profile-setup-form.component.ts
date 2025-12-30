import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';
import { NavigationEnd, Router } from '@angular/router';
import { CompressedAirAssessmentValidation } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { CompressedAirAssessmentValidationService } from '../../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { getPressureMinMax } from '../../../calculations/caCalculationHelpers';

@Component({
  selector: 'app-profile-setup-form',
  templateUrl: './profile-setup-form.component.html',
  styleUrls: ['./profile-setup-form.component.css'],
  standalone: false
})
export class ProfileSetupFormComponent implements OnInit {
  settings: Settings;
  form: UntypedFormGroup;
  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  dayTypes: Array<CompressedAirDayType>;
  pressureMin: number;
  pressureMax: number;
  settingsSub: Subscription;
  hourIntervalData: Array<ProfileSummary>;
  dayIntervalData: Array<ProfileSummary>;
  halfHourIntervalData: Array<ProfileSummary>;
  quarterHourIntervalData: Array<ProfileSummary>;
  isProfileDataTypeChange: boolean = false;
  dayTypesWarningMessage: string = 'is valid';
  compressedAirAssessment: CompressedAirAssessment;
  hasModifications: boolean = false;

  validationStatusSub: Subscription;
  routerEventsSub: Subscription;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private router: Router) { }

  ngOnInit(): void {
    this.validationStatusSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      this.setDayTypeWarningMessage(val);
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.dayTypes = val.compressedAirDayTypes;
      this.compressedAirAssessment = val;
      this.setPressureMinAndMax(val.compressorInventoryItems);
      if (val && this.isFormChange == false) {
        this.form = this.systemProfileService.getProfileSetupFormFromObj(val.systemProfile.systemProfileSetup, this.dayTypes);
        this.enableDisableForm();
      } else {
        this.isFormChange = false;
      }
    });
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.enableDisableForm();
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
    this.routerEventsSub.unsubscribe();
  }


  save(dataIntervalProfile?: Array<ProfileSummary>) {
    this.isFormChange = true;
    let systemProfileSetup: SystemProfileSetup = this.systemProfileService.getProfileSetupFromForm(this.form);
    let dayTypeIndex: number = this.compressedAirAssessment.compressedAirDayTypes.findIndex(dayType => { return dayType.dayTypeId == systemProfileSetup.dayTypeId });
    this.compressedAirAssessment.compressedAirDayTypes[dayTypeIndex].profileDataType = systemProfileSetup.profileDataType;
    if (dataIntervalProfile) {
      this.compressedAirAssessment.systemProfile.profileSummary = dataIntervalProfile;
    }
    this.compressedAirAssessment.systemProfile.systemProfileSetup = systemProfileSetup;

    if (this.isProfileDataTypeChange) {
      this.compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
        summary.logToolFieldId = undefined;
        summary.logToolFieldIdAmps = undefined;
        summary.logToolFieldIdPowerFactor = undefined;
        summary.logToolFieldIdVolts = undefined;
      });
      this.isProfileDataTypeChange = false;
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  enableDisableForm() {
    if (this.router.url.includes('setup-profile') == false) {
      this.form.controls.profileDataType.disable();
      this.form.controls.dataInterval.disable();
    } else {
      this.form.controls.profileDataType.enable();
      this.form.controls.dataInterval.enable();
    }
    if (this.compressedAirAssessment.modifications.length != 0) {
      this.form.controls.dataInterval.disable();
      this.hasModifications = true;
    } else {
      this.hasModifications = false;
    }
  }

  changeDayType() {
    let selectedDayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.form.controls.dayTypeId.value });
    this.form.controls.profileDataType.patchValue(selectedDayType.profileDataType);
    this.save();
  }

  setPressureMinAndMax(inventoryItems: Array<CompressorInventoryItem>) {
    let compressorMinMax: { min: number, max: number } = getPressureMinMax(inventoryItems);
    this.pressureMin = compressorMinMax.min;
    this.pressureMax = compressorMinMax.max;
  }

  changeDataInterval() {
    //when interval changes, hold previous interval summary data in case they change back
    if (this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval != this.form.controls.dataInterval.value) {
      //current assessment holds current profile
      if (this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == 24) {
        this.dayIntervalData = this.compressedAirAssessment.systemProfile.profileSummary;
      } else if (this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == 1) {
        this.hourIntervalData = this.compressedAirAssessment.systemProfile.profileSummary;
      } else if (this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == .5) {
        this.halfHourIntervalData = this.compressedAirAssessment.systemProfile.profileSummary;
      } else if (this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == .25) {
        this.quarterHourIntervalData = this.compressedAirAssessment.systemProfile.profileSummary;
      }
      //form value holds changed data interval option
      if (this.form.controls.dataInterval.value == 1) {
        if (!this.hourIntervalData) {
          //initialize hourIntervalData
          this.hourIntervalData = this.initializeIntervalData(this.compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours, this.form.controls.dataInterval.value);
        }
        this.save(this.hourIntervalData);
      } else if (this.form.controls.dataInterval.value == 24) {
        if (!this.dayIntervalData) {
          //initialize dayIntervalData
          this.dayIntervalData = this.initializeIntervalData(this.compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours, this.form.controls.dataInterval.value);
        }
        this.save(this.dayIntervalData);
      } else if (this.form.controls.dataInterval.value == .5) {
        if (!this.halfHourIntervalData) {
          //initialize halfHourIntervalData
          this.halfHourIntervalData = this.initializeIntervalData(this.compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours, this.form.controls.dataInterval.value);
        }
        this.save(this.halfHourIntervalData);
      } else if (this.form.controls.dataInterval.value == .25) {
        if (!this.quarterHourIntervalData) {
          //initialize quarterHourIntervalData
          this.quarterHourIntervalData = this.initializeIntervalData(this.compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours, this.form.controls.dataInterval.value);
        }
        this.save(this.quarterHourIntervalData);
      } else {
        this.save();
      }
    }
  }

  changeProfileDataType() {
    this.isProfileDataTypeChange = true;
    this.save();
  }

  setDayTypeWarningMessage(validationStatus: CompressedAirAssessmentValidation) {
    let hasInvalidDayTypeProfile: boolean = validationStatus.dayTypeProfileSummariesValid.some(summary => {
      return summary.isValid == false;
    });
    if (hasInvalidDayTypeProfile) {
      this.dayTypesWarningMessage = 'There are Day Types with missing or invalid data.';
    } else {
      this.dayTypesWarningMessage = 'is valid';
    }
  }

  initializeIntervalData(numberOfHours: number, dataInterval: number): Array<ProfileSummary> {
    let profileSummary: Array<ProfileSummary> = new Array();
    let compressors: Array<CompressorInventoryItem> = this.compressedAirAssessment.compressorInventoryItems;
    let dayTypes: Array<CompressedAirDayType> = this.compressedAirAssessment.compressedAirDayTypes;
    dayTypes.forEach(dayType => {
      compressors.forEach(compressor => {
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
        let dayTypeProfileSummary: ProfileSummary = {
          compressorId: compressor.itemId,
          // compressorName: compressor.name,
          dayTypeId: dayType.dayTypeId,
          profileSummaryData: profileSummaryData,
          fullLoadPressure: compressor.performancePoints.fullLoad.dischargePressure,
          fullLoadCapacity: compressor.performancePoints.fullLoad.airflow
        }
        profileSummary.push(dayTypeProfileSummary);
      });
    });
    return profileSummary;
  }

}

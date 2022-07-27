import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { PerformancePointsFormService } from '../../inventory/performance-points/performance-points-form.service';
import { SystemProfileService } from '../system-profile.service';

@Component({
  selector: 'app-profile-setup-form',
  templateUrl: './profile-setup-form.component.html',
  styleUrls: ['./profile-setup-form.component.css']
})
export class ProfileSetupFormComponent implements OnInit {
  settings: Settings;
  form: FormGroup;
  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  dayTypes: Array<CompressedAirDayType>;
  profileTab: string;
  profileTabSub: Subscription;
  pressureMin: number;
  pressureMax: number;
  settingsSub: Subscription;
  hourIntervalData: Array<ProfileSummary>;
  dayIntervalData: Array<ProfileSummary>;
  halfHourIntervalData: Array<ProfileSummary>;
  quarterHourIntervalData: Array<ProfileSummary>;
  isProfileDataTypeChange: boolean = false;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.dayTypes = val.compressedAirDayTypes;
      this.setPressureMinAndMax(val.compressorInventoryItems);
      if (val && this.isFormChange == false) {
        this.form = this.systemProfileService.getProfileSetupFormFromObj(val.systemProfile.systemProfileSetup, this.dayTypes);
        this.enableDisableForm();
      } else {
        this.isFormChange = false;
      }
    });

    this.profileTabSub = this.compressedAirAssessmentService.profileTab.subscribe(val => {
      this.profileTab = val;
      this.enableDisableForm();
    });

    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.profileTabSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }


  save(dataIntervalProfile?: Array<ProfileSummary>) {
    this.isFormChange = true;
    let systemProfileSetup: SystemProfileSetup = this.systemProfileService.getProfileSetupFromForm(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let dayTypeIndex: number = compressedAirAssessment.compressedAirDayTypes.findIndex(dayType => { return dayType.dayTypeId == systemProfileSetup.dayTypeId });
    compressedAirAssessment.compressedAirDayTypes[dayTypeIndex].profileDataType = systemProfileSetup.profileDataType;
    if (dataIntervalProfile) {
      compressedAirAssessment.systemProfile.profileSummary = dataIntervalProfile;
    }
    compressedAirAssessment.systemProfile.systemProfileSetup = systemProfileSetup;

    if (this.isProfileDataTypeChange) {
      compressedAirAssessment.systemProfile.profileSummary.forEach(summary => {
        summary.logToolFieldId = undefined;
        summary.logToolFieldIdAmps = undefined;
        summary.logToolFieldIdPowerFactor = undefined;
        summary.logToolFieldIdVolts = undefined;
      });
      this.isProfileDataTypeChange = false;
    }

    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  enableDisableForm() {
    if (this.profileTab != 'setup') {
      this.form.controls.profileDataType.disable();
      this.form.controls.dataInterval.disable();
    } else {
      this.form.controls.profileDataType.enable();
      this.form.controls.dataInterval.enable();
    }
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (compressedAirAssessment.modifications.length != 0) {
      this.form.controls.dataInterval.disable();
    }
  }

  changeDayType() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedDayType: CompressedAirDayType = compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.form.controls.dayTypeId.value });
    this.form.controls.profileDataType.patchValue(selectedDayType.profileDataType);
    this.save();
  }

  setPressureMinAndMax(inventoryItems: Array<CompressorInventoryItem>) {
    let compressorMinMax: { min: number, max: number } = this.performancePointsFormService.getPressureMinMax(inventoryItems);
    this.pressureMin = compressorMinMax.min;
    this.pressureMax = compressorMinMax.max;
  }

  changeDataInterval() {
    //when interval changes, hold previous interval summary data in case they change back
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval != this.form.controls.dataInterval.value) {
      //current assessment holds current profile
      if (compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == 24) {
        this.dayIntervalData = compressedAirAssessment.systemProfile.profileSummary;
      } else if (compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == 1) {
        this.hourIntervalData = compressedAirAssessment.systemProfile.profileSummary;
      } else if (compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == .5) {
        this.halfHourIntervalData = compressedAirAssessment.systemProfile.profileSummary;
      } else if (compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval == .25) {
        this.quarterHourIntervalData = compressedAirAssessment.systemProfile.profileSummary;
      }
      //form value holds changed data interval option
      if (this.form.controls.dataInterval.value == 1 && this.hourIntervalData) {
        this.save(this.hourIntervalData);
      } else if (this.form.controls.dataInterval.value == 24 && this.dayIntervalData) {
        this.save(this.dayIntervalData);
      } else if (this.form.controls.dataInterval.value == .5 && this.halfHourIntervalData) {
        this.save(this.halfHourIntervalData);
      } else if (this.form.controls.dataInterval.value == .25 && this.quarterHourIntervalData) {
        this.save(this.quarterHourIntervalData);
      } else {
        this.save();
      }
    }
    this.save();
  }


  changeProfileDataType() {
    this.isProfileDataTypeChange = true;
    this.save();
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';

@Component({
  selector: 'app-profile-setup-form',
  templateUrl: './profile-setup-form.component.html',
  styleUrls: ['./profile-setup-form.component.css']
})
export class ProfileSetupFormComponent implements OnInit {

  form: FormGroup;
  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  dayTypes: Array<CompressedAirDayType>;
  profileTab: string;
  profileTabSub: Subscription;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.dayTypes = val.compressedAirDayTypes;
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
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.profileTabSub.unsubscribe();
  }


  save() {
    this.isFormChange = true;
    let systemProfileSetup: SystemProfileSetup = this.systemProfileService.getProfileSetupFromForm(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let dayTypeIndex: number = compressedAirAssessment.compressedAirDayTypes.findIndex(dayType => { return dayType.dayTypeId == systemProfileSetup.dayTypeId });
    compressedAirAssessment.compressedAirDayTypes[dayTypeIndex].profileDataType = systemProfileSetup.profileDataType;
    compressedAirAssessment.systemProfile.systemProfileSetup = systemProfileSetup;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
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
  }

  changeDayType() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedDayType: CompressedAirDayType = compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.form.controls.dayTypeId.value });
    this.form.controls.profileDataType.patchValue(selectedDayType.profileDataType);
    this.save();
  }

}

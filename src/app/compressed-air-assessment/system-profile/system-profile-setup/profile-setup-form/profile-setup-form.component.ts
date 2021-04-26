import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, SystemProfileSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile.service';

@Component({
  selector: 'app-profile-setup-form',
  templateUrl: './profile-setup-form.component.html',
  styleUrls: ['./profile-setup-form.component.css']
})
export class ProfileSetupFormComponent implements OnInit {

  form: FormGroup;
  compressedAirAssessmentSub: Subscription;
  isFormChange: boolean = false;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.isFormChange == false) {
        this.form = this.systemProfileService.getProfileSetupFormFromObj(val.systemProfile.systemProfileSetup);
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }


  save() {
    this.isFormChange = true;
    let systemProfileSetup: SystemProfileSetup = this.systemProfileService.getProfileSetupFromForm(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.systemProfileSetup = systemProfileSetup;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

}

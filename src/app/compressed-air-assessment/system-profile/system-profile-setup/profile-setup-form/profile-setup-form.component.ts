import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile.service';

@Component({
  selector: 'app-profile-setup-form',
  templateUrl: './profile-setup-form.component.html',
  styleUrls: ['./profile-setup-form.component.css']
})
export class ProfileSetupFormComponent implements OnInit {

  form: FormGroup;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.form = this.systemProfileService.getProfileSetupForm();
  }

  save(){

  }

  focusField(str: string){
    this.compressedAirAssessmentService.focusedField.next(str);
  }

}

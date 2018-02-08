import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-facility-info',
  templateUrl: './facility-info.component.html',
  styleUrls: ['./facility-info.component.css']
})
export class FacilityInfoComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('close')
  close = new EventEmitter<boolean>();

  facilityForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.settings.facilityInfo) {
      let date = new Date().toDateString();
      this.facilityForm = this.formBuilder.group({
        companyName: [''],
        facilityName: [''],
        street: [''],
        city: [''],
        state: [''],
        zip: [''],
        country: [''],
        facilityContactName: [''],
        facilityPhoneNumber: [''],
        facilityEmail: [''],
        assessmentContactName: [''],
        assessmentPhoneNumber: [''],
        assessmentEmail: [''],
        date: [date]
      })
    }
    else{
      this.facilityForm = this.formBuilder.group({
        facilityName: [this.settings.facilityInfo.facilityName],
        companyName: [this.settings.facilityInfo.companyName],
        street: [this.settings.facilityInfo.address.street],
        city: [this.settings.facilityInfo.address.city],
        state: [this.settings.facilityInfo.address.state],
        country: [this.settings.facilityInfo.address.country],
        zip: [this.settings.facilityInfo.address.zip],
        facilityContactName: [this.settings.facilityInfo.facilityContact.contactName],
        facilityPhoneNumber: [this.settings.facilityInfo.facilityContact.phoneNumber],
        facilityEmail: [this.settings.facilityInfo.facilityContact.email],
        assessmentContactName: [this.settings.facilityInfo.assessmentContact.contactName],
        assessmentPhoneNumber: [this.settings.facilityInfo.assessmentContact.phoneNumber],
        assessmentEmail: [this.settings.facilityInfo.assessmentContact.email],
        date: [this.settings.facilityInfo.date]
      })
    }

  }

  save() {
    this.settings.facilityInfo = {
      companyName: this.facilityForm.controls.companyName.value,
      facilityName: this.facilityForm.controls.facilityName.value,
      address: {
        street: this.facilityForm.controls.street.value,
        city: this.facilityForm.controls.city.value,
        state: this.facilityForm.controls.state.value,
        country: this.facilityForm.controls.country.value,
        zip: this.facilityForm.controls.zip.value
      },
      facilityContact: {
        phoneNumber: this.facilityForm.controls.facilityPhoneNumber.value,
        contactName: this.facilityForm.controls.facilityContactName.value,
        email: this.facilityForm.controls.facilityEmail.value
      },
      assessmentContact: {
        phoneNumber: this.facilityForm.controls.assessmentPhoneNumber.value,
        contactName: this.facilityForm.controls.assessmentContactName.value,
        email: this.facilityForm.controls.assessmentEmail.value
      },
      date: this.facilityForm.controls.date.value
    }
    this.close.emit(true);
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings, Contact, StreetAddress } from '../../shared/models/settings';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

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

  facilityForm: UntypedFormGroup;
  constructor(private formBuilder: UntypedFormBuilder) { }

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
      });
    }
    else {
      let facilityContactInfo: Contact = this.settings.facilityInfo.facilityContact;
      let assessmentContact: Contact = this.settings.facilityInfo.assessmentContact;
      if (!facilityContactInfo) {
        facilityContactInfo = this.getEmptyContact();
      }
      if (!assessmentContact) {
        assessmentContact = this.getEmptyContact();
      }
      let address: StreetAddress = this.settings.facilityInfo.address;
      if (!address) {
        address = {
          street: '',
          city: '',
          state: '',
          country: '',
          zip: ''
        };
      }

      this.facilityForm = this.formBuilder.group({
        facilityName: [this.settings.facilityInfo.facilityName],
        companyName: [this.settings.facilityInfo.companyName],
        street: [address.street],
        city: [address.city],
        state: [address.state],
        country: [address.country],
        zip: [address.zip],
        facilityContactName: [facilityContactInfo.contactName],
        facilityPhoneNumber: [facilityContactInfo.phoneNumber],
        facilityEmail: [facilityContactInfo.email],
        assessmentContactName: [assessmentContact.contactName],
        assessmentPhoneNumber: [assessmentContact.phoneNumber],
        assessmentEmail: [assessmentContact.email],
        date: [this.settings.facilityInfo.date]
      });
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
    };
    this.close.emit(true);
  }


  getEmptyContact(): Contact {
    let contact: Contact = {
      contactName: undefined,
      phoneNumber: undefined,
      email: undefined
    };
    return contact;
  }

}

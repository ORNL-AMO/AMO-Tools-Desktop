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
      this.facilityForm = this.formBuilder.group({
        name: [''],
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        contactName: [''],
        phoneNumber: ['']
      })
    }else{
      this.facilityForm = this.formBuilder.group({
        name: [this.settings.facilityInfo.name],
        street: [this.settings.facilityInfo.address.street],
        city: [this.settings.facilityInfo.address.city],
        state: [this.settings.facilityInfo.address.state],
        country: [this.settings.facilityInfo.address.country],
        contactName: [this.settings.facilityInfo.contact.contactName],
        phoneNumber: [this.settings.facilityInfo.contact.phoneNumber]
      })
    }

  }

  save() {
    this.settings.facilityInfo = {
      name: this.facilityForm.controls.name.value,
      address: {
        street: this.facilityForm.controls.street.value,
        city: this.facilityForm.controls.city.value,
        state: this.facilityForm.controls.state.value,
        country: this.facilityForm.controls.country.value,
      },
      contact: {
        phoneNumber: this.facilityForm.controls.phoneNumber.value,
        contactName: this.facilityForm.controls.contactName.value
      }
    }
    this.close.emit(true);
  }

}

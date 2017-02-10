import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../shared/validation.service';
@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {

  contactForm: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.contactForm = this.initForm();
  }
  initForm(){
    return this.formBuilder.group({
      'firstName': ['', Validators.required],
      'lastName': ['', Validators.required],
      'email': ['', [Validators.required, ValidationService.emailValidator]],
      'phone': ['', [Validators.required, ValidationService.phoneValidator]],
      'street': ['', Validators.required],
      'city': ['', Validators.required],
      'state': ['', Validators.required],
      'zip': ['', [Validators.required, ValidationService.zipValidator]],
    });
  }

  saveContact(){

    alert(this.contactForm.value.firstName + ' ' + this.contactForm.value.lastName + ' was created!!');
  }
}

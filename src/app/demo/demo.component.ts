import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../electron.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../shared/validation.service';
@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  win: any;
  contactForm: any;
  constructor(private electronService: ElectronService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.contactForm = this.initForm();
  }

  toggle(){
    this.electronService.toggleDevTools();
  }

  close(){
    this.electronService.closeWindow();
  }

  showDialog(){
    this.electronService.logDialog();
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

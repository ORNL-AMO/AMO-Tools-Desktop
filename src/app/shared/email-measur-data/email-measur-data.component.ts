import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailMeasurDataService, EmailSentStatus } from './email-measur-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-email-measur-data',
  templateUrl: './email-measur-data.component.html',
  styleUrls: ['./email-measur-data.component.css']
})
export class EmailMeasurDataComponent {
  @Input()
  inModal: boolean;
  @Output('formStatus')
  formStatus = new EventEmitter<boolean>();
  showPreview: boolean = false;
  
  emailDataForm: FormGroup;
  emailSender: string = 'MEASUR user';
  emailSentStatus: EmailSentStatus;
  emailSentStatusSubscription: Subscription;
  constructor(private fb: FormBuilder, private emailMeasurDataService: EmailMeasurDataService) { }

  ngOnInit() {
    this.emailDataForm = this.fb.group({
      emailTo: ['', [Validators.required, Validators.email]],
      emailSender: ['', [Validators.email]]
    });

    this.emailSentStatusSubscription = this.emailMeasurDataService.emailSentStatus.subscribe(sentStatus => {
      this.emailSentStatus = sentStatus;
    });
  }

  ngOnDestroy() {
    this.emailSentStatusSubscription.unsubscribe();
    this.emailMeasurDataService.emailSentStatus.next(undefined);
  }

  save() {
    if (this.emailDataForm.controls.emailSender.valid) {
      this.emailSender = this.emailDataForm.controls.emailSender.value;
    } else {
      this.emailSender = 'MEASUR user';
    }
    this.formStatus.emit(this.emailDataForm.valid);
    this.emailMeasurDataService.setEmailData(this.emailDataForm);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

}
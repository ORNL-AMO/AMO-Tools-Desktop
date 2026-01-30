import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
import { EmailMeasurDataService, EmailSentStatus } from './email-measur-data.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-email-measur-data',
    templateUrl: './email-measur-data.component.html',
    styleUrls: ['./email-measur-data.component.css'],
    standalone: false
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
      emailTo: ['', [Validators.required, this.multipleEmailsValidator()]],
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

  multipleEmailsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emails = control.value.split(/[, ]+/).map((email: string) => email.trim());
      const invalidEmails = emails.filter(email => Validators.email(new FormControl(email)) !== null);

      return invalidEmails.length > 0 ? { invalidEmails: true } : null;
    };
}

}
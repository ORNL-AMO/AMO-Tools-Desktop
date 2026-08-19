import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
import { EmailMeasurDataService, EmailSentStatus } from './email-measur-data.service';
import { Observable, Subscription, mergeMap, of } from 'rxjs';
import { ContactDbService, SavedContact } from '../../indexedDb/contact-db.service';
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

  contactSearchDataSource: Observable<Array<SavedContact>>;
  currentEmailToken: string = '';
  canAddCurrentEmailAsContact: boolean = false;
  showContactAddedBanner: boolean = false;
  private contactAddedBannerTimeout: any;

  constructor(private fb: FormBuilder, private emailMeasurDataService: EmailMeasurDataService, private contactDbService: ContactDbService) { }

  ngOnInit() {
    this.emailDataForm = this.fb.group({
      emailTo: ['', [Validators.required, this.multipleEmailsValidator()]],
      emailSender: ['', [Validators.email]],
      emailAttachmentName: [
        this.emailMeasurDataService.measurItemAttachment.itemName,
        [Validators.required, this.invalidCharactersValidator()]
      ]
    });

    this.emailSentStatusSubscription = this.emailMeasurDataService.emailSentStatus.subscribe(sentStatus => {
      this.emailSentStatus = sentStatus;
    });

    this.contactSearchDataSource = new Observable((observer: any) => {
      observer.next(this.emailDataForm.controls.emailTo.value);
    }).pipe(mergeMap((value: string) => this.searchContacts(this.getLastToken(value))));

    this.emailDataForm.controls.emailTo.valueChanges.subscribe((value: string) => this.onEmailToChange(value));
  }

  ngOnDestroy() {
    this.emailSentStatusSubscription.unsubscribe();
    this.emailMeasurDataService.emailSentStatus.next(undefined);
    clearTimeout(this.contactAddedBannerTimeout);
  }

  getLastToken(value: string): string {
    const tokens = (value ?? '').split(',');
    return tokens[tokens.length - 1].trim();
  }

  searchContacts(token: string): Observable<Array<SavedContact>> {
    if (!token) return of([]);
    const search = token.toLowerCase();
    return of(this.contactDbService.allContacts.filter(contact =>
      contact.contactName?.toLowerCase().includes(search) || contact.email?.toLowerCase().includes(search)));
  }

  onContactSelected() {
    // Leave a trailing ", " so the field is ready for the next address to be typed.
    const emailToControl = this.emailDataForm.controls.emailTo;
    const value: string = (emailToControl.value ?? '').replace(/[,\s]+$/, '');
    emailToControl.setValue(value + ', ');
    this.save();
  }

  onEmailToChange(value: string) {
    this.currentEmailToken = this.getLastToken(value);
    const isValidEmail = !!this.currentEmailToken && Validators.email(new FormControl(this.currentEmailToken)) === null;
    const matchesExistingContact = this.contactDbService.allContacts.some(contact =>
      contact.email?.trim().toLowerCase() === this.currentEmailToken.toLowerCase());
    this.canAddCurrentEmailAsContact = isValidEmail && !matchesExistingContact;
  }

  async addCurrentEmailToContacts() {
    if (!this.canAddCurrentEmailAsContact) return;
    await this.contactDbService.saveIfNew({ contactName: '', phoneNumber: undefined, email: this.currentEmailToken });
    this.canAddCurrentEmailAsContact = false;
    this.showContactAddedBanner = true;
    clearTimeout(this.contactAddedBannerTimeout);
    this.contactAddedBannerTimeout = setTimeout(() => this.showContactAddedBanner = false, 4000);
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

  invalidCharactersValidator() {
    // * allows letters, numbers, dot, underscore, hyphen, and space.
    const regex = /^[a-zA-Z0-9._\- ]+$/;
    return (control: AbstractControl) => {
      if (!control.value) return null;
      return regex.test(control.value) ? null : { invalidCharacters: true };
    };
  }


  get emailAttachmentName() {
    return this.emailDataForm.get('emailAttachmentName');
  }
}
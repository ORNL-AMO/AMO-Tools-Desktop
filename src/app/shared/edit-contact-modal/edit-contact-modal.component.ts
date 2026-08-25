import { Component, Inject, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Contact } from '../models/settings';
import { EditContactModalData } from './editContactModalData';
import { PhoneNumberValidator } from '../validators/phone-number';

@Component({
    selector: 'app-edit-contact-modal',
    templateUrl: './edit-contact-modal.component.html',
    styleUrls: ['./edit-contact-modal.component.css'],
    standalone: false
})
export class EditContactModalComponent {
  private formBuilder = inject(UntypedFormBuilder);
  dialogRef = inject<DialogRef<Contact>>(DialogRef<Contact>);
  contactForm: UntypedFormGroup;

  constructor(@Inject(DIALOG_DATA) public editContactData: EditContactModalData) {
    this.contactForm = this.formBuilder.group({
      contactName: [this.editContactData.contact?.contactName],
      phoneNumber: [this.editContactData.contact?.phoneNumber, [PhoneNumberValidator.phoneNumber()]],
      email: [this.editContactData.contact?.email, [Validators.email]],
    });
  }

  close(shouldSave: boolean) {
    if (shouldSave) {
      if (this.contactForm.invalid) {
        return;
      }
      this.dialogRef.close({
        contactName: this.contactForm.controls.contactName.value,
        phoneNumber: this.contactForm.controls.phoneNumber.value,
        email: this.contactForm.controls.email.value,
      });
    } else {
      this.dialogRef.close();
    }
  }
}

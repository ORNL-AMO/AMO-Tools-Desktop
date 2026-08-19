import { Component, EventEmitter, Input, OnInit, AfterViewInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Contact } from '../models/settings';
import { EditContactModalData } from './editContactModalData';

@Component({
    selector: 'app-edit-contact-modal',
    templateUrl: './edit-contact-modal.component.html',
    styleUrls: ['./edit-contact-modal.component.css'],
    standalone: false
})
export class EditContactModalComponent implements OnInit, AfterViewInit {
  @Input()
  editContactData: EditContactModalData;
  @Output('emitContact')
  emitContact = new EventEmitter<Contact | undefined>();
  @ViewChild('editContactModal', { static: false }) public editContactModal: ModalDirective;

  contactForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      contactName: [this.editContactData.contact?.contactName],
      phoneNumber: [this.editContactData.contact?.phoneNumber],
      email: [this.editContactData.contact?.email],
    });
  }

  ngAfterViewInit() {
    this.editContactModal.show();
  }

  close(shouldSave: boolean) {
    this.editContactModal.hide();
    if (shouldSave) {
      this.emitContact.emit({
        contactName: this.contactForm.controls.contactName.value,
        phoneNumber: this.contactForm.controls.phoneNumber.value,
        email: this.contactForm.controls.email.value,
      });
    } else {
      this.emitContact.emit(undefined);
    }
  }
}

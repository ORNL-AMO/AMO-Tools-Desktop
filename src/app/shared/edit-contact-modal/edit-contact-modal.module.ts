import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EditContactModalComponent } from './edit-contact-modal.component';



@NgModule({
  declarations: [EditContactModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule
  ],
  exports: [EditContactModalComponent]
})
export class EditContactModalModule { }

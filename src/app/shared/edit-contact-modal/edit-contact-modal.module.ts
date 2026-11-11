import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditContactModalComponent } from './edit-contact-modal.component';



@NgModule({
  declarations: [EditContactModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [EditContactModalComponent]
})
export class EditContactModalModule { }

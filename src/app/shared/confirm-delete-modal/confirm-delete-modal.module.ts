import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap';
import { ConfirmDeleteModalComponent } from './confirm-delete-modal.component';



@NgModule({
  declarations: [ConfirmDeleteModalComponent],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [ConfirmDeleteModalComponent]
})
export class ConfirmDeleteModalModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareDataModalComponent } from './share-data-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [
    ShareDataModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    ShareDataModalComponent]
})
export class ShareDataModalModule { }

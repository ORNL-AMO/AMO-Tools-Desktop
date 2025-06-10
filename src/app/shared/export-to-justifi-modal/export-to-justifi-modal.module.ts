import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportToJustifiModalComponent } from './export-to-justifi-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [
    ExportToJustifiModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    ExportToJustifiModalComponent]
})
export class ExportToJustifiModalModule { }

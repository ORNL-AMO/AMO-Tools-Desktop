import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportToJustifiModalComponent } from './export-to-justifi-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ExportToJustifiModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule
  ],
  exports: [
    ExportToJustifiModalComponent]
})
export class ExportToJustifiModalModule { }

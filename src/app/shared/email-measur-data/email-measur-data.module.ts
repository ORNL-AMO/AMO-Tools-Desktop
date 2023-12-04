import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailMeasurDataComponent } from './email-measur-data.component';
import { EmailMeasurDataModalComponent } from './email-measur-data-modal/email-measur-data-modal.component';
import { EmailMeasurDataService } from './email-measur-data.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    EmailMeasurDataComponent, 
    EmailMeasurDataModalComponent, 
    EmailMeasurDataModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule
  ],
  exports: [
    EmailMeasurDataComponent, 
    EmailMeasurDataModalComponent],
  providers: [
    EmailMeasurDataService
  ]
})
export class EmailMeasurDataModule { }

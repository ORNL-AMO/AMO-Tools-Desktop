import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailMeasurDataComponent } from './email-measur-data.component';
import { EmailMeasurDataModalComponent } from './email-measur-data-modal/email-measur-data-modal.component';
import { EmailMeasurDataItemComponent } from './email-measur-data-item/email-measur-data-item.component';
import { EmailMeasurDataService } from './email-measur-data.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    EmailMeasurDataComponent,
    EmailMeasurDataModalComponent,
    EmailMeasurDataItemComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule
  ],
  exports: [
    EmailMeasurDataComponent,
    EmailMeasurDataModalComponent,
    EmailMeasurDataItemComponent
  ],
  providers: [
    EmailMeasurDataService
  ]
})
export class EmailMeasurDataModule { }

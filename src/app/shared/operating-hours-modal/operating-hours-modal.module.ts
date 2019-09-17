import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperatingHoursModalComponent } from './operating-hours-modal.component';
import { OperatingHoursModalService } from './operating-hours-modal.service';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    OperatingHoursModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    OperatingHoursModalComponent
  ],
  providers: [
    OperatingHoursModalService
  ]
})
export class OperatingHoursModalModule { }

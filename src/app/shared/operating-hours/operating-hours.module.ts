import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursComponent } from './operating-hours.component';
import { OperatingHoursModalService } from '../operating-hours-modal/operating-hours-modal.service';

@NgModule({
  declarations: [OperatingHoursComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [OperatingHoursComponent],
  providers: [OperatingHoursModalService],
})
export class OperatingHoursModule {}

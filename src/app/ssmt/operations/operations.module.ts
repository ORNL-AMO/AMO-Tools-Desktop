import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsComponent } from './operations.component';
import { OperatingCostsComponent } from './operating-costs/operating-costs.component';
import { GeneralOperationsComponent } from './general-operations/general-operations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { OperationsService } from './operations.service';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    OperatingHoursModalModule
  ],
  declarations: [
    OperationsComponent,
    OperatingCostsComponent,
    GeneralOperationsComponent
  ],
  providers: [OperationsService],
  exports: [OperationsComponent]
})
export class OperationsModule { }

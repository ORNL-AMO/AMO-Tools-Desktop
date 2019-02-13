import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsComponent } from './operations.component';
import { OperatingHoursComponent } from './operating-hours/operating-hours.component';
import { OperatingCostsComponent } from './operating-costs/operating-costs.component';
import { GeneralOperationsComponent } from './general-operations/general-operations.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  declarations: [
    OperationsComponent,
    OperatingHoursComponent,
    OperatingCostsComponent,
    GeneralOperationsComponent
  ],
  providers: [],
  exports: [OperationsComponent]
})
export class OperationsModule { }

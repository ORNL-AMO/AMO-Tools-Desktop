import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatingCostComponent } from './operating-cost.component';
import { OperatingCostFormComponent } from './operating-cost-form/operating-cost-form.component';
import { OperatingCostHelpComponent } from './operating-cost-help/operating-cost-help.component';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { OperatingCostService } from './operating-cost.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OperatingHoursModalModule
  ],
  declarations: [
    OperatingCostComponent,
    OperatingCostFormComponent,
    OperatingCostHelpComponent
  ],
  exports: [
    OperatingCostComponent
  ],
  providers: [
    OperatingCostService
  ]
})
export class OperatingCostModule { }

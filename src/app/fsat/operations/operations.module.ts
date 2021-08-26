import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';
import { OperatingCostsComponent } from './operating-costs/operating-costs.component';
import { GeneralOperationsComponent } from './general-operations/general-operations.component';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    SharedPipesModule
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

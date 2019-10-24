import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OperationsFormComponent } from './operations-form/operations-form.component';
import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';
import { OperationsCompareService } from './operations-compare.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    SharedPipesModule
  ],
  declarations: [OperationsFormComponent, OperationsComponent],
  providers: [OperationsService, OperationsCompareService],
  exports: [OperationsComponent]
})
export class OperationsModule { }

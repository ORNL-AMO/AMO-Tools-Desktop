import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    SharedPipesModule
  ],
  declarations: [
    OperationsComponent
  ],
  providers: [OperationsService],
  exports: [OperationsComponent]
})
export class OperationsModule { }

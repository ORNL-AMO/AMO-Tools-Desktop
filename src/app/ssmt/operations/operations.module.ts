import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsComponent } from './operations.component';
import { OperatingCostsComponent } from './operating-costs/operating-costs.component';
import { GeneralOperationsComponent } from './general-operations/general-operations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsService } from './operations.service';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { AssessmentCo2SavingsModule } from '../../shared/assessment-co2-savings/assessment-co2-savings.module';
import { MixedCo2EmissionsModule } from '../../shared/mixed-co2-emissions/mixed-co2-emissions.module';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    SharedPipesModule,
    AssessmentCo2SavingsModule,
    MixedCo2EmissionsModule
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

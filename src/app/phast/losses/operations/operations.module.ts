import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsFormComponent } from './operations-form/operations-form.component';
import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';
import { OperationsCompareService } from './operations-compare.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingCostsModalComponent } from './operating-costs-modal/operating-costs-modal.component';
import { ModalModule } from 'ngx-bootstrap';
import { Co2SavingsPhastModule } from './co2-savings-phast/co2-savings-phast.module';
import { Co2SavingsPhastComponent } from './co2-savings-phast/co2-savings-phast.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    FormsModule,
    OperatingHoursModalModule,
    SharedPipesModule,
    Co2SavingsPhastModule
  ],
  declarations: [OperationsFormComponent, OperationsComponent, OperatingCostsModalComponent],
  providers: [OperationsService, OperationsCompareService],
  exports: [OperationsComponent]
})
export class OperationsModule { }

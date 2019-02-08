import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ElectricityReductionComponent } from './electricity-reduction.component';
import { ElectricityReductionService } from './electricity-reduction.service';
import { ElectricityReductionFormComponent } from './electricity-reduction-form/electricity-reduction-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ElectricityReductionComponent,
    ElectricityReductionFormComponent
  ],
  providers: [
    ElectricityReductionService
  ],
  exports: [
    ElectricityReductionComponent
  ]
})
export class ElectricityReductionModule { }

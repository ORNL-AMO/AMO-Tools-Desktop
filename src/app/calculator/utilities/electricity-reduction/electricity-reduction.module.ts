import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ElectricityReductionComponent } from './electricity-reduction.component';
import { ElectricityReductionService } from './electricity-reduction.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ElectricityReductionComponent
  ],
  providers: [
    ElectricityReductionService
  ]
})
export class ElectricityReductionModule { }

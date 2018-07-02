import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { OperatingCostComponent } from './operating-cost.component';
import { OperatingCostFormComponent } from './operating-cost-form/operating-cost-form.component';
import { OperatingCostHelpComponent } from './operating-cost-help/operating-cost-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    OperatingCostComponent,
    OperatingCostFormComponent,
    OperatingCostHelpComponent
  ],
  exports: [
    OperatingCostComponent
  ]
})
export class OperatingCostModule { }

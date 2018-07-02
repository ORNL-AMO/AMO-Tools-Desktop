import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FlowFactorComponent } from './flow-factor.component';
import { FlowFactorFormComponent } from './flow-factor-form/flow-factor-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    FlowFactorComponent,
    FlowFactorFormComponent
  ],
  exports: [
    FlowFactorComponent
  ]
})
export class FlowFactorModule { }

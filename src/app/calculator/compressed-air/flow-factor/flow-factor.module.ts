import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowFactorComponent } from './flow-factor.component';
import { FlowFactorFormComponent } from './flow-factor-form/flow-factor-form.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedPipesModule
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

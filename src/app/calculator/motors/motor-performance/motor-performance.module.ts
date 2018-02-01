import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MotorPerformanceGraphComponent } from './motor-performance-graph/motor-performance-graph.component';
import { MotorPerformanceFormComponent } from './motor-performance-form/motor-performance-form.component';
import { MotorPerformanceComponent } from './motor-performance.component';
import { MotorPerformanceHelpComponent } from './motor-performance-help/motor-performance-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    MotorPerformanceComponent,
    MotorPerformanceGraphComponent,
    MotorPerformanceFormComponent,
    MotorPerformanceHelpComponent
  ],
  exports: [
    MotorPerformanceComponent
  ]
})
export class MotorPerformanceModule { }

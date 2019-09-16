import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MotorPerformanceGraphComponent } from './motor-performance-graph/motor-performance-graph.component';
import { MotorPerformanceFormComponent } from './motor-performance-form/motor-performance-form.component';
import { MotorPerformanceComponent } from './motor-performance.component';
import { MotorPerformanceHelpComponent } from './motor-performance-help/motor-performance-help.component';
import { MotorPerformanceService } from './motor-performance.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule
  ],
  declarations: [
    MotorPerformanceComponent,
    MotorPerformanceGraphComponent,
    MotorPerformanceFormComponent,
    MotorPerformanceHelpComponent
  ],
  exports: [
    MotorPerformanceComponent
  ],
  providers: [
    MotorPerformanceService
  ]
})
export class MotorPerformanceModule { }

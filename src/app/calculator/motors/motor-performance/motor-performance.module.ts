import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MotorPerformanceFormComponent } from './motor-performance-form/motor-performance-form.component';
import { MotorPerformanceComponent } from './motor-performance.component';
import { MotorPerformanceHelpComponent } from './motor-performance-help/motor-performance-help.component';
import { MotorPerformanceService } from './motor-performance.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { MotorPerformanceChartComponent } from './motor-performance-chart/motor-performance-chart.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule
  ],
  declarations: [
    MotorPerformanceComponent,
    MotorPerformanceFormComponent,
    MotorPerformanceHelpComponent,
    MotorPerformanceChartComponent,
  ],
  exports: [
    MotorPerformanceComponent
  ],
  providers: [
    MotorPerformanceService
  ]
})
export class MotorPerformanceModule { }

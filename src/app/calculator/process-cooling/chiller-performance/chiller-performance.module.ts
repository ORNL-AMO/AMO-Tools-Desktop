import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChillerPerformanceComponent } from './chiller-performance.component';
import { ChillerPerformanceFormComponent } from './chiller-performance-form/chiller-performance-form.component';
import { ChillerPerformanceResultsComponent } from './chiller-performance-results/chiller-performance-results.component';
import { ChillerPerformanceHelpComponent } from './chiller-performance-help/chiller-performance-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ChillerPerformanceService } from './chiller-performance.service';
import { ChillerPerformanceFormService } from './chiller-performance-form.service';
import { ChillerPerformanceChartComponent } from './chiller-performance-chart/chiller-performance-chart.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { WeatherBinsModule } from '../../utilities/weather-bins/weather-bins.module';



@NgModule({
  declarations: [
    ChillerPerformanceComponent,
    ChillerPerformanceFormComponent,
    ChillerPerformanceResultsComponent,
    ChillerPerformanceHelpComponent,
    ChillerPerformanceChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
    SimpleTooltipModule,
    WeatherBinsModule
  ],
  exports: [
    ChillerPerformanceComponent
  ],
  providers: [
    ChillerPerformanceService,
    ChillerPerformanceFormService
  ]
})
export class ChillerPerformanceModule { }

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



@NgModule({
  declarations: [
    ChillerPerformanceComponent,
    ChillerPerformanceFormComponent,
    ChillerPerformanceResultsComponent,
    ChillerPerformanceHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
  ],
  exports: [
    ChillerPerformanceComponent
  ]
})
export class ChillerPerformanceModule { }

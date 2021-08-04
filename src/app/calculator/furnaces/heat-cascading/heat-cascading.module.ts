import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatCascadingComponent } from './heat-cascading.component';
import { HeatCascadingFormComponent } from './heat-cascading-form/heat-cascading-form.component';
import { HeatCascadingResultsComponent } from './heat-cascading-results/heat-cascading-results.component';
import { HeatCascadingHelpComponent } from './heat-cascading-help/heat-cascading-help.component';
import { HeatCascadingService } from './heat-cascading.service';
import { HeatCascadingFormService } from './heat-cascading-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';



@NgModule({
  declarations: [
    HeatCascadingComponent,
    HeatCascadingFormComponent,
    HeatCascadingResultsComponent,
    HeatCascadingHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    FlueGasModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
  ],
  exports: [
    HeatCascadingComponent
  ],
  providers: [
    HeatCascadingService,
    HeatCascadingFormService
  ]
})
export class HeatCascadingModule { }

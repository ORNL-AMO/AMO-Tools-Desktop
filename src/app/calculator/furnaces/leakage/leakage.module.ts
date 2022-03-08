import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeakageComponent } from './leakage.component';
import { LeakageFormComponent } from './leakage-form/leakage-form.component';
import { LeakageResultsComponent } from './leakage-results/leakage-results.component';
import { LeakageHelpComponent } from './leakage-help/leakage-help.component';
import { LeakageFormService } from './leakage-form.service';
import { LeakageService } from './leakage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [
    LeakageComponent,
    LeakageFormComponent,
    LeakageResultsComponent,
    LeakageHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    FlueGasModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
    ModalModule
  ],
  exports: [
    LeakageComponent
  ],
  providers: [
    LeakageService,
    LeakageFormService
  ]
})
export class LeakageModule { }

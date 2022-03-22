import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpeningComponent } from './opening.component';
import { OpeningHelpComponent } from './opening-help/opening-help.component';
import { OpeningResultsComponent } from './opening-results/opening-results.component';
import { OpeningFormComponent } from './opening-form/opening-form.component';
import { OpeningFormService } from './opening-form.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { OpeningService } from './opening.service';


@NgModule({
  declarations: [
    OpeningComponent,
    OpeningHelpComponent,
    OpeningResultsComponent,
    OpeningFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    FlueGasModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  exports: [
    OpeningComponent
  ], 
  providers: [
    OpeningService,
    OpeningFormService
  ]
})
export class OpeningModule { }

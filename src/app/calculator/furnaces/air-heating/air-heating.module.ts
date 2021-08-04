import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirHeatingComponent } from './air-heating.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { AirHeatingFormComponent } from './air-heating-form/air-heating-form.component';
import { AirHeatingResultsComponent } from './air-heating-results/air-heating-results.component';
import { AirHeatingHelpComponent } from './air-heating-help/air-heating-help.component';
import { AirHeatingService } from './air-heating.service';
import { AirHeatingFormService } from './air-heating-form.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ModalModule } from 'ngx-bootstrap';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';

@NgModule({
  declarations: [
    AirHeatingComponent,
    AirHeatingFormComponent,
    AirHeatingResultsComponent,
    AirHeatingHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
  ],
  exports: [
    AirHeatingComponent
  ],
  providers: [
    AirHeatingService,
    AirHeatingFormService,
  ]
})
export class AirHeatingModule { }

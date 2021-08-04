import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtmosphereFormComponent } from './atmosphere-form/atmosphere-form.component';
import { AtmosphereResultsComponent } from './atmosphere-results/atmosphere-results.component';
import { AtmosphereHelpComponent } from './atmosphere-help/atmosphere-help.component';
import { AtmosphereComponent } from './atmosphere.component';
import { AtmosphereService } from './atmosphere.service';
import { AtmosphereFormService } from './atmosphere-form.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ModalModule } from 'ngx-bootstrap';



@NgModule({
  declarations: [
    AtmosphereComponent, 
    AtmosphereFormComponent, 
    AtmosphereResultsComponent, 
    AtmosphereHelpComponent
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
    AtmosphereComponent
  ],
  providers: [
    AtmosphereService,
    AtmosphereFormService
  ]
})
export class AtmosphereModule { }

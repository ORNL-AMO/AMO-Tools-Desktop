import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixtureComponent } from './fixture.component';
import { FixtureFormComponent } from './fixture-form/fixture-form.component';
import { FixtureResultsComponent } from './fixture-results/fixture-results.component';
import { FixtureHelpComponent } from './fixture-help/fixture-help.component';
import { FixtureFormService } from './fixture-form.service';
import { FixtureService } from './fixture.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ModalModule } from 'ngx-bootstrap';



@NgModule({
  declarations: [FixtureComponent, FixtureFormComponent, FixtureResultsComponent, FixtureHelpComponent],
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
    FixtureComponent
  ],
  providers: [
    FixtureService,
    FixtureFormService
  ]
})
export class FixtureModule { }

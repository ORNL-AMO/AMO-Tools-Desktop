import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WallFormComponent } from './wall-form/wall-form.component';
import { WallHelpComponent } from './wall-help/wall-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { WallService } from './wall.service';
import { WallFormService } from './wall-form.service';
import { WallComponent } from './wall.component';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { WallResultsComponent } from './wall-results/wall-results.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';



@NgModule({
  declarations: [
    WallFormComponent, 
    WallHelpComponent, 
    WallComponent, WallResultsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule,
    SharedPipesModule,
    FlueGasModule,
    SuiteDbModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  exports: [
    WallComponent
  ],
  providers: [
    WallService,
    WallFormService
  ]
})
export class WallModule { }

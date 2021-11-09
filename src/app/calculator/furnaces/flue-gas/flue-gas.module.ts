import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlueGasHelpComponent } from './flue-gas-help/flue-gas-help.component';
import { FlueGasResultsComponent } from './flue-gas-results/flue-gas-results.component';
import { FlueGasService } from './flue-gas.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlueGasFormVolumeComponent } from './flue-gas-form-volume/flue-gas-form-volume.component';
import { FlueGasFormMassComponent } from './flue-gas-form-mass/flue-gas-form-mass.component';
import { FlueGasComponent } from './flue-gas.component';
import { ModalModule } from 'ngx-bootstrap';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FlueGasModalComponent } from './flue-gas-modal/flue-gas-modal.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { EnergyFormComponent } from './energy-form/energy-form.component';
import { FlueGasFormService } from './flue-gas-form.service';
import { EnergyFormService } from './energy-form.service';



@NgModule({
  declarations: [
    FlueGasComponent,
    FlueGasHelpComponent, 
    FlueGasResultsComponent,
    FlueGasFormVolumeComponent,
    FlueGasFormMassComponent,
    FlueGasModalComponent,
    EnergyFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  exports: [
    FlueGasComponent,
    FlueGasModalComponent
  ],
  providers: [
    FlueGasService,
    FlueGasFormService,
    EnergyFormService
  ]
})
export class FlueGasModule { }

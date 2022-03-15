import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoolingResultsComponent } from './cooling-results/cooling-results.component';
import { CoolingHelpComponent } from './cooling-help/cooling-help.component';
import { CoolingComponent } from './cooling.component';
import { CoolingService } from './cooling.service';
import { CoolingFormService } from './cooling-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { FlueGasModule } from '../flue-gas/flue-gas.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GasCoolingFormComponent } from './gas-cooling-form/gas-cooling-form.component';
import { LiquidCoolingFormComponent } from './liquid-cooling-form/liquid-cooling-form.component';
import { LossNameFormComponent } from './loss-name-form/loss-name-form.component';
import { EnergyFormComponent } from './energy-form/energy-form.component';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';


@NgModule({
  declarations: [
    CoolingResultsComponent, 
    CoolingHelpComponent,
    CoolingComponent,
    GasCoolingFormComponent,
    LiquidCoolingFormComponent,
    LossNameFormComponent,
    EnergyFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    SuiteDbModule,
    FlueGasModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
    ModalModule
  ],
  exports: [
    CoolingComponent
  ],
  providers: [
    CoolingService,
    CoolingFormService
  ]
})
export class CoolingModule { }

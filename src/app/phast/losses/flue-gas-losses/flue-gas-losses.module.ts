import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { FlueGasLossesComponent } from './flue-gas-losses.component';
import { FlueGasLossesFormVolumeComponent } from './flue-gas-losses-form-volume/flue-gas-losses-form-volume.component';
import { FlueGasLossesFormMassComponent } from "./flue-gas-losses-form-mass/flue-gas-losses-form-mass.component";

import { FlueGasCompareService } from "./flue-gas-compare.service";
import { FlueGasLossesService } from "./flue-gas-losses.service";
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SuiteDbModule,
    ModalModule
  ],
  declarations: [
    FlueGasLossesComponent,
    FlueGasLossesFormMassComponent,
    FlueGasLossesFormVolumeComponent
  ],
  providers: [
    FlueGasCompareService,
    FlueGasLossesService
  ],
  exports: [
    FlueGasLossesComponent
  ]
})
export class FlueGasLossesModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";

import { ChargeMaterialCompareService } from './charge-material-compare.service';
import { ChargeMaterialComponent } from "./charge-material.component";
import { ChargeMaterialService } from "./charge-material.service";
import { GasChargeMaterialFormComponent } from './gas-charge-material-form/gas-charge-material-form.component';
import { LiquidChargeMaterialFormComponent } from "./liquid-charge-material-form/liquid-charge-material-form.component";
import { SolidChargeMaterialFormComponent } from "./solid-charge-material-form/solid-charge-material-form.component";

import { ModalModule } from 'ngx-bootstrap';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ModalModule,
    SuiteDbModule
  ],
  declarations: [
    ChargeMaterialComponent,
    GasChargeMaterialFormComponent,
    LiquidChargeMaterialFormComponent,
    SolidChargeMaterialFormComponent
  ],
  providers: [
    ChargeMaterialCompareService,
    ChargeMaterialService
  ],
  exports: [
    ChargeMaterialComponent
  ]
})
export class ChargeMaterialModule { }

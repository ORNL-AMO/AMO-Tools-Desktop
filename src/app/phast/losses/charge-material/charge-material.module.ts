import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChargeMaterialCompareService } from './charge-material-compare.service';
import { ChargeMaterialComponent } from "./charge-material.component";
import { GasChargeMaterialFormComponent } from './gas-charge-material-form/gas-charge-material-form.component';
import { LiquidChargeMaterialFormComponent } from "./liquid-charge-material-form/liquid-charge-material-form.component";
import { SolidChargeMaterialFormComponent } from "./solid-charge-material-form/solid-charge-material-form.component";

import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule
  ],
  declarations: [
    ChargeMaterialComponent,
    GasChargeMaterialFormComponent,
    LiquidChargeMaterialFormComponent,
    SolidChargeMaterialFormComponent
  ],
  providers: [
    ChargeMaterialCompareService,
  ],
  exports: [
    ChargeMaterialComponent
  ]
})
export class ChargeMaterialModule { }

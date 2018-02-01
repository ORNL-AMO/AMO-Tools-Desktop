import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";
import { CoolingLossesCompareService } from "./cooling-losses-compare.service";
import { CoolingLossesComponent } from "./cooling-losses.component";
import { CoolingLossesService } from "./cooling-losses.service";
import { GasCoolingLossesFormComponent } from "./gas-cooling-losses-form/gas-cooling-losses-form.component";
import { LiquidCoolingLossesFormComponent } from "./liquid-cooling-losses-form/liquid-cooling-losses-form.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CoolingLossesComponent,
    GasCoolingLossesFormComponent,
    LiquidCoolingLossesFormComponent
  ],
  providers: [
    CoolingLossesCompareService,
    CoolingLossesService
  ],
  exports: [
    CoolingLossesComponent
  ]
})
export class CoolingLossesModule { }

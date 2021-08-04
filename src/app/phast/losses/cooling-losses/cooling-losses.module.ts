import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CoolingLossesCompareService } from "./cooling-losses-compare.service";
import { CoolingLossesComponent } from "./cooling-losses.component";
import { GasCoolingLossesFormComponent } from "./gas-cooling-losses-form/gas-cooling-losses-form.component";
import { LiquidCoolingLossesFormComponent } from "./liquid-cooling-losses-form/liquid-cooling-losses-form.component";
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [
    CoolingLossesComponent,
    GasCoolingLossesFormComponent,
    LiquidCoolingLossesFormComponent
  ],
  providers: [
    CoolingLossesCompareService,
  ],
  exports: [
    CoolingLossesComponent
  ]
})
export class CoolingLossesModule { }

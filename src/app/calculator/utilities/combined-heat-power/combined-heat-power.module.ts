import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CombinedHeatPowerComponent } from './combined-heat-power.component';
import { CombinedHeatPowerFormComponent } from './combined-heat-power-form/combined-heat-power-form.component';
import { CombinedHeatPowerHelpComponent } from './combined-heat-power-help/combined-heat-power-help.component';
import { CombinedHeatPowerResultsComponent } from './combined-heat-power-results/combined-heat-power-results.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CombinedHeatPowerComponent,
    CombinedHeatPowerFormComponent,
    CombinedHeatPowerHelpComponent,
    CombinedHeatPowerResultsComponent
  ],
  exports: [
    CombinedHeatPowerComponent
  ]
})
export class CombinedHeatPowerModule { }

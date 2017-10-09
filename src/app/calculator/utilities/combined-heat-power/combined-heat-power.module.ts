import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CombinedHeatPowerComponent } from './combined-heat-power.component';
import { CombinedHeatPowerFormComponent } from './combined-heat-power-form/combined-heat-power-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CombinedHeatPowerComponent,
    CombinedHeatPowerFormComponent
  ],
  exports: [
    CombinedHeatPowerComponent
  ]
})
export class CombinedHeatPowerModule { }

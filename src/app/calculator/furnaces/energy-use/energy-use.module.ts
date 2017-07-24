import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyUseFormComponent } from './energy-use-form/energy-use-form.component';
import { EnergyUseComponent } from './energy-use.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    EnergyUseFormComponent,
    EnergyUseComponent
  ],
  exports: [
    EnergyUseComponent
  ]
})
export class EnergyUseModule { }

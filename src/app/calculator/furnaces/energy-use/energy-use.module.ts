import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnergyUseFormComponent } from './energy-use-form/energy-use-form.component';
import { EnergyUseComponent } from './energy-use.component';
import { EnergyUseHelpComponent } from './energy-use-help/energy-use-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    EnergyUseFormComponent,
    EnergyUseComponent,
    EnergyUseHelpComponent
  ],
  exports: [
    EnergyUseComponent
  ]
})
export class EnergyUseModule { }

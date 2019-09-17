import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EnergyEquivalencyComponent } from './energy-equivalency.component';
import { EnergyEquivalencyFormComponent } from './energy-equivalency-form/energy-equivalency-form.component';
import { EnergyEquivalencyHelpComponent } from './energy-equivalency-help/energy-equivalency-help.component';
import { EnergyEquivalencyService } from './energy-equivalency.service';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    EnergyEquivalencyComponent,
    EnergyEquivalencyFormComponent,
    EnergyEquivalencyHelpComponent
  ],
  exports: [
    EnergyEquivalencyComponent
  ],
  providers: [
    EnergyEquivalencyService
  ]
})
export class EnergyEquivalencyModule { }

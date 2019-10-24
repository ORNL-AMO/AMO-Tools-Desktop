import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { MeteredEnergyComponent } from './metered-energy.component';
import { MeteredEnergyService } from './metered-energy.service';
import { MeteredFuelFormComponent } from './metered-fuel-form/metered-fuel-form.component';
import { MeteredEnergyHelpComponent } from './metered-energy-help/metered-energy-help.component';
import { MeteredSteamFormComponent } from './metered-steam-form/metered-steam-form.component';
import { MeteredElectricityFormComponent } from './metered-electricity-form/metered-electricity-form.component';
import { MeteredEnergyResultsComponent } from './metered-energy-results/metered-energy-results.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    MeteredEnergyComponent,
    MeteredFuelFormComponent,
    MeteredSteamFormComponent,
    MeteredElectricityFormComponent,
    MeteredEnergyResultsComponent,
    MeteredEnergyHelpComponent,
  ],
  //components exported for use in preAssessments calculator
  exports: [
    MeteredEnergyComponent,
    MeteredElectricityFormComponent,
    MeteredFuelFormComponent,
    MeteredSteamFormComponent,
    MeteredEnergyResultsComponent,
    MeteredEnergyHelpComponent,
  ],
  providers: [
    MeteredEnergyService
  ]
})
export class MeteredEnergyModule { }

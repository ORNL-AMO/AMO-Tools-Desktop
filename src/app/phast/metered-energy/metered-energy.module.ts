import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { MeteredEnergyComponent } from './metered-energy.component';
import { MeteredEnergyService } from './metered-energy.service';
import { MeteredFuelFormComponent } from './metered-fuel-form/metered-fuel-form.component';
import { MeteredFuelHelpComponent } from './metered-fuel-help/metered-fuel-help.component';
import { MeteredSteamFormComponent } from './metered-steam-form/metered-steam-form.component';
import { MeteredSteamHelpComponent } from './metered-steam-help/metered-steam-help.component';
import { MeteredElectricityFormComponent } from './metered-electricity-form/metered-electricity-form.component';
import { MeteredElectricityHelpComponent } from './metered-electricity-help/metered-electricity-help.component';
import { MeteredEnergyResultsComponent } from './metered-energy-results/metered-energy-results.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    MeteredEnergyComponent,
    MeteredFuelFormComponent,
    MeteredFuelHelpComponent,
    MeteredSteamFormComponent,
    MeteredSteamHelpComponent,
    MeteredElectricityFormComponent,
    MeteredElectricityHelpComponent,
    MeteredEnergyResultsComponent,
  ],
  //components exported for use in preAssessments calculator
  exports: [
    MeteredEnergyComponent,
    MeteredElectricityFormComponent,
    MeteredFuelFormComponent,
    MeteredSteamFormComponent,
    MeteredEnergyResultsComponent,
    MeteredFuelHelpComponent,
    MeteredSteamHelpComponent,
    MeteredElectricityHelpComponent
  ],
  providers: [
    MeteredEnergyService
  ]
})
export class MeteredEnergyModule { }

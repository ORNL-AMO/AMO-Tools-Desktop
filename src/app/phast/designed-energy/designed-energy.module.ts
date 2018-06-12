import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignedEnergyComponent } from './designed-energy.component';
import { DesignedEnergyResultsComponent } from './designed-energy-results/designed-energy-results.component';
import { DesignedEnergySteamFormComponent } from './designed-energy-steam-form/designed-energy-steam-form.component';
import { DesignedEnergySteamHelpComponent } from './designed-energy-steam-help/designed-energy-steam-help.component';
import { DesignedEnergyFuelFormComponent } from './designed-energy-fuel-form/designed-energy-fuel-form.component';
import { DesignedEnergyFuelHelpComponent } from './designed-energy-fuel-help/designed-energy-fuel-help.component';
import { DesignedEnergyElectricityFormComponent } from './designed-energy-electricity-form/designed-energy-electricity-form.component';
import { DesignedEnergyElectricityHelpComponent } from './designed-energy-electricity-help/designed-energy-electricity-help.component';
import { DesignedEnergyService } from './designed-energy.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    DesignedEnergyComponent,
    DesignedEnergyResultsComponent,
    DesignedEnergySteamFormComponent,
    DesignedEnergySteamHelpComponent,
    DesignedEnergyFuelFormComponent,
    DesignedEnergyFuelHelpComponent,
    DesignedEnergyElectricityFormComponent,
    DesignedEnergyElectricityHelpComponent
  ],
  exports: [
    DesignedEnergyComponent,
    DesignedEnergyElectricityFormComponent,
    DesignedEnergyFuelFormComponent,
    DesignedEnergySteamFormComponent,
    DesignedEnergyResultsComponent,
    DesignedEnergyFuelHelpComponent,
    DesignedEnergySteamHelpComponent,
    DesignedEnergyElectricityHelpComponent
  ],
  providers: [
    DesignedEnergyService
  ]
})
export class DesignedEnergyModule { }

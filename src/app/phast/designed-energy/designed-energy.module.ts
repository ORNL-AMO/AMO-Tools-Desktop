import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignedEnergyComponent } from './designed-energy.component';
import { DesignedEnergyResultsComponent } from './designed-energy-results/designed-energy-results.component';
import { DesignedEnergySteamFormComponent } from './designed-energy-steam-form/designed-energy-steam-form.component';
import { DesignedEnergyHelpComponent } from './designed-energy-help/designed-energy-help.component';
import { DesignedEnergyFuelFormComponent } from './designed-energy-fuel-form/designed-energy-fuel-form.component';
import { DesignedEnergyElectricityFormComponent } from './designed-energy-electricity-form/designed-energy-electricity-form.component';
import { DesignedEnergyService } from './designed-energy.service';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OperatingHoursModalModule
  ],
  declarations: [
    DesignedEnergyComponent,
    DesignedEnergyResultsComponent,
    DesignedEnergySteamFormComponent,
    DesignedEnergyHelpComponent,
    DesignedEnergyFuelFormComponent,
    DesignedEnergyElectricityFormComponent,
  ],
  exports: [
    DesignedEnergyComponent,
    DesignedEnergyElectricityFormComponent,
    DesignedEnergyFuelFormComponent,
    DesignedEnergySteamFormComponent,
    DesignedEnergyResultsComponent,
    DesignedEnergyHelpComponent,
  ],
  providers: [
    DesignedEnergyService
  ]
})
export class DesignedEnergyModule { }

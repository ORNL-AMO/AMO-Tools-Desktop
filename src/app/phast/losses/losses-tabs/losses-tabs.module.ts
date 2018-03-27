import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LossesTabsComponent } from './losses-tabs.component';
import { ChargeMaterialTabComponent } from './charge-material-tab/charge-material-tab.component';
import { AtmosphereTabComponent } from './atmosphere-tab/atmosphere-tab.component';
import { AuxiliaryPowerTabComponent } from './auxiliary-power-tab/auxiliary-power-tab.component';
import { CoolingTabComponent } from './cooling-tab/cooling-tab.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LossesTabsComponent, ChargeMaterialTabComponent, AtmosphereTabComponent, AuxiliaryPowerTabComponent, CoolingTabComponent],
  exports: [LossesTabsComponent]
})
export class LossesTabsModule { }

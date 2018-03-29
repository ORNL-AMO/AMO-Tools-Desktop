import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LossesTabsComponent } from './losses-tabs.component';
import { ChargeMaterialTabComponent } from './charge-material-tab/charge-material-tab.component';
import { AtmosphereTabComponent } from './atmosphere-tab/atmosphere-tab.component';
import { AuxiliaryPowerTabComponent } from './auxiliary-power-tab/auxiliary-power-tab.component';
import { CoolingTabComponent } from './cooling-tab/cooling-tab.component';
import { EnergyInputTabComponent } from './energy-input-tab/energy-input-tab.component';
import { EnergyInputExhaustGasTabComponent } from './energy-input-exhaust-gas-tab/energy-input-exhaust-gas-tab.component';
import { ExtendedSurfaceTabComponent } from './extended-surface-tab/extended-surface-tab.component';
import { FixtureTabComponent } from './fixture-tab/fixture-tab.component';
import { FlueGasTabComponent } from './flue-gas-tab/flue-gas-tab.component';
import { GasLeakageTabComponent } from './gas-leakage-tab/gas-leakage-tab.component';
import { SystemEfficiencyTabComponent } from './system-efficiency-tab/system-efficiency-tab.component';
import { OpeningTabComponent } from './opening-tab/opening-tab.component';
import { OtherTabComponent } from './other-tab/other-tab.component';
import { SlagTabComponent } from './slag-tab/slag-tab.component';
import { WallTabComponent } from './wall-tab/wall-tab.component';
import { OperationsTabComponent } from './operations-tab/operations-tab.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LossesTabsComponent, ChargeMaterialTabComponent, AtmosphereTabComponent, AuxiliaryPowerTabComponent, CoolingTabComponent, EnergyInputTabComponent, EnergyInputExhaustGasTabComponent, ExtendedSurfaceTabComponent, FixtureTabComponent, FlueGasTabComponent, GasLeakageTabComponent, SystemEfficiencyTabComponent, OpeningTabComponent, OtherTabComponent, SlagTabComponent, WallTabComponent, OperationsTabComponent],
  exports: [LossesTabsComponent]
})
export class LossesTabsModule { }

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';
import { SankeyComponent } from './sankey/sankey.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { OperatingHoursComponent } from './operating-hours/operating-hours.component';
import { LossesComponent } from './losses/losses.component';
import { AuxEquipmentComponent } from './aux-equipment/aux-equipment.component';
import { DesignedEnergyUseComponent } from './designed-energy-use/designed-energy-use.component';
import { MeteredEnergyUseComponent } from './metered-energy-use/metered-energy-use.component';
import { PhastTabsComponent } from './phast-tabs/phast-tabs.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { DataPanelComponent } from './data-panel/data-panel.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';
@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
    SankeyComponent,
    PhastTabsComponent,
    SystemBasicsComponent,
    OperatingHoursComponent,
    LossesComponent,
    AuxEquipmentComponent,
    DesignedEnergyUseComponent,
    MeteredEnergyUseComponent,
    HelpPanelComponent,
    DataPanelComponent,
    SettingsPanelComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  providers: []
})

export class PhastModule { }

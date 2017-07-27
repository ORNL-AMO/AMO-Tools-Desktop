import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';
import { ToastyModule } from 'ng2-toasty';
import { MeteredEnergyModule } from './metered-energy/metered-energy.module';
import { LossesModule } from './losses/losses.module';
import { DesignedEnergyModule } from './designed-energy/designed-energy.module';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';
import { SankeyComponent } from './sankey/sankey.component';
import { SankeyDiagramComponent } from './sankey/sankey-diagram/sankey-diagram.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { OperatingHoursComponent } from './operating-hours/operating-hours.component';
import { AuxEquipmentComponent } from './aux-equipment/aux-equipment.component';
import { PhastTabsComponent } from './phast-tabs/phast-tabs.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { DataPanelComponent } from './data-panel/data-panel.component';

import { PhastService } from './phast.service';
import { SystemSetupComponent } from './system-setup/system-setup.component';
import { SettingsModule } from '../settings/settings.module';


@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
    SankeyComponent,
    PhastTabsComponent,
    SystemBasicsComponent,
    OperatingHoursComponent,
    AuxEquipmentComponent,
    HelpPanelComponent,
    DataPanelComponent,
    SankeyDiagramComponent,
    SystemSetupComponent,
    DesignedEnergyModule

  ],
  exports: [
  ],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ModalModule,
    LossesModule,
    ToastyModule,
    SettingsModule,
    MeteredEnergyModule
  ],
  providers: [
    PhastService
  ]
})

export class PhastModule { }

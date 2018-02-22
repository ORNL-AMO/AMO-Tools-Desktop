import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatComponent } from './fsat.component';
import { FsatService } from './fsat.service';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../settings/settings.module';
import { FsatBannerComponent } from './fsat-banner/fsat-banner.component';
import { FsatTabsComponent } from './fsat-tabs/fsat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SystemBasicsHelpComponent } from './help-panel/system-basics-help/system-basics-help.component';

import { FsatBasicsHelpComponent } from './help-panel/fsat-basics-help/fsat-basics-help.component';
import { HelpPanelService } from './help-panel/help-panel.service';
import { FsatInfoComponent } from './fsat-info/fsat-info.component';
import { FanCurveDataComponent } from './fan-curve-data/fan-curve-data.component';
import { OperatingPointsComponent } from './operating-points/operating-points.component';
import { OperatingPointsFormComponent } from './operating-points/operating-points-form/operating-points-form.component';
import { RatedOperatingPointsComponent } from './rated-operating-points/rated-operating-points.component';
import { RatedOperatingPointsFormComponent } from './rated-operating-points/rated-operating-points-form/rated-operating-points-form.component';
import { FanCurveDataHelpComponent } from './help-panel/fan-curve-data-help/fan-curve-data-help.component';
import { OperatingPointsHelpComponent } from './help-panel/operating-points-help/operating-points-help.component';
import { Fsat203Module } from '../calculator/fans/fsat-203/fsat-203.module';
import { ModalModule } from 'ngx-bootstrap';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    SettingsModule,
    Fsat203Module,
    ModalModule
  ],
  declarations: [FsatComponent, FsatBannerComponent, FsatTabsComponent, SystemBasicsComponent, HelpPanelComponent, SystemBasicsHelpComponent, FsatBasicsHelpComponent, FsatInfoComponent, FanCurveDataComponent, OperatingPointsComponent, OperatingPointsFormComponent, RatedOperatingPointsComponent, RatedOperatingPointsFormComponent, FanCurveDataHelpComponent, OperatingPointsHelpComponent],
  providers: [FsatService, HelpPanelService],
  exports: [FsatComponent]
})
export class FsatModule { }

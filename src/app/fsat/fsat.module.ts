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
import { FsatFluidComponent } from './fsat-fluid/fsat-fluid.component';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { SharedModule } from '../shared/shared.module';
import { FanSetupComponent } from './fan-setup/fan-setup.component';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorComponent } from './fan-motor/fan-motor.component';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { PsatService } from '../psat/psat.service';
import { FanFieldDataComponent } from './fan-field-data/fan-field-data.component';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    SettingsModule,
    Fsat203Module,
    ModalModule,
    SharedModule
  ],
  declarations: [
    FsatComponent, 
    FsatBannerComponent, 
    FsatTabsComponent, 
    SystemBasicsComponent, 
    HelpPanelComponent, 
    SystemBasicsHelpComponent, 
    FsatBasicsHelpComponent, 
    FsatInfoComponent, 
    FanCurveDataComponent, 
    OperatingPointsComponent, 
    OperatingPointsFormComponent, 
    RatedOperatingPointsComponent, 
    RatedOperatingPointsFormComponent, 
    FanCurveDataHelpComponent, 
    OperatingPointsHelpComponent, 
    FsatFluidComponent, 
    FanSetupComponent, 
    FanMotorComponent, FanFieldDataComponent
  ],
  providers: [FsatService, HelpPanelService, FsatFluidService, FanSetupService, FanMotorService, PsatService, FanFieldDataService],
  exports: [FsatComponent]
})
export class FsatModule { }

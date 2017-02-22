import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';
import { PsatTabsComponent } from './psat-tabs/psat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { PumpFluidComponent } from './pump-fluid/pump-fluid.component';
import { MotorComponent } from './motor/motor.component';
import { FieldDataComponent } from './field-data/field-data.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';
import { DataPanelComponent } from './data-panel/data-panel.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { BaselineComponent } from './modify-conditions/baseline/baseline.component';
import { AdjustmentComponent } from './modify-conditions/adjustment/adjustment.component';

@NgModule({
  declarations: [
    PsatComponent,
    PsatBannerComponent,
    PsatTabsComponent,
    SystemBasicsComponent,
    PumpFluidComponent,
    MotorComponent,
    FieldDataComponent,
    ModifyConditionsComponent,
    SettingsPanelComponent,
    DataPanelComponent,
    HelpPanelComponent,
    BaselineComponent,
    AdjustmentComponent
  ],
  exports: [

  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
  ]
})

export class PsatModule { }

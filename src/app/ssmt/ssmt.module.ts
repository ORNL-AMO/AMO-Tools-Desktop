import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtComponent } from './ssmt.component';
import { SsmtBannerComponent } from './ssmt-banner/ssmt-banner.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SsmtTabsComponent } from './ssmt-tabs/ssmt-tabs.component';
import { SsmtService } from './ssmt.service';
import { OperationsComponent } from './operations/operations.component';
import { BoilerComponent } from './boiler/boiler.component';
import { HeaderComponent } from './header/header.component';
import { TurbineComponent } from './turbine/turbine.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SystemBasicsHelpComponent } from './help-panel/system-basics-help/system-basics-help.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [SsmtComponent, SsmtBannerComponent, SystemBasicsComponent, SsmtTabsComponent, OperationsComponent, BoilerComponent, HeaderComponent, TurbineComponent, HelpPanelComponent, SystemBasicsHelpComponent],
  providers: [SsmtService]
})
export class SsmtModule { }

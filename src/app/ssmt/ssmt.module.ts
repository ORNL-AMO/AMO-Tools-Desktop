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

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SsmtComponent, SsmtBannerComponent, SystemBasicsComponent, SsmtTabsComponent, OperationsComponent, BoilerComponent, HeaderComponent, TurbineComponent, HelpPanelComponent],
  providers: [SsmtService]
})
export class SsmtModule { }

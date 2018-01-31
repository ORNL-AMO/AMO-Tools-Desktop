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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    SettingsModule
  ],
  declarations: [FsatComponent, FsatBannerComponent, FsatTabsComponent, SystemBasicsComponent, HelpPanelComponent, SystemBasicsHelpComponent],
  providers: [FsatService],
  exports: [FsatComponent]
})
export class FsatModule { }

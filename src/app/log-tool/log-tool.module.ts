import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogToolComponent } from './log-tool.component';
import { LogToolBannerComponent } from './log-tool-banner/log-tool-banner.component';
import { RouterModule } from '@angular/router';
import { LogToolService } from './log-tool.service';
import { SystemSetupComponent } from './system-setup/system-setup.component';
import { HelpPanelComponent } from './system-setup/help-panel/help-panel.component';
import { VisualizeComponent } from './visualize/visualize.component';
import { ReportComponent } from './report/report.component';
import { SetupDataComponent } from './system-setup/setup-data/setup-data.component';
import { DayTypesComponent } from './system-setup/day-types/day-types.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [LogToolComponent, LogToolBannerComponent, SystemSetupComponent, HelpPanelComponent, VisualizeComponent, ReportComponent, SetupDataComponent, DayTypesComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [
    LogToolService
  ]
})
export class LogToolModule { }

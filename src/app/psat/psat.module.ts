import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { PopoverModule } from 'ngx-popover';
import { PumpsModule } from '../calculator/pumps/pumps.module';
import { ModalModule } from 'ng2-bootstrap';
import { IndexedDbModule } from '../indexedDb/indexedDb.module';

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

import { PsatReportComponent } from './psat-report/psat-report.component';
import { InputSummaryComponent } from './psat-report/input-summary/input-summary.component';
import { OutputSummaryComponent } from './psat-report/output-summary/output-summary.component';
import { ChartSummaryComponent } from './psat-report/chart-summary/chart-summary.component';
import { PsatChartComponent } from './psat-chart/psat-chart.component';
import { SystemBasicsHelpComponent } from './help-panel/system-basics-help/system-basics-help.component';
import { PumpFluidHelpComponent } from './help-panel/pump-fluid-help/pump-fluid-help.component';
import { MotorHelpComponent } from './help-panel/motor-help/motor-help.component';
import { FieldDataHelpComponent } from './help-panel/field-data-help/field-data-help.component';
import { ModifyConditionsHelpComponent } from './help-panel/modify-conditions-help/modify-conditions-help.component';

import { PsatService } from './psat.service';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { ModifyConditionsNotesComponent } from './modify-conditions/modify-conditions-notes/modify-conditions-notes.component';


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
    PsatReportComponent,
    InputSummaryComponent,
    OutputSummaryComponent,
    ChartSummaryComponent,
    PsatChartComponent,
    SystemBasicsHelpComponent,
    PumpFluidHelpComponent,
    MotorHelpComponent,
    FieldDataHelpComponent,
    ModifyConditionsHelpComponent,
    ModifyConditionsTabsComponent,
    ModifyConditionsNotesComponent
  ],
  exports: [

  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartsModule,
    PopoverModule,
    PumpsModule,
    ModalModule,
    IndexedDbModule
  ],
  providers: [
    PsatService
  ]
})

export class PsatModule { }

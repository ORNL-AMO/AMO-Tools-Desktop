import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';
import { HelpPanelModule } from './help-panel/help-panel.module';

import { SystemCurveModule } from '../calculator/pumps/system-curve/system-curve.module';
import { HeadToolModule } from '../calculator/pumps//head-tool/head-tool.module';
import { NemaEnergyEfficiencyModule } from '../calculator/motors/nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from '../calculator/motors/motor-performance/motor-performance.module';
import { AchievableEfficiencyModule } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from '../calculator/pumps/specific-speed/specific-speed.module';
import { PumpCurveModule } from '../calculator/pumps/pump-curve/pump-curve.module';



import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';
import { PsatTabsComponent } from './psat-tabs/psat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { PumpFluidComponent } from './pump-fluid/pump-fluid.component';
import { MotorComponent } from './motor/motor.component';
import { FieldDataComponent } from './field-data/field-data.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';

import { PsatReportComponent } from './psat-report/psat-report.component';
import { InputSummaryComponent } from './psat-report/input-summary/input-summary.component';
import { OutputSummaryComponent } from './psat-report/output-summary/output-summary.component';

import { PsatService } from './psat.service';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { SettingsModule } from '../settings/settings.module';
import { CompareService } from './compare.service';
import { PsatDiagramComponent } from './psat-diagram/psat-diagram.component';
import { ExploreOpportunitiesModule } from './explore-opportunities/explore-opportunities.module';
import { PsatSankeyComponent } from './psat-sankey/psat-sankey.component';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { PsatReportService } from './psat-report/psat-report.service';
import { PsatReportSankeyComponent } from './psat-report/psat-report-sankey/psat-report-sankey.component';
import { PsatReportGraphsComponent } from './psat-report/psat-report-graphs/psat-report-graphs.component';
import { PsatBarChartComponent } from './psat-report/psat-report-graphs/psat-bar-chart/psat-bar-chart.component';
import { PsatReportGraphsPrintComponent } from './psat-report/psat-report-graphs/psat-report-graphs-print/psat-report-graphs-print.component';
import { PsatWarningService } from './psat-warning.service';
import { PsatTabService } from './psat-tab.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { UtilitiesModule } from '../calculator/utilities/utilities.module';
import { PrintOptionsMenuModule } from '../shared/print-options-menu/print-options-menu.module';
import { FacilityInfoSummaryModule } from '../shared/facility-info-summary/facility-info-summary.module';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { PercentGraphModule } from '../shared/percent-graph/percent-graph.module';
import { PieChartModule } from '../shared/pie-chart/pie-chart.module';
import { SimpleTooltipModule } from '../shared/simple-tooltip/simple-tooltip.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';

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
    PsatReportComponent,
    InputSummaryComponent,
    OutputSummaryComponent,
    ModifyConditionsTabsComponent,
    PsatDiagramComponent,
    PsatSankeyComponent,
    ModificationListComponent,
    AddModificationComponent,
    PsatReportSankeyComponent,
    PsatReportGraphsComponent,
    PsatBarChartComponent,
    PsatReportGraphsPrintComponent,
  ],
  exports: [
    PsatReportComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ModalModule.forRoot(),
    SettingsModule,
    HelpPanelModule,
    SystemCurveModule,
    SpecificSpeedModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    HeadToolModule,
    AchievableEfficiencyModule, 
    PumpCurveModule,
    ExploreOpportunitiesModule,
    UtilitiesModule,
    PrintOptionsMenuModule,
    FacilityInfoSummaryModule,
    OperatingHoursModalModule,
    PercentGraphModule,
    PieChartModule,
    SimpleTooltipModule,
    TabsTooltipModule
  ],
  providers: [
    PsatService,
    CompareService,
    PsatReportService,
    PsatWarningService,
    PsatTabService,
    PumpFluidService,
    MotorService,
    FieldDataService
  ]
})

export class PsatModule { }

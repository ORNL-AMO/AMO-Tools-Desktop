import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { HeadToolModule } from '../calculator/pumps//head-tool/head-tool.module';
import { NemaEnergyEfficiencyModule } from '../calculator/motors/nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from '../calculator/motors/motor-performance/motor-performance.module';
import { AchievableEfficiencyModule } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from '../calculator/pumps/specific-speed/specific-speed.module';



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
import { ModificationListComponent } from './modification-list/modification-list.component';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { PsatReportSankeyComponent } from './psat-report/psat-report-sankey/psat-report-sankey.component';
import { PsatReportGraphsComponent } from './psat-report/psat-report-graphs/psat-report-graphs.component';
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
import { ToastModule } from '../shared/toast/toast.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { UnitConverterModule } from '../calculator/utilities/unit-converter/unit-converter.module';
import { SystemAndEquipmentCurveModule } from '../calculator/system-and-equipment-curve/system-and-equipment-curve.module';
import { PsatSankeyModule } from '../shared/psat-sankey/psat-sankey.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { PumpOperationsComponent } from './pump-operations/pump-operations.component';
import { PumpOperationsService } from './pump-operations/pump-operations.service';

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
    ModificationListComponent,
    AddModificationComponent,
    PsatReportSankeyComponent,
    PsatReportGraphsComponent,
    PsatReportGraphsPrintComponent,
    PumpOperationsComponent
  ],
  exports: [
    PsatReportComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    SettingsModule,
    HelpPanelModule,
    SpecificSpeedModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    HeadToolModule,
    AchievableEfficiencyModule, 
    ExploreOpportunitiesModule,
    UtilitiesModule,
    PrintOptionsMenuModule,
    FacilityInfoSummaryModule,
    OperatingHoursModalModule,
    PercentGraphModule,
    PieChartModule,
    SimpleTooltipModule,
    TabsTooltipModule,
    ToastModule,
    SharedPipesModule,
    UnitConverterModule,
    SystemAndEquipmentCurveModule,
    PsatSankeyModule,
    UpdateUnitsModalModule
  ],
  providers: [
    PsatService,
    CompareService,
    PsatWarningService,
    PsatTabService,
    PumpFluidService,
    MotorService,
    FieldDataService,
    DecimalPipe, 
    PumpOperationsService
  ]
})

export class PsatModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterComponent } from './waste-water.component';
import { WasteWaterBannerComponent } from './waste-water-banner/waste-water-banner.component';
import { RouterModule } from '@angular/router';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { WasteWaterService } from './waste-water.service';
import { HelpPanelComponent } from './results-panel/help-panel/help-panel.component';
import { ActivatedSludgeFormComponent } from './activated-sludge-form/activated-sludge-form.component';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormComponent } from './aerator-performance-form/aerator-performance-form.component';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { ResultsTableComponent } from './results-panel/results-table/results-table.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { AddModificationModalComponent } from './add-modification-modal/add-modification-modal.component';
import { ModificationListModalComponent } from './modification-list-modal/modification-list-modal.component';
import { ModalModule } from 'ngx-bootstrap';
import { ModifyConditionsTabsComponent } from './waste-water-banner/modify-conditions-tabs/modify-conditions-tabs.component';
import { CompareService } from './modify-conditions/compare.service';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { SettingsModule } from '../settings/settings.module';
import { ConvertWasteWaterService } from './convert-waste-water.service';
import { PercentGraphModule } from '../shared/percent-graph/percent-graph.module';
import { WasteWaterReportModule } from './waste-water-report/waste-water-report.module';
import { AeratorPerformanceHelpComponent } from './results-panel/help-panel/aerator-performance-help/aerator-performance-help.component';
import { ActivatedSludgeHelpComponent } from './results-panel/help-panel/activated-sludge-help/activated-sludge-help.component';
import { SystemBasicsHelpComponent } from './results-panel/help-panel/system-basics-help/system-basics-help.component';
import { WasteWaterGraphsComponent } from './waste-water-analysis/waste-water-graphs/waste-water-graphs.component';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { SetupTabsComponent } from './waste-water-banner/setup-tabs/setup-tabs.component';
import { WasteWaterAnalysisComponent } from './waste-water-analysis/waste-water-analysis.component';
import { WasteWaterCalculationsTableComponent } from './waste-water-analysis/waste-water-calculations-table/waste-water-calculations-table.component';
import { AnalysisMenuComponent } from './waste-water-banner/analysis-menu/analysis-menu.component';
import { WasteWaterAnalysisService } from './waste-water-analysis/waste-water-analysis.service';
import { SrtGraphComponent } from './waste-water-analysis/waste-water-graphs/srt-graph/srt-graph.component';
import { EnergyAnalysisComponent } from './waste-water-analysis/energy-analysis/energy-analysis.component';
import { EnergyAnalysisTableComponent } from './waste-water-analysis/energy-analysis/energy-analysis-table/energy-analysis-table.component';
import { EnergyAnalysisPieChartComponent } from './waste-water-analysis/energy-analysis/energy-analysis-pie-chart/energy-analysis-pie-chart.component';
import { EnergyAnalysisBarChartComponent } from './waste-water-analysis/energy-analysis/energy-analysis-bar-chart/energy-analysis-bar-chart.component';



@NgModule({
  declarations: [
    WasteWaterComponent,
    WasteWaterBannerComponent,
    SystemBasicsComponent,
    HelpPanelComponent,
    ActivatedSludgeFormComponent,
    AeratorPerformanceFormComponent,
    ResultsPanelComponent,
    ResultsTableComponent,
    ModifyConditionsComponent,
    ExploreOpportunitiesComponent,
    AddModificationModalComponent,
    ModificationListModalComponent,
    ModifyConditionsTabsComponent,
    AeratorPerformanceHelpComponent,
    ActivatedSludgeHelpComponent,
    SystemBasicsHelpComponent,
    WasteWaterGraphsComponent,
    SetupTabsComponent,
    WasteWaterAnalysisComponent,
    WasteWaterCalculationsTableComponent,
    AnalysisMenuComponent,
    SrtGraphComponent,
    EnergyAnalysisComponent,
    EnergyAnalysisTableComponent,
    EnergyAnalysisPieChartComponent,
    EnergyAnalysisBarChartComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ModalModule,
    FormsModule,
    SettingsModule,
    PercentGraphModule,
    WasteWaterReportModule,
    TabsTooltipModule
  ],
  providers: [
    WasteWaterService,
    ActivatedSludgeFormService,
    AeratorPerformanceFormService,
    CompareService,
    SystemBasicsService,
    ConvertWasteWaterService,
    WasteWaterAnalysisService
  ]
})
export class WasteWaterModule { }

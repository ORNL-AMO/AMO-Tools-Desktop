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
import { ModalModule } from 'ngx-bootstrap/modal';
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
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { SetupTabsComponent } from './waste-water-banner/setup-tabs/setup-tabs.component';
import { AnalysisMenuComponent } from './waste-water-banner/analysis-menu/analysis-menu.component';
import { WasteWaterAnalysisModule } from './waste-water-analysis/waste-water-analysis.module';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities/explore-opportunities-form/explore-opportunities-form.component';
import { ExploreAeratorFormComponent } from './explore-opportunities/explore-opportunities-form/explore-aerator-form/explore-aerator-form.component';
import { WasteWaterDiagramComponent } from './waste-water-diagram/waste-water-diagram.component';
import { ExploreActivatedSludgeFormComponent } from './explore-opportunities/explore-opportunities-form/explore-activated-sludge-form/explore-activated-sludge-form.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { ToastModule } from '../shared/toast/toast.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { WasteWaterOperationsComponent } from './waste-water-operations/waste-water-operations.component';
import { WasteWaterOperationsService } from './waste-water-operations/waste-water-operations.service';
import { OperationsHelpComponent } from './results-panel/help-panel/operations-help/operations-help.component';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { O2UtilizationRateModule } from '../calculator/waste-water/o2-utilization-rate/o2-utilization-rate.module';
import { StatePointAnalysisModule } from '../calculator/waste-water/state-point-analysis/state-point-analysis.module';
import { WaterReductionModule } from '../calculator/waste-water/water-reduction/water-reduction.module';
import { WasteWaterCalculatorTabsComponent } from './waste-water-banner/calculator-tabs/calculator-tabs.component';
import { WasteWaterCalculatorsComponent } from './waste-water-calculators/waste-water-calculators.component';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { Co2HelpTextModule } from '../shared/co2-help-text/co2-help-text.module';
import { ImportExportModule } from '../shared/import-export/import-export.module';

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
    SetupTabsComponent,
    AnalysisMenuComponent,
    ExploreOpportunitiesFormComponent,
    ExploreAeratorFormComponent,
    WasteWaterDiagramComponent,
    ExploreActivatedSludgeFormComponent,
    WasteWaterOperationsComponent,
    OperationsHelpComponent,
    WasteWaterCalculatorTabsComponent,
    WasteWaterCalculatorsComponent,
    WelcomeScreenComponent,
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
    WasteWaterAnalysisModule,
    TabsTooltipModule,
    SharedPipesModule,
    ToastModule,
    UpdateUnitsModalModule,
    AssessmentCo2SavingsModule,
    O2UtilizationRateModule,
    StatePointAnalysisModule,
    WaterReductionModule,
    Co2HelpTextModule,
    ImportExportModule
  ],
  providers: [
    WasteWaterService,
    ActivatedSludgeFormService,
    AeratorPerformanceFormService,
    CompareService,
    SystemBasicsService,
    ConvertWasteWaterService,
    WasteWaterOperationsService
  ]
})
export class WasteWaterModule { }

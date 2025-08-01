import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProcessCoolingAssessmentComponent } from './process-cooling-assessment/process-cooling-assessment.component';
import { Route, RouterModule } from '@angular/router';
import { ProcessCoolingAssessmentService } from './services/process-cooling-asessment.service';
import { ProcessCoolingUiService } from './services/process-cooling-ui.service';
import { ProcessCoolingBannerComponent } from './process-cooling-banner/process-cooling-banner.component';
import { AssessmentRedirectGuard } from './routing/assessment-redirect-guard';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { ChillerInventoryComponent } from './chiller-inventory/chiller-inventory.component';
import { ReportComponent } from './report/report.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { BaselineComponent } from './baseline/baseline.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { BaselineTabsComponent } from './baseline/baseline-tabs/baseline-tabs.component';
import { ExecutiveSummaryComponent } from './report/executive-summary/executive-summary.component';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { Co2HelpTextModule } from '../shared/co2-help-text/co2-help-text.module';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { PercentGraphModule } from '../shared/percent-graph/percent-graph.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { ConvertProcessCoolingService } from './services/convert-process-cooling.service';


export const ROUTE_TOKENS = {
  // Main tabs
  baseline: 'baseline',
  assessment: 'assessment',
  report: 'report',

  // Baseline sub-tabs
  assessmentSettings: 'assessment-settings',
  systemInformation: 'system-information',
  chillerInventory: 'chiller-inventory',

  // Assessment sub-tabs
  exploreOpportunities: 'explore-opportunities',
  modificationGraphs: 'modification-graphs',

  // report sub tabs
  executiveSummary: 'executive-summary',

  pumpSummary: 'pump-summary',
  towerSummary: 'tower-summary',
  graphs: 'graphs',
} as const;

const ROUTES: Route[] = [
  {
    path: '',
    component: ProcessCoolingAssessmentComponent,
    children: [
      { path: '', redirectTo: ROUTE_TOKENS.baseline, pathMatch: 'full' },
      {
        path: ROUTE_TOKENS.baseline,
        component: BaselineComponent,
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.assessmentSettings, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.assessmentSettings,
            component: SystemBasicsComponent,
          },
          {
            path: ROUTE_TOKENS.systemInformation,
            component: SystemInformationComponent,
          },
          {
            path: ROUTE_TOKENS.chillerInventory,
            component: ChillerInventoryComponent,
          },
        ]
      },
      {
        path: ROUTE_TOKENS.assessment,
        component: AssessmentComponent,
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.exploreOpportunities, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.exploreOpportunities,
            component: ExploreOpportunitiesComponent,
          },
        ]
      },
      {
        path: ROUTE_TOKENS.report,
        component: ReportComponent,
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.executiveSummary, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.executiveSummary,
            component: ExecutiveSummaryComponent,
          },
          // {
          //   path: ROUTE_TOKENS.pumpSummary,
          //   // component: PumpSummaryComponent,
          // },
          // {
          //   path: ROUTE_TOKENS.towerSummary,
          //   // component: TowerSummaryComponent,
          // },
          // {
          //   path: ROUTE_TOKENS.graphs,
          //   // component: GraphsComponent,
          // },
        ]
      }
    ]
  }
];


@NgModule({
  declarations: [
    ProcessCoolingAssessmentComponent,
    ProcessCoolingBannerComponent,
    SystemBasicsComponent,
    SystemInformationComponent,
    ChillerInventoryComponent,
    AssessmentComponent,
    ReportComponent,
    ExploreOpportunitiesComponent,
    BaselineComponent,
    ResultsPanelComponent,
    BaselineTabsComponent
  ],
  imports: [
    RouterModule.forChild(ROUTES),
    CommonModule,
    AsyncPipe,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule,
    FormsModule,
    TabsTooltipModule,
    ConfirmDeleteModalModule,
    UpdateUnitsModalModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    AssessmentCo2SavingsModule,
    Co2HelpTextModule,
    ImportExportModule,
    PercentGraphModule,
    ModalModule,
    NgbModule,
  ],
  providers: [
    ProcessCoolingAssessmentService,
    ProcessCoolingUiService,
    ConvertProcessCoolingService,
    AssessmentRedirectGuard
  ],
})
export class ProcessCoolingAssessmentModule { }

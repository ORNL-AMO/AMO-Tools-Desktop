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
import { ProcessCoolingResultsService } from './services/process-cooling-results.service';
import { SystemInformationFormService } from './system-information/system-information-form.service';
import { FormControlErrorsComponent } from '../shared/form-control-errors.component';
import { FormControlRequiredComponent } from '../shared/form-control-required.component';
import { InputUnitComponent } from '../shared/input-unit.component';
import { OperationsComponent } from './system-information/operations/operations.component';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { ProcessCoolingAssessmentResolver } from './routing/process-cooling-assessment-resolver.resolver';
import { HelpPanelComponent } from './results-panel/help-panel/help-panel.component';
import { InventoryTableComponent } from './results-panel/inventory-table/inventory-table.component';
import { SystemBasicsHelpComponent } from './results-panel/help-panel/system-basics-help/system-basics-help.component';
import { SystemInformationHelpComponent } from './results-panel/help-panel/system-information-help/system-information-help.component';
import { InventoryHelpComponent } from './results-panel/help-panel/inventory-help/inventory-help.component';
import { WaterPumpComponent } from './system-information/pump-wrapper/water-pump/water-pump.component';
import { PumpWrapperComponent } from './system-information/pump-wrapper/pump-wrapper.component';
import { WaterPumpHelpComponent } from './results-panel/help-panel/water-pump-help/water-pump-help.component';
import { OperationsHelpComponent } from './results-panel/help-panel/operations-help/operations-help.component';
import { AirCooledComponent } from './system-information/condenser-cooling-system/air-cooled/air-cooled.component';
import { WaterCooledComponent } from './system-information/condenser-cooling-system/water-cooled/water-cooled.component';
import { CondenserCoolingSystemComponent } from './system-information/condenser-cooling-system/condenser-cooling-system.component';
import { CondenserCoolingHelpComponent } from './results-panel/help-panel/condenser-cooling-help/condenser-cooling-help.component';
import { TowerComponent } from './system-information/tower/tower.component';
import { TowerHelpComponent } from './results-panel/help-panel/tower-help/tower-help.component';
import { LoadScheduleComponent } from './load-schedule/load-schedule.component';

import { ChillerLoadScheduleComponent } from './chiller-load-schedule/chiller-load-schedule.component';
import { WeatherComponent } from './weather/weather.component';
import { ChillerInventoryService } from './services/chiller-inventory.service';
import { ChillerLoadScheduleService } from './services/chiller-load-schedule.service';
import { ChillerCompressorTypePipe } from './pipes/chiller-compressor-type.pipe';
import { WEATHER_CONTEXT } from '../shared/modules/weather-data/weather-context.token';
import { ProcessCoolingWeatherContextService } from './process-cooling-weather-context.service';
import { OperatingScheduleComponent } from './operating-schedule/operating-schedule.component';
import { WeeklyOperatingScheduleComponent } from './operating-schedule/weekly-operating-schedule/weekly-operating-schedule.component';
import { MonthlyOperatingScheduleComponent } from './operating-schedule/monthly-operating-schedule/monthly-operating-schedule.component';


export const ROUTE_TOKENS = {
  // Main tabs
  baseline: 'baseline',
  assessment: 'assessment',
  report: 'report',

  // Baseline sub-tabs
  assessmentSettings: 'assessment-settings',
  systemInformation: 'system-information',
  operations: 'operations',
  weather: 'weather',
  waterPump: 'pump',
  condenserCoolingSystem: 'condenser-cooling-system',
  tower: 'tower',
  chillerInventory: 'chiller-inventory',
  loadSchedule: 'load-schedule',
  operatingSchedule: 'operating-schedule',

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
     resolve: { 
      processCoolingData: ProcessCoolingAssessmentResolver 
    },
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
            children: [
              { path: '', redirectTo: ROUTE_TOKENS.operations, pathMatch: 'full' },
              {
                path: ROUTE_TOKENS.operations,
                component: OperationsComponent,
              },
              {
                path: ROUTE_TOKENS.weather,
                children: [
                  {
                    path: '',
                    loadChildren: () => import('../shared/modules/weather-data/weather-data.module').then(m => m.WeatherDataModule)
                  }
                ]
              },
              {
                path: ROUTE_TOKENS.waterPump,
                component: PumpWrapperComponent,
              },
              {
                path: ROUTE_TOKENS.condenserCoolingSystem,
                component: CondenserCoolingSystemComponent
              },
              {
                path: ROUTE_TOKENS.tower,
                component: TowerComponent
              }
            ]
          },
          {
            path: ROUTE_TOKENS.chillerInventory,
            component: ChillerInventoryComponent,
          },
          {
            path: ROUTE_TOKENS.operatingSchedule,
            component: OperatingScheduleComponent
          },
          {
            path: ROUTE_TOKENS.loadSchedule,
            component: LoadScheduleComponent
          }
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
    OperationsComponent,
    SystemBasicsComponent,
    SystemInformationComponent,
    ChillerInventoryComponent,
    AssessmentComponent,
    ReportComponent,
    ExploreOpportunitiesComponent,
    BaselineComponent,
    ResultsPanelComponent,
    BaselineTabsComponent,
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    SystemInformationHelpComponent,
    InventoryHelpComponent,
    InventoryTableComponent,
    WaterPumpComponent,
    PumpWrapperComponent,
    WaterPumpHelpComponent,
    OperationsHelpComponent,
    ExecutiveSummaryComponent,
    AirCooledComponent,
    WaterCooledComponent,
    CondenserCoolingSystemComponent,
    CondenserCoolingHelpComponent,
    TowerComponent,
    TowerHelpComponent,
    LoadScheduleComponent,
    ChillerLoadScheduleComponent,
    WeatherComponent,
    ChillerCompressorTypePipe,
  OperatingScheduleComponent,
  WeeklyOperatingScheduleComponent,
  MonthlyOperatingScheduleComponent
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
    FormControlErrorsComponent,
    FormControlRequiredComponent,
    InputUnitComponent,
    OperatingHoursModalModule,
  ],
  providers: [
    ProcessCoolingAssessmentService,
    ProcessCoolingUiService,
    ProcessCoolingResultsService,
    SystemInformationFormService,
    ConvertProcessCoolingService,
    AssessmentRedirectGuard,
    ProcessCoolingAssessmentResolver,
    ChillerInventoryService,
    ChillerLoadScheduleService,
    { provide: WEATHER_CONTEXT, useClass: ProcessCoolingWeatherContextService }
  ]
})
export class ProcessCoolingAssessmentModule { }

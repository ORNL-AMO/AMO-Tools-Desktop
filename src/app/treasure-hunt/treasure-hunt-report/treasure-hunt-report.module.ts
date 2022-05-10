import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TreasureHuntReportComponent } from './treasure-hunt-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { OpportunitySummaryComponent } from './opportunity-summary/opportunity-summary.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { OpportunityPaybackTableComponent } from './opportunity-payback/opportunity-payback-table/opportunity-payback-table.component';
import { OpportunityPaybackComponent } from './opportunity-payback/opportunity-payback.component';
import { OpportunityPaybackDonutComponent } from './opportunity-payback/opportunity-payback-donut/opportunity-payback-donut.component';
import { OpportunityPaybackBarChartComponent } from './opportunity-payback/opportunity-payback-bar-chart/opportunity-payback-bar-chart.component';
import { OpportunityPaybackService } from './opportunity-payback.service';
import { CostPieChartComponent } from './report-graphs/cost-pie-chart/cost-pie-chart.component';
import { UtilityDonutChartComponent } from './report-graphs/utility-donut-chart/utility-donut-chart.component';
import { OpportunitySummaryService } from './opportunity-summary.service';
import { FormsModule } from '@angular/forms';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { SortSummariesPipe } from './opportunity-summary/sort-summaries.pipe';
import { PieChartModule } from '../../shared/pie-chart/pie-chart.module';
import { TreasureChestMenuModule } from '../treasure-chest/treasure-chest-menu/treasure-chest-menu.module';
import { UtilityBarChartComponent } from './executive-summary/utility-bar-chart/utility-bar-chart.component';
import { ExecutiveSummaryTableComponent } from './executive-summary/executive-summary-table/executive-summary-table.component';
import { TeamSummaryTableComponent } from './executive-summary/team-summary-table/team-summary-table.component';
import { TeamSummaryPieChartComponent } from './executive-summary/team-summary-pie-chart/team-summary-pie-chart.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { OpportunitySummaryCopyTableComponent } from './opportunity-summary/opportunity-summary-copy-table/opportunity-summary-copy-table.component';
import { EffortSavingsChartComponent } from './report-graphs/effort-savings-chart/effort-savings-chart.component';
import { SimpleTooltipModule } from '../../shared/simple-tooltip/simple-tooltip.module';
import { CarbonEmissionsSummaryTableComponent } from './executive-summary/carbon-emissions-summary-table/carbon-emissions-summary-table.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreasureHuntPptService } from './treasure-hunt-ppt.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FacilityInfoSummaryModule,
    PrintOptionsMenuModule,
    PieChartModule,
    TreasureChestMenuModule,
    ExportableResultsTableModule,
    SimpleTooltipModule,
    ModalModule
  ],
  declarations: [
    TreasureHuntReportComponent,
    ExecutiveSummaryComponent,
    OpportunitySummaryComponent,
    ReportGraphsComponent,
    OpportunityPaybackTableComponent,
    OpportunityPaybackComponent,
    OpportunityPaybackDonutComponent,
    OpportunityPaybackBarChartComponent,
    CostPieChartComponent,
    UtilityDonutChartComponent,
    SortSummariesPipe,
    UtilityBarChartComponent,
    ExecutiveSummaryTableComponent,
    TeamSummaryTableComponent,
    TeamSummaryPieChartComponent,
    OpportunitySummaryCopyTableComponent,
    EffortSavingsChartComponent,
    CarbonEmissionsSummaryTableComponent
  ],
  exports: [TreasureHuntReportComponent, CostPieChartComponent, UtilityBarChartComponent, ExecutiveSummaryTableComponent, TeamSummaryPieChartComponent, OpportunityPaybackBarChartComponent],
  providers: [OpportunityPaybackService, OpportunitySummaryService, CurrencyPipe, TreasureHuntPptService]
})
export class TreasureHuntReportModule { }

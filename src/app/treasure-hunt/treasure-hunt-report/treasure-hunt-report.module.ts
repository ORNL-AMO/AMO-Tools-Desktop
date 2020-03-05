import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CostSummaryChartComponent } from './report-graphs/cost-summary-chart/cost-summary-chart.component';
import { CostSummaryChartService } from './report-graphs/cost-summary-chart/cost-summary-chart.service';
import { OpportunitySummaryService } from './opportunity-summary.service';
import { FormsModule } from '@angular/forms';
import { FacilityInfoSummaryModule } from '../../shared/facility-info-summary/facility-info-summary.module';
import { PrintOptionsMenuModule } from '../../shared/print-options-menu/print-options-menu.module';
import { SortSummariesPipe } from './opportunity-summary/sort-summaries.pipe';
import { PieChartModule } from '../../shared/pie-chart/pie-chart.module';
import { TreasureChestMenuModule } from '../treasure-chest/treasure-chest-menu/treasure-chest-menu.module';
import { UtilityBarChartComponent } from './executive-summary/utility-bar-chart/utility-bar-chart.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FacilityInfoSummaryModule,
    PrintOptionsMenuModule,
    PieChartModule,
    TreasureChestMenuModule
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
    CostSummaryChartComponent,
    SortSummariesPipe,
    UtilityBarChartComponent
  ],
  exports: [TreasureHuntReportComponent],
  providers: [OpportunityPaybackService, OpportunitySummaryService, CostSummaryChartService]
})
export class TreasureHuntReportModule { }

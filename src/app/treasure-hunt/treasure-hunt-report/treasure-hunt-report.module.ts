import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureHuntReportComponent } from './treasure-hunt-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { OpportunitySummaryComponent } from './opportunity-summary/opportunity-summary.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { SharedModule } from '../../shared/shared.module';
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

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    FacilityInfoSummaryModule
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
    CostSummaryChartComponent
  ],
  exports: [TreasureHuntReportComponent],
  providers: [OpportunityPaybackService, OpportunitySummaryService, CostSummaryChartService]
})
export class TreasureHuntReportModule { }

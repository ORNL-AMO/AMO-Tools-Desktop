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

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [TreasureHuntReportComponent, ExecutiveSummaryComponent, OpportunitySummaryComponent, ReportGraphsComponent, OpportunityPaybackTableComponent, OpportunityPaybackComponent, OpportunityPaybackDonutComponent, OpportunityPaybackBarChartComponent],
  exports: [TreasureHuntReportComponent],
  providers: [OpportunityPaybackService]
})
export class TreasureHuntReportModule { }

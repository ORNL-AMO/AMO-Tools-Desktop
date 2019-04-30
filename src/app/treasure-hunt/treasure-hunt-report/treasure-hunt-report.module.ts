import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureHuntReportComponent } from './treasure-hunt-report.component';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import { OpportunitySummaryComponent } from './opportunity-summary/opportunity-summary.component';
import { ReportGraphsComponent } from './report-graphs/report-graphs.component';
import { SharedModule } from '../../shared/shared.module';
import { TreasureHuntService } from '../treasure-hunt.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [TreasureHuntReportComponent, ExecutiveSummaryComponent, OpportunitySummaryComponent, ReportGraphsComponent],
  exports: [TreasureHuntReportComponent]
})
export class TreasureHuntReportModule { }

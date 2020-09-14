import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchAnalysisComponent } from './batch-analysis.component';
import { BatchAnalysisTableComponent } from './batch-analysis-table/batch-analysis-table.component';
import { BatchAnalysisTablePipe } from './batch-analysis-table/batch-analysis-table.pipe';
import { BatchAnalysisBannerComponent } from './batch-analysis-banner/batch-analysis-banner.component';
import { BatchAnalysisService } from './batch-analysis.service';
import { FormsModule } from '@angular/forms';
import { BatchAnalysisGraphsComponent } from './batch-analysis-graphs/batch-analysis-graphs.component';
import { TotalMotorsBarChartComponent } from './batch-analysis-graphs/total-motors-bar-chart/total-motors-bar-chart.component';
import { EnergyCostBarChartComponent } from './batch-analysis-graphs/energy-cost-bar-chart/energy-cost-bar-chart.component';
import { EnergyCostPieChartComponent } from './batch-analysis-graphs/energy-cost-pie-chart/energy-cost-pie-chart.component';

@NgModule({
  declarations: [
    BatchAnalysisComponent,
    BatchAnalysisTableComponent,
    BatchAnalysisTablePipe,
    BatchAnalysisBannerComponent,
    BatchAnalysisGraphsComponent,
    TotalMotorsBarChartComponent,
    EnergyCostBarChartComponent,
    EnergyCostPieChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    BatchAnalysisComponent
  ],
  providers: [
    BatchAnalysisService
  ]
})
export class BatchAnalysisModule { }

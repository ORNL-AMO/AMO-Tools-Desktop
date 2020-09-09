import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchAnalysisComponent } from './batch-analysis.component';
import { BatchAnalysisTableComponent } from './batch-analysis-table/batch-analysis-table.component';
import { BatchAnalysisTablePipe } from './batch-analysis-table/batch-analysis-table.pipe';
import { BatchAnalysisBannerComponent } from './batch-analysis-banner/batch-analysis-banner.component';
import { BatchAnalysisService } from './batch-analysis.service';
import { FormsModule } from '@angular/forms';
import { BatchAnalysisGraphsComponent } from './batch-analysis-graphs/batch-analysis-graphs.component';

@NgModule({
  declarations: [
    BatchAnalysisComponent,
    BatchAnalysisTableComponent,
    BatchAnalysisTablePipe,
    BatchAnalysisBannerComponent,
    BatchAnalysisGraphsComponent
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FsatReportComponent } from './fsat-report.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { ResultsSummaryComponent } from './results-summary/results-summary.component';
import { FsatReportGraphsComponent } from './fsat-report-graphs/fsat-report-graphs.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [FsatReportComponent, InputSummaryComponent, ResultsSummaryComponent, FsatReportGraphsComponent],
  exports: [FsatReportComponent]
})
export class FsatReportModule { }

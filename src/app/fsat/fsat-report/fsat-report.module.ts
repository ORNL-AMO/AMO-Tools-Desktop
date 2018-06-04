import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatReportComponent } from './fsat-report.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { ResultsSummaryComponent } from './results-summary/results-summary.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [FsatReportComponent, InputSummaryComponent, ResultsSummaryComponent],
  exports: [FsatReportComponent]
})
export class FsatReportModule { }

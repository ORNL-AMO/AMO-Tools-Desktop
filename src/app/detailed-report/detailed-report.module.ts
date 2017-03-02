import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';

import { DetailedReportComponent } from './detailed-report.component';
import { AssessmentReportComponent } from './assessment-report/assessment-report.component';
import { DirectoryReportComponent } from './directory-report/directory-report.component';
@NgModule({
  declarations: [
      DetailedReportComponent,
      AssessmentReportComponent,
      DirectoryReportComponent
  ],
  exports: [

  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule
  ],
  providers: [
  ]
})

export class DetailedReportModule {}
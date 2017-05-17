import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';

import { DetailedReportComponent } from './detailed-report.component';
import { AssessmentReportComponent } from './assessment-report/assessment-report.component';
import { DirectoryReportComponent } from './directory-report/directory-report.component';

import { PsatModule } from '../psat/psat.module';
@NgModule({
  declarations: [
      DetailedReportComponent,
      AssessmentReportComponent,
      DirectoryReportComponent
  ],
  exports: [
    DetailedReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    PsatModule
  ],
  providers: [
  ]
})

export class DetailedReportModule {}
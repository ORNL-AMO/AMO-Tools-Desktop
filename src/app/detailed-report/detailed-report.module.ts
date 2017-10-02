import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DetailedReportComponent } from './detailed-report.component';
import { PsatModule } from '../psat/psat.module';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
      DetailedReportComponent
  ],
  exports: [
    DetailedReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    PsatModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
  ]
})

export class DetailedReportModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentIntegrationComponent } from './assessment-integration.component';
import { AssessmentIntegrationService } from './assessment-integration.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PhastReportModule } from '../../phast/phast-report/phast-report.module';
import { PsatModule } from '../../psat/psat.module';
import { FsatReportModule } from '../../fsat/fsat-report/fsat-report.module';
import { CompressedAirReportModule } from '../../compressed-air-assessment/compressed-air-report/compressed-air-report.module';



@NgModule({
  declarations: [
    AssessmentIntegrationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    PhastReportModule,
    PsatModule,
    FsatReportModule,
    CompressedAirReportModule
  ],
  providers: [
    AssessmentIntegrationService
  ],
  exports: [
    AssessmentIntegrationComponent
  ]
})
export class AssessmentIntegrationModule { }

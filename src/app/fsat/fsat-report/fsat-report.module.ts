import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatReportComponent } from './fsat-report.component';
import { InputSummaryComponent } from './input-summary/input-summary.component';
import { ResultsSummaryComponent } from './results-summary/results-summary.component';
import { SharedModule } from '../../shared/shared.module';
import { FieldDataSummaryComponent } from './input-summary/field-data-summary/field-data-summary.component';
import { FanMotorSummaryComponent } from './input-summary/fan-motor-summary/fan-motor-summary.component';
import { FanSetupSummaryComponent } from './input-summary/fan-setup-summary/fan-setup-summary.component';
import { BaseGasDensitySummaryComponent } from './input-summary/base-gas-density-summary/base-gas-density-summary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [FsatReportComponent, InputSummaryComponent, ResultsSummaryComponent, FieldDataSummaryComponent, FanMotorSummaryComponent, FanSetupSummaryComponent, BaseGasDensitySummaryComponent],
  exports: [FsatReportComponent]
})
export class FsatReportModule { }

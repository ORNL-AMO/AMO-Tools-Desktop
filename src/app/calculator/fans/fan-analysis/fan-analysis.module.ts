import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanAnalysisComponent } from './fan-analysis.component';
import { FanAnalysisBannerComponent } from './fan-analysis-banner/fan-analysis-banner.component';
import { FanAnalysisFormComponent } from './fan-analysis-form/fan-analysis-form.component';
import { FanAnalysisResultsComponent } from './fan-analysis-results/fan-analysis-results.component';
import { FanInfoFormComponent } from './fan-analysis-form/fan-info-form/fan-info-form.component';
import { PlaneDataFormComponent } from './fan-analysis-form/plane-data-form/plane-data-form.component';
import { FanShaftPowerFormComponent } from './fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.component';
import { GasDensityFormComponent } from './fan-analysis-form/gas-density-form/gas-density-form.component';
import { FanAnalysisService } from './fan-analysis.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FanInfoFormService } from './fan-analysis-form/fan-info-form/fan-info-form.service';
import { GasDensityFormService } from './fan-analysis-form/gas-density-form/gas-density-form.service';
import { FanShaftPowerFormService } from './fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';

@NgModule({
  declarations: [
    FanAnalysisComponent,
    FanAnalysisBannerComponent,
    FanAnalysisFormComponent,
    FanAnalysisResultsComponent,
    FanInfoFormComponent,
    PlaneDataFormComponent,
    FanShaftPowerFormComponent,
    GasDensityFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [FanAnalysisComponent],
  providers: [FanAnalysisService, FanInfoFormService, GasDensityFormService, FanShaftPowerFormService]
})
export class FanAnalysisModule { }

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
    CommonModule
  ],
  exports: [FanAnalysisComponent],
  providers: [FanAnalysisService]
})
export class FanAnalysisModule { }

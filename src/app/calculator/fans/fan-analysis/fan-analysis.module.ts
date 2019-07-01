import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanAnalysisComponent } from './fan-analysis.component';
import { FanAnalysisBannerComponent } from './fan-analysis-banner/fan-analysis-banner.component';
import { FanAnalysisFormComponent } from './fan-analysis-form/fan-analysis-form.component';
import { FanAnalysisResultsComponent } from './help-and-results-panel/fan-analysis-results/fan-analysis-results.component';
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
import { PlaneDataFormService } from './fan-analysis-form/plane-data-form/plane-data-form.service';
import { PlaneInfoFormComponent } from './fan-analysis-form/plane-data-form/plane-info-form/plane-info-form.component';
import { FanDataFormComponent } from './fan-analysis-form/plane-data-form/fan-data-form/fan-data-form.component';
import { PlaneThreeFormComponent } from './fan-analysis-form/plane-data-form/plane-three-form/plane-three-form.component';
import { PressureReadingsFormComponent } from './fan-analysis-form/plane-data-form/pressure-readings-form/pressure-readings-form.component';
import { HelpAndResultsPanelComponent } from './help-and-results-panel/help-and-results-panel.component';
import { PlanarResultsComponent } from './help-and-results-panel/planar-results/planar-results.component';

@NgModule({
  declarations: [
    FanAnalysisComponent,
    FanAnalysisBannerComponent,
    FanAnalysisFormComponent,
    FanAnalysisResultsComponent,
    FanInfoFormComponent,
    PlaneDataFormComponent,
    FanShaftPowerFormComponent,
    GasDensityFormComponent,
    PlaneInfoFormComponent,
    FanDataFormComponent,
    PlaneThreeFormComponent,
    PressureReadingsFormComponent,
    HelpAndResultsPanelComponent,
    PlanarResultsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [FanAnalysisComponent],
  providers: [FanAnalysisService, FanInfoFormService, GasDensityFormService, FanShaftPowerFormService, PlaneDataFormService]
})
export class FanAnalysisModule { }

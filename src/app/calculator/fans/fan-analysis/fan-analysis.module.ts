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
import { FanDiagramImageComponent } from './help-and-results-panel/fan-diagram-image/fan-diagram-image.component';
import { ConvertFanAnalysisService } from './convert-fan-analysis.service';
import { OperatingPointsHelpComponent } from './help-and-results-panel/operating-points-help/operating-points-help.component';
import { GasDensityHelpComponent } from './help-and-results-panel/operating-points-help/gas-density-help/gas-density-help.component';
import { FsatBasicsHelpComponent } from './help-and-results-panel/operating-points-help/fsat-basics-help/fsat-basics-help.component';
import { FanShaftPowerHelpComponent } from './help-and-results-panel/operating-points-help/fan-shaft-power-help/fan-shaft-power-help.component';
import { FanDataHelpComponent } from './help-and-results-panel/operating-points-help/fan-data-help/fan-data-help.component';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { GasDensityResultsModule } from '../../../shared/gas-density-results/gas-density-results.module';
import { InternalDimensionModalComponent } from './internal-dimension-modal/internal-dimension-modal.component';
import { ModalModule } from 'ngx-bootstrap';
import { TraversePlanesComponent } from './fan-analysis-form/plane-data-form/traverse-planes/traverse-planes.component';

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
    PlanarResultsComponent,
    FanDiagramImageComponent,
    OperatingPointsHelpComponent,
    GasDensityHelpComponent,
    FsatBasicsHelpComponent,
    FanShaftPowerHelpComponent,
    FanDataHelpComponent,
    InternalDimensionModalComponent,
    TraversePlanesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PercentGraphModule,
    SharedPipesModule,
    GasDensityResultsModule,
    ModalModule,
  ],
  exports: [FanAnalysisComponent, HelpAndResultsPanelComponent, PlaneDataFormComponent, FanInfoFormComponent],
  providers: [FanAnalysisService, FanInfoFormService, GasDensityFormService, FanShaftPowerFormService, PlaneDataFormService, ConvertFanAnalysisService]
})
export class FanAnalysisModule { }

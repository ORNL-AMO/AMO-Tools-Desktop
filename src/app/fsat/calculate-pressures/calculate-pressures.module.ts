import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculateOutletPressureComponent } from './calculate-outlet-pressure/calculate-outlet-pressure.component';
import { CalculateInletPressureComponent } from './calculate-inlet-pressure/calculate-inlet-pressure.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalculateInletPressureHelpComponent } from './calculate-inlet-pressure/calculate-inlet-pressure-help/calculate-inlet-pressure-help.component';
import { CalculateOutletPressureHelpComponent } from './calculate-outlet-pressure/calculate-outlet-pressure-help/calculate-outlet-pressure-help.component';
import { SharedModule } from '../../shared/shared.module';
import { CalculateFlowPressureComponent } from './calculate-flow-pressure/calculate-flow-pressure.component';
import { FanAnalysisModule } from '../../calculator/fans/fan-analysis/fan-analysis.module';
import { CalculateFlowPressureBannerComponent } from './calculate-flow-pressure/calculate-flow-pressure-banner/calculate-flow-pressure-banner.component';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FanAnalysisModule,
    SharedPipesModule
  ],
  declarations: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent,
    CalculateInletPressureHelpComponent,
    CalculateOutletPressureHelpComponent,
    CalculateFlowPressureComponent,
    CalculateFlowPressureBannerComponent
  ],
  exports: [
    CalculateInletPressureComponent,
    CalculateOutletPressureComponent,
    CalculateFlowPressureComponent
  ]
})
export class CalculatePressuresModule { }

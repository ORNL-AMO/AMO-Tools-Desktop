import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameplateDataPropertiesComponent } from './nameplate-data-properties/nameplate-data-properties.component';
import { CompressedAirMotorPropertiesComponent } from './compressed-air-motor-properties/compressed-air-motor-properties.component';
import { CompressedAirControlsPropertiesComponent } from './compressed-air-controls-properties/compressed-air-controls-properties.component';
import { DesignDetailsPropertiesComponent } from './design-details-properties/design-details-properties.component';
import { PerformancePointsPropertiesComponent } from './performance-points-properties/performance-points-properties.component';
import { CompressedAirPropertiesComponent } from './compressed-air-properties.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../../../settings/settings.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    CompressedAirPropertiesComponent,
    NameplateDataPropertiesComponent,
    CompressedAirMotorPropertiesComponent,
    CompressedAirControlsPropertiesComponent,
    DesignDetailsPropertiesComponent,
    PerformancePointsPropertiesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
  ],
  exports: [
    CompressedAirPropertiesComponent
  ]
})
export class CompressedAirPropertiesModule { }

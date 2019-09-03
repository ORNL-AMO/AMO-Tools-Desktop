import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorsService } from './calculators.service';
import { CalculatorsComponent } from './calculators.component';
import { ReplaceExistingModule } from '../../calculator/motors/replace-existing/replace-existing.module';
import { MotorDriveModule } from '../../calculator/motors/motor-drive/motor-drive.module';
import { NaturalGasReductionModule } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.module';
import { ElectricityReductionModule } from '../../calculator/utilities/electricity-reduction/electricity-reduction.module';
import { CompressedAirReductionModule } from '../../calculator/utilities/compressed-air-reduction/compressed-air-reduction.module';
import { WaterReductionModule } from '../../calculator/utilities/water-reduction/water-reduction.module';
import { CompressedAirPressureReductionModule } from '../../calculator/utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.module';
import { LightingReplacementModule } from '../../calculator/lighting/lighting-replacement/lighting-replacement.module';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    CalculatorsComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    ReplaceExistingModule,
    MotorDriveModule,
    NaturalGasReductionModule,
    ElectricityReductionModule,
    CompressedAirReductionModule,
    WaterReductionModule,
    CompressedAirPressureReductionModule,
    LightingReplacementModule
  ],
  providers: [
    CalculatorsService
  ],
  exports: [
    CalculatorsComponent
  ]
})
export class CalculatorsModule { }

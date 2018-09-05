import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirComponent } from './compressed-air.component';
import { AirVelocityModule } from './air-velocity/air-velocity.module';
import { BagMethodModule } from './bag-method/bag-method.module';
import { FlowFactorModule } from './flow-factor/flow-factor.module';
import { OperatingCostModule } from './operating-cost/operating-cost.module';
import { PipeSizingModule } from './pipe-sizing/pipe-sizing.module';
import { PneumaticAirModule } from './pneumatic-air/pneumatic-air.module';
import { ReceiverTankModule } from './receiver-tank/receiver-tank.module';
import { SystemCapacityModule } from './system-capacity/system-capacity.module';
import { CompressedAirService } from './compressed-air.service';

@NgModule({
  imports: [
    CommonModule,
    AirVelocityModule,
    BagMethodModule,
    FlowFactorModule,
    OperatingCostModule,
    PipeSizingModule,
    PneumaticAirModule,
    ReceiverTankModule,
    SystemCapacityModule
  ],
  declarations: [
    CompressedAirComponent
  ],
  exports: [
    CompressedAirComponent
  ],
  providers: [
    CompressedAirService
  ]
})
export class CompressedAirModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirVelocityModule } from './air-velocity/air-velocity.module';
import { BagMethodModule } from './bag-method/bag-method.module';
// import { FlowFactorModule } from './flow-factor/flow-factor.module';
import { OperatingCostModule } from './operating-cost/operating-cost.module';
import { PipeSizingModule } from './pipe-sizing/pipe-sizing.module';
import { PneumaticAirModule } from './pneumatic-air/pneumatic-air.module';
import { ReceiverTankModule } from './receiver-tank/receiver-tank.module';
import { SystemCapacityModule } from './system-capacity/system-capacity.module';
import { CompressedAirListComponent } from './compressed-air-list/compressed-air-list.component';
import { RouterModule } from '@angular/router';
import { AirLeakModule } from './air-leak/air-leak.module';

@NgModule({
  imports: [
    CommonModule,
    AirVelocityModule,
    BagMethodModule,
    AirLeakModule,
    // FlowFactorModule,
    OperatingCostModule,
    PipeSizingModule,
    PneumaticAirModule,
    ReceiverTankModule,
    SystemCapacityModule,
    RouterModule
  ],
  declarations: [
    CompressedAirListComponent
  ],
  exports: [
    CompressedAirListComponent
  ]
})
export class CompressedAirModule { }

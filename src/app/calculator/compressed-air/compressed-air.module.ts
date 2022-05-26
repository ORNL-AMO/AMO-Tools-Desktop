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
import { CompressedAirReductionModule } from './compressed-air-reduction/compressed-air-reduction.module';
import { CompressedAirPressureReductionModule } from './compressed-air-pressure-reduction/compressed-air-pressure-reduction.module';
import { AirFlowConversionModule } from './air-flow-conversion/air-flow-conversion.module';
import { BleedTestModule } from './bleed-test/bleed-test.module';

@NgModule({
  imports: [
    CommonModule,
    AirVelocityModule,
    AirFlowConversionModule,
    BagMethodModule,
    AirLeakModule,
    BleedTestModule,
    // FlowFactorModule,
    OperatingCostModule,
    PipeSizingModule,
    PneumaticAirModule,
    ReceiverTankModule,
    SystemCapacityModule,
    CompressedAirReductionModule,
    CompressedAirPressureReductionModule,
    RouterModule
  ],
  declarations: [
    CompressedAirListComponent,
  ],
  exports: [
    CompressedAirListComponent
  ]
})
export class CompressedAirModule { }

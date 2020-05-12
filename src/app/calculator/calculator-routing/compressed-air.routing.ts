import { Routes } from "@angular/router";
import { AirVelocityComponent } from "../compressed-air/air-velocity/air-velocity.component";
import { BagMethodComponent } from "../compressed-air/bag-method/bag-method.component";
import { OperatingCostComponent } from "../compressed-air/operating-cost/operating-cost.component";
import { PipeSizingComponent } from "../compressed-air/pipe-sizing/pipe-sizing.component";
import { PneumaticAirComponent } from "../compressed-air/pneumatic-air/pneumatic-air.component";
import { ReceiverTankComponent } from "../compressed-air/receiver-tank/receiver-tank.component";
import { SystemCapacityComponent } from "../compressed-air/system-capacity/system-capacity.component";
import { CompressedAirListComponent } from "../compressed-air/compressed-air-list/compressed-air-list.component";
import { AirLeakComponent } from "../compressed-air/air-leak/air-leak.component";

export const compressedAirRoutes: Routes = [
    {
        path: '',
        component: CompressedAirListComponent
    },
    {
        path: 'air-velocity',
        component: AirVelocityComponent
    },
    {
        path: 'bag-method',
        component: BagMethodComponent
    },
    {
        path: 'operating-cost',
        component: OperatingCostComponent
    },
    {
        path: 'pipe-sizing',
        component: PipeSizingComponent
    },
    {
        path: 'pneumatic-air',
        component: PneumaticAirComponent
    },
    {
        path: 'receiver-tank-usable-air',
        component: ReceiverTankComponent
    },
    {
        path: 'receiver-tank',
        component: ReceiverTankComponent
    },
    {
        path: 'system-capacity',
        component: SystemCapacityComponent
    },
    {
        path: 'air-leak',
        component: AirLeakComponent
    }
]
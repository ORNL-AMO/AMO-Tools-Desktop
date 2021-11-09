import { Routes } from "@angular/router";
import { MotorDriveComponent } from "../motors/motor-drive/motor-drive.component";
import { MotorPerformanceComponent } from "../motors/motor-performance/motor-performance.component";
import { NemaEnergyEfficiencyComponent } from "../motors/nema-energy-efficiency/nema-energy-efficiency.component";
import { PercentLoadEstimationComponent } from "../motors/percent-load-estimation/percent-load-estimation.component";
import { ReplaceExistingComponent } from "../motors/replace-existing/replace-existing.component";
import { MotorsListComponent } from "../motors/motors-list/motors-list.component";
import { FullLoadAmpsComponent } from "../motors/full-load-amps/full-load-amps.component";

export const motorRoutes: Routes = [
    {
        path: '',
        component: MotorsListComponent
    },
    {
        path: 'full-load-amps',
        component: FullLoadAmpsComponent
    },
    {
        path: 'motor-drive',
        component: MotorDriveComponent
    },
    {
        path: 'motor-performance',
        component: MotorPerformanceComponent
    },
    {
        path: 'nema-energy-efficiency',
        component: NemaEnergyEfficiencyComponent   
    },
    {
        path: 'percent-load-estimation',
        component: PercentLoadEstimationComponent
    },
    {
        path: 'replace-existing',
        component: ReplaceExistingComponent
    }
]
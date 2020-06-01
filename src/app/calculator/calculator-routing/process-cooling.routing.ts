import { Routes } from "@angular/router";
import { ProcessCoolingListComponent } from "../process-cooling/process-cooling-list/process-cooling-list.component";
import { CoolingTowerComponent } from "../process-cooling/cooling-tower/cooling-tower.component";

export const processCoolingRoutes: Routes = [
    {
        path: '',
        component: ProcessCoolingListComponent
    },
    {
        path: 'cooling-tower',
        component: CoolingTowerComponent
    },
]
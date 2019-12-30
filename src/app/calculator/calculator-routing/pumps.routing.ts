import { Routes } from "@angular/router";
import { AchievableEfficiencyComponent } from "../pumps/achievable-efficiency/achievable-efficiency.component";
import { HeadToolComponent } from "../pumps/head-tool/head-tool.component";
import { SpecificSpeedComponent } from "../pumps/specific-speed/specific-speed.component";
import { PumpsListComponent } from "../pumps/pumps-list/pumps-list.component";
import { SystemAndEquipmentCurveComponent } from "../system-and-equipment-curve/system-and-equipment-curve.component";

export const pumpRoutes: Routes = [
    {
        path: '',
        component: PumpsListComponent
    },
    {
        path: 'achievable-efficiency',
        component: AchievableEfficiencyComponent
    },
    {
        path: 'head-tool',
        component: HeadToolComponent
    },
    {
        path: 'specific-speed',
        component: SpecificSpeedComponent   
    },
    {
        path: 'pump-system-curve',
        component: SystemAndEquipmentCurveComponent
    },
    {
        path: 'pump-curve',
        component: SystemAndEquipmentCurveComponent
    }
]
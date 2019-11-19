import { Routes } from "@angular/router";
import { FanAnalysisComponent } from "../fans/fan-analysis/fan-analysis.component";
import { FanEfficiencyComponent } from "../fans/fan-efficiency/fan-efficiency.component";
import { FansListComponent } from "../fans/fans-list/fans-list.component";
import { SystemAndEquipmentCurveComponent } from "../system-and-equipment-curve/system-and-equipment-curve.component";

export const fanRoutes: Routes = [
    {
        path: '',
        component: FansListComponent
    },
    {
        path: 'fan-analysis',
        component: FanAnalysisComponent
    },
    {
        path: 'fan-efficiency',
        component: FanEfficiencyComponent
    },
    {
        path: 'system-curve',
        component: SystemAndEquipmentCurveComponent
    },
    {
        path: 'fan-curve',
        component: SystemAndEquipmentCurveComponent
    }
]
import { Routes } from "@angular/router";
import { FanAnalysisComponent } from "../fans/fan-analysis/fan-analysis.component";
import { FanEfficiencyComponent } from "../fans/fan-efficiency/fan-efficiency.component";
import { FansListComponent } from "../fans/fans-list/fans-list.component";

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
    //todo: fan curve, fan system curve
]
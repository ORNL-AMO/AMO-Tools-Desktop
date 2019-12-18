import { Routes } from "@angular/router";
import { SystemSetupComponent } from "./system-setup/system-setup.component";
import { ReportComponent } from "./report/report.component";
import { VisualizeComponent } from "./visualize/visualize.component";
import { SetupDataComponent } from "./system-setup/setup-data/setup-data.component";
import { DayTypesComponent } from "./system-setup/day-types/day-types.component";


export const logToolRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'system-setup'
    },
    {
        path: 'system-setup',
        component: SystemSetupComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'setup-data'
            },
            {
                path: 'setup-data',
                component: SetupDataComponent
            },
            {
                path: 'day-types',
                component: DayTypesComponent
            }
        ]
    },
    {
        path: 'visualize',
        component: VisualizeComponent
    },
    {
        path: 'report',
        component: ReportComponent
    }
]
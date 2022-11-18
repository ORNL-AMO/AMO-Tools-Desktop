import { Routes } from "@angular/router";
import { VisualizeComponent } from "./visualize/visualize.component";
import { DayTypeAnalysisComponent } from "./day-type-analysis/day-type-analysis.component";
import { DataSetupComponent } from "./data-setup/data-setup.component";
import { ImportDataComponent } from "./data-setup/import-data/import-data.component";
import { RefineDataComponent } from "./data-setup/refine-data/refine-data.component";
import { SelectDataHeaderComponent } from "./data-setup/select-data-header/select-data-header.component";
import { MapTimeDataComponent } from "./data-setup/map-time-data/map-time-data.component";


export const logToolRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'data-setup'
    },
    {
        path: 'data-setup',
        component: DataSetupComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'import-data'
            },
            {
                path: 'import-data',
                component: ImportDataComponent
            },
            {
                path: 'select-header-data',
                component: SelectDataHeaderComponent
            },
            {
                path: 'refine-data',
                component: RefineDataComponent
            },
            {
                path: 'map-time-data',
                component: MapTimeDataComponent
            },
        ]
    },
    {
        path: 'visualize',
        component: VisualizeComponent
    },
    {
        path: 'day-type-analysis',
        component: DayTypeAnalysisComponent
    }
]
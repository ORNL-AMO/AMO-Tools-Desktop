import { Routes } from "@angular/router";
import { MotorInventorySetupComponent } from "./motor-inventory-setup/motor-inventory-setup.component";
import { MotorCatalogComponent } from "./motor-catalog/motor-catalog.component";


export const motorInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'setup'
    },
    {
        path: 'setup',
        component: MotorInventorySetupComponent,
        // children: [
        //     {
        //         path: '',
        //         pathMatch: 'full',
        //         redirectTo: 'setup-data'
        //     },
        //     {
        //         path: 'setup-data',
        //         component: SetupDataComponent
        //     },
        //     {
        //         path: 'clean-data',
        //         component: CleanDataComponent
        //     }
        // ]
    },
    {
        path: 'catalog',
        component: MotorCatalogComponent
    },
    // {
    //     path: 'day-type-analysis',
    //     component: DayTypeAnalysisComponent
    // }
]
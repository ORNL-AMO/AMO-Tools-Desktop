import { Routes } from "@angular/router";
import { MotorInventorySetupComponent } from "./motor-inventory-setup/motor-inventory-setup.component";
import { MotorCatalogComponent } from "./motor-inventory-setup/motor-catalog/motor-catalog.component";
import { DepartmentSetupComponent } from "./motor-inventory-setup/department-setup/department-setup.component";
import { PlantSetupComponent } from "./motor-inventory-setup/plant-setup/plant-setup.component";
import { MotorInventorySummaryComponent } from "./motor-inventory-summary/motor-inventory-summary.component";
import { BatchAnalysisComponent } from "./batch-analysis/batch-analysis.component";

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
        //         redirectTo: 'plant-setup'
        //     },
        //     {
        //         path: 'plant-setup',
        //         component: PlantSetupComponent
        //     },
        //     {
        //         path: 'catalog',
        //         component: MotorCatalogComponent

        //     },
        //     {
        //         path: 'departments',
        //         component: DepartmentSetupComponent
        //     }
        // ]
    },
    {
        path: 'summary',
        component: MotorInventorySummaryComponent
    },
    {
        path: 'analysis',
        component: BatchAnalysisComponent
    }
]
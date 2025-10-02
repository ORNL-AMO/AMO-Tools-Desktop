import { Routes } from "@angular/router";
import { AssessessmentTabContentComponent } from "./assessessment-tab-content/assessessment-tab-content";
import { BaselineTabContentComponent } from "./baseline-tab-content/baseline-tab-content";
import { SystemBasicsComponent } from "./baseline-tab-content/system-basics/system-basics.component";
import { SystemInformationComponent } from "./baseline-tab-content/system-information/system-information.component";
import { InventorySetupComponent } from "./baseline-tab-content/inventory-setup/inventory-setup.component";
import { DayTypesSetupComponent } from "./baseline-tab-content/day-types-setup/day-types-setup.component";



export const compressedAirAssessmentRoutes: Routes = [
    {
        path: '',
        redirectTo: 'baseline',
        pathMatch: 'full'
    },
    {
        path: 'baseline',
        component: BaselineTabContentComponent,
        children: [
            {
                path: '',
                redirectTo: 'system-basics',
                pathMatch: 'full'
            },
            {
                path: 'system-basics',
                component: SystemBasicsComponent
            },
            {
                path: 'system-information',
                component: SystemInformationComponent
            },
            {
                path: 'inventory-setup',
                component: InventorySetupComponent
            },
            {
                path: 'day-types-setup',
                component: DayTypesSetupComponent
            }
        ]
    },
    {
        path: 'assessment',
        component: AssessessmentTabContentComponent
    }
]
import { Routes } from "@angular/router";
import { CompressedAirInventorySetupComponent } from "./compressed-air-inventory-setup/compressed-air-inventory-setup.component";
import { CompressedAirInventorySummaryComponent } from "./compressed-air-inventory-summary/compressed-air-inventory-summary.component";

export const compressedAirInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'setup'
    },
    {
        path: 'setup',
        component: CompressedAirInventorySetupComponent,
    },
    {
        path: 'summary',
        component: CompressedAirInventorySummaryComponent,
    }
]
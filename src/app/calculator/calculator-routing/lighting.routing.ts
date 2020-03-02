import { Routes } from "@angular/router";
import { LightingReplacementComponent } from "../lighting/lighting-replacement/lighting-replacement.component";
import { LightingListComponent } from "../lighting/lighting-list/lighting-list.component";

export const lightingRoutes: Routes = [
    {
        path: '',
        component: LightingListComponent
    },
    {
        path: 'lighting-replacement',
        component: LightingReplacementComponent
    }
]
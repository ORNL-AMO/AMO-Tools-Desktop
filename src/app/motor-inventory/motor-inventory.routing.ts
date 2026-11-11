import { Routes } from "@angular/router";
import { buildViewRoutes } from "../shared/main-tab-routing/main-tab-routing";

/** Array order is the banner chevron order. */
export const MOTOR_INVENTORY_MAIN_VIEWS = ['setup', 'summary', 'analysis'] as const;
export type MotorInventoryMainView = typeof MOTOR_INVENTORY_MAIN_VIEWS[number];

/** Componentless child routes: MotorInventoryComponent renders each tab and syncs mainTab from route data. */
export const motorInventoryRoutes: Routes = [
    ...buildViewRoutes(MOTOR_INVENTORY_MAIN_VIEWS),
    {
        path: '**',
        redirectTo: MOTOR_INVENTORY_MAIN_VIEWS[0]
    }
]

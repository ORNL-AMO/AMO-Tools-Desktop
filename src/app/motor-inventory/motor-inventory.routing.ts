import { Routes } from "@angular/router";

export interface MotorInventoryRouteData {
    mainView?: string;
}

/** Array order is the banner chevron order. */
export const MOTOR_INVENTORY_MAIN_VIEWS: Array<string> = ['setup', 'summary', 'analysis'];

/** Componentless child routes: MotorInventoryComponent renders each tab and syncs mainTab from route data. */
export const motorInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: MOTOR_INVENTORY_MAIN_VIEWS[0]
    },
    ...MOTOR_INVENTORY_MAIN_VIEWS.map(view => ({ path: view, children: [], data: { mainView: view } as MotorInventoryRouteData })),
    {
        path: '**',
        redirectTo: MOTOR_INVENTORY_MAIN_VIEWS[0]
    }
]

import { Routes } from "@angular/router";
import { buildViewRoutes } from "../shared/main-tab-routing/main-tab-routing";

/** Array order is the banner chevron order. */
export const PUMP_INVENTORY_MAIN_VIEWS: Array<string> = ['setup', 'summary'];
export const PUMP_INVENTORY_SETUP_VIEWS: Array<string> = ['plant-setup', 'department-setup', 'pump-catalog'];
export const PUMP_INVENTORY_SUMMARY_VIEWS: Array<string> = ['overview', 'graphs', 'table'];
/** Main tabs gated behind a valid inventory. */
export const PUMP_INVENTORY_SETUP_GATED_VIEWS: Array<string> = ['summary'];

export const pumpInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: PUMP_INVENTORY_MAIN_VIEWS[0]
    },
    {
        path: 'setup',
        data: { mainView: 'setup' },
        children: buildViewRoutes(PUMP_INVENTORY_SETUP_VIEWS, 'setupView')
    },
    {
        path: 'summary',
        data: { mainView: 'summary' },
        children: buildViewRoutes(PUMP_INVENTORY_SUMMARY_VIEWS, 'summaryView')
    },
    {
        path: '**',
        redirectTo: PUMP_INVENTORY_MAIN_VIEWS[0]
    }
];

import { Routes } from "@angular/router";
import { buildViewRoutes } from "../shared/main-tab-routing/main-tab-routing";

/** Array order is the banner chevron order. */
export const PUMP_INVENTORY_MAIN_VIEWS = ['setup', 'summary'] as const;
export type PumpInventoryMainView = typeof PUMP_INVENTORY_MAIN_VIEWS[number];
export const PUMP_INVENTORY_SETUP_VIEWS = ['plant-setup', 'department-setup', 'pump-catalog'] as const;
export type PumpInventorySetupView = typeof PUMP_INVENTORY_SETUP_VIEWS[number];
export const PUMP_INVENTORY_SUMMARY_VIEWS = ['overview', 'graphs', 'table'] as const;
export type PumpInventorySummaryView = typeof PUMP_INVENTORY_SUMMARY_VIEWS[number];
/** Main tabs gated behind a valid inventory. */
export const PUMP_INVENTORY_SETUP_GATED_VIEWS: ReadonlyArray<PumpInventoryMainView> = ['summary'];

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

import { Routes } from "@angular/router";
import { buildViewRoutes } from "../shared/main-tab-routing/main-tab-routing";

/** Array order is the banner chevron order. */
export const COMPRESSED_AIR_INVENTORY_MAIN_VIEWS = ['setup', 'summary'] as const;
export type CompressedAirInventoryMainView = typeof COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[number];
export const COMPRESSED_AIR_INVENTORY_SETUP_VIEWS = ['plant-setup', 'system-setup', 'compressed-air-catalog', 'end-uses'] as const;
export type CompressedAirInventorySetupView = typeof COMPRESSED_AIR_INVENTORY_SETUP_VIEWS[number];
export const COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS = ['overview', 'graphs', 'table'] as const;
export type CompressedAirInventorySummaryView = typeof COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS[number];
/** Main tabs the banner gates behind a valid inventory. */
export const COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS: ReadonlyArray<CompressedAirInventoryMainView> = ['summary'];

/** Componentless child routes: CompressedAirInventoryComponent renders each tab and syncs tab state from route data. */
export const compressedAirInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]
    },
    {
        path: 'setup',
        data: { mainView: 'setup' },
        children: buildViewRoutes(COMPRESSED_AIR_INVENTORY_SETUP_VIEWS, 'setupView')
    },
    {
        path: 'summary',
        data: { mainView: 'summary' },
        children: buildViewRoutes(COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS, 'summaryView')
    },
    {
        path: '**',
        redirectTo: COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]
    }
];

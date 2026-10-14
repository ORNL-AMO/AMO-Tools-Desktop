import { Routes } from "@angular/router";
import { buildViewRoutes } from "../shared/main-tab-routing/main-tab-routing";

/** Array order is the banner chevron order. */
export const COMPRESSED_AIR_INVENTORY_MAIN_VIEWS: Array<string> = ['setup', 'summary'];
export const COMPRESSED_AIR_INVENTORY_SETUP_VIEWS: Array<string> = ['plant-setup', 'system-setup', 'compressed-air-catalog', 'end-uses'];
export const COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS: Array<string> = ['overview', 'graphs', 'table'];
/** Main tabs the banner gates behind a valid inventory. */
export const COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS: Array<string> = ['summary'];

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

import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const WASTE_WATER_MAIN_VIEWS: Array<string> = ['baseline', 'assessment', 'analysis', 'diagram', 'report', 'calculators'];

/** Tabs the banner gates behind a valid baseline, i.e. setupDone. */
export const WASTE_WATER_SETUP_GATED_VIEWS: Array<string> = ['assessment', 'analysis', 'diagram', 'report'];

/**
 * Componentless child routes: WasteWaterComponent still renders each main tab itself and syncs mainTab from the active route's data.
 */
export const wasteWaterRoutes: Routes = buildViewRoutes(WASTE_WATER_MAIN_VIEWS);

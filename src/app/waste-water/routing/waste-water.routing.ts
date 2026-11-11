import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const WASTE_WATER_MAIN_VIEWS = ['baseline', 'assessment', 'analysis', 'diagram', 'report', 'calculators'] as const;
export type WasteWaterMainView = typeof WASTE_WATER_MAIN_VIEWS[number];

/** Tabs the banner gates behind a valid baseline, i.e. setupDone. */
export const WASTE_WATER_SETUP_GATED_VIEWS: ReadonlyArray<WasteWaterMainView> = ['assessment', 'analysis', 'diagram', 'report'];

/**
 * Componentless child routes: WasteWaterComponent still renders each main tab itself and syncs mainTab from the active route's data.
 */
export const wasteWaterRoutes: Routes = buildViewRoutes(WASTE_WATER_MAIN_VIEWS);

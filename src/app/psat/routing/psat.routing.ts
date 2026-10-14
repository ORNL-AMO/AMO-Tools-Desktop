import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const PSAT_MAIN_VIEWS: Array<string> = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'];

/** Tabs the banner gates behind setupDone. */
export const PSAT_SETUP_GATED_VIEWS: Array<string> = ['assessment', 'diagram', 'report', 'sankey'];

/**
 * Componentless child routes: PsatComponent still renders each main tab itself and syncs mainTab from the active route's data.
 */
export const psatRoutes: Routes = buildViewRoutes(PSAT_MAIN_VIEWS);

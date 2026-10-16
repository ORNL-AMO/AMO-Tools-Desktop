import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const PSAT_MAIN_VIEWS = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'] as const;
export type PsatMainView = typeof PSAT_MAIN_VIEWS[number];

/** Tabs the banner gates behind setupDone. */
export const PSAT_SETUP_GATED_VIEWS: ReadonlyArray<PsatMainView> = ['assessment', 'diagram', 'report', 'sankey'];

/**
 * Componentless child routes: PsatComponent still renders each main tab itself and syncs mainTab from the active route's data.
 */
export const psatRoutes: Routes = buildViewRoutes(PSAT_MAIN_VIEWS);

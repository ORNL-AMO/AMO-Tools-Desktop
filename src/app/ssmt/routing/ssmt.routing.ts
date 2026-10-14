import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const SSMT_MAIN_VIEWS = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'] as const;
export type SsmtMainView = typeof SSMT_MAIN_VIEWS[number];

/** Tabs the banner gates behind setupDone. */
export const SSMT_SETUP_GATED_VIEWS: ReadonlyArray<SsmtMainView> = ['assessment', 'diagram', 'report', 'sankey'];

/** Componentless child routes: SsmtComponent renders each tab and syncs mainTab from route data. */
export const ssmtRoutes: Routes = buildViewRoutes(SSMT_MAIN_VIEWS);

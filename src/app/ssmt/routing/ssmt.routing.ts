import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';

/** Array order is the banner chevron order. */
export const SSMT_MAIN_VIEWS: Array<string> = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'];

/** Tabs the banner gates behind setupDone. */
export const SSMT_SETUP_GATED_VIEWS: Array<string> = ['assessment', 'diagram', 'report', 'sankey'];

/** Componentless child routes: SsmtComponent renders each tab and syncs mainTab from route data. */
export const ssmtRoutes: Routes = buildViewRoutes(SSMT_MAIN_VIEWS);

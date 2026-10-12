import { Routes } from '@angular/router';

export interface SsmtRouteData {
  mainView?: string;
}

/** Array order is the banner chevron order. */
export const SSMT_MAIN_VIEWS: Array<string> = ['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators'];

/** Tabs the banner gates behind setupDone. */
export const SSMT_SETUP_GATED_VIEWS: Array<string> = ['assessment', 'diagram', 'report', 'sankey'];

/** Componentless child routes: SsmtComponent renders each tab and syncs mainTab from route data. */
export const ssmtRoutes: Routes = [
  { path: '', redirectTo: SSMT_MAIN_VIEWS[0], pathMatch: 'full' },
  ...SSMT_MAIN_VIEWS.map(view => ({ path: view, children: [], data: { mainView: view } as SsmtRouteData }))
];

import { Routes } from '@angular/router';

export interface WasteWaterRouteData {
  mainView?: string;
}

/**
 * Componentless child routes: WasteWaterComponent still renders each main tab itself and syncs mainTab from the active route's data.
 * Array order is the banner chevron order.
 */
export const wasteWaterRoutes: Routes = [
  {
    path: '',
    redirectTo: 'baseline',
    pathMatch: 'full'
  },
  {
    path: 'baseline',
    children: [],
    data: { mainView: 'baseline' }
  },
  {
    path: 'assessment',
    children: [],
    data: { mainView: 'assessment' }
  },
  {
    path: 'analysis',
    children: [],
    data: { mainView: 'analysis' }
  },
  {
    path: 'diagram',
    children: [],
    data: { mainView: 'diagram' }
  },
  {
    path: 'report',
    children: [],
    data: { mainView: 'report' }
  },
  {
    path: 'calculators',
    children: [],
    data: { mainView: 'calculators' }
  }
];

export const WASTE_WATER_MAIN_VIEWS: Array<string> = wasteWaterRoutes
  .filter(route => (route.data as WasteWaterRouteData)?.mainView)
  .map(route => (route.data as WasteWaterRouteData).mainView);

/**
 * Tabs the banner gates behind a valid baseline, i.e. setupDone.
 */
export const SETUP_GATED_TABS: Array<string> = ['assessment', 'analysis', 'diagram', 'report'];

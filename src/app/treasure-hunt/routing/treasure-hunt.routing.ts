import { Routes } from '@angular/router';
import { openCalculatorGuard } from './open-calculator.guard';

export interface TreasureHuntRouteData {
  mainView?: string;
}

/** Array order is the banner chevron order. */
export const TREASURE_HUNT_MAIN_VIEWS: Array<string> = ['baseline', 'find-treasure', 'treasure-chest', 'report'];

/** Tabs the banner gates behind setupDone. */
export const TREASURE_HUNT_SETUP_GATED_VIEWS: Array<string> = ['find-treasure', 'treasure-chest', 'report'];

/** Componentless child routes: TreasureHuntComponent renders each tab and syncs mainTab from route data. */
export const treasureHuntRoutes: Routes = [
  { path: '', redirectTo: TREASURE_HUNT_MAIN_VIEWS[0], pathMatch: 'full' },
  ...TREASURE_HUNT_MAIN_VIEWS.map(view => ({ path: view, children: [], data: { mainView: view } as TreasureHuntRouteData, canDeactivate: [openCalculatorGuard] }))
];

import { Routes } from '@angular/router';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';
import { openCalculatorGuard } from './open-calculator.guard';

/** Array order is the banner chevron order. */
export const TREASURE_HUNT_MAIN_VIEWS = ['baseline', 'find-treasure', 'treasure-chest', 'report'] as const;
export type TreasureHuntMainView = typeof TREASURE_HUNT_MAIN_VIEWS[number];

/** Tabs the banner gates behind setupDone. */
export const TREASURE_HUNT_SETUP_GATED_VIEWS: ReadonlyArray<TreasureHuntMainView> = ['find-treasure', 'treasure-chest', 'report'];

/** Componentless child routes: TreasureHuntComponent renders each tab and syncs mainTab from route data. */
export const treasureHuntRoutes: Routes = buildViewRoutes(TREASURE_HUNT_MAIN_VIEWS, 'mainView', { canDeactivate: [openCalculatorGuard] });

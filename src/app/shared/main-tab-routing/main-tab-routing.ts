import { ActivatedRouteSnapshot, Route, Routes } from '@angular/router';

/**
 * Shared helpers for routing assessment and inventory main tabs through the URL.
 * Declare each module's view list `as const` and derive its union type with `typeof LIST[number]`, so the list and the type cannot drift apart.
 * See docs/architecture/main-tab-routing.md for the pattern and the checklist for new modules.
 */

export interface MainTabRouteData<TMain extends string = string, TSetup extends string = string, TSummary extends string = string> {
  mainView?: TMain;
  setupView?: TSetup;
  summaryView?: TSummary;
}

/**
 * Builds an empty-path redirect to the first view plus one componentless child route per view.
 * @param views Route paths in banner order
 * @param dataKey Route data key that carries the view name
 * @param extra Properties added to every view route, e.g. `canDeactivate`
 * @returns Routes ready to use as a `children` array or to spread into a module's routes
 */
export function buildViewRoutes(views: ReadonlyArray<string>, dataKey: keyof MainTabRouteData = 'mainView', extra: Partial<Route> = {}): Routes {
  return [
    { path: '', pathMatch: 'full', redirectTo: views[0] },
    ...views.map(view => ({ path: view, children: [], data: { [dataKey]: view }, ...extra }))
  ];
}

/**
 * Merges route data from the snapshot down the `firstChild` chain, so nested routes (e.g. `setup/plant-setup`) are read together.
 * @param snapshot Snapshot to start from
 * @template TMain Main view union of the calling module. Route data is untyped, so this is the one place it is asserted.
 * @template TSetup Setup view union, for modules with nested setup routes
 * @template TSummary Summary view union, for modules with nested summary routes
 * @returns Merged data; deeper routes override shallower ones
 */
export function getMergedRouteData<TMain extends string = string, TSetup extends string = string, TSummary extends string = string>(snapshot: ActivatedRouteSnapshot): MainTabRouteData<TMain, TSetup, TSummary> {
  let routeData: MainTabRouteData<TMain, TSetup, TSummary> = {};
  while (snapshot) {
    routeData = { ...routeData, ...snapshot.data };
    snapshot = snapshot.firstChild;
  }
  return routeData;
}

/**
 * Resolves the target of a next/back step.
 * @param views Views in banner (chevron) order
 * @param current Currently selected view
 * @param offset Steps from the current view, e.g. 1 for next and -1 for back
 * @returns The view `offset` steps away, or undefined when the current view is not in the list or the offset runs past either end
 */
export function getSteppedView<T extends string>(views: ReadonlyArray<T>, current: string, offset: number): T | undefined {
  const index = views.findIndex(view => view === current);
  return index === -1 ? undefined : views[index + offset];
}

/**
 * @param gatedViews Views blocked until setup is complete
 * @param view View being opened
 * @param setupDone Whether setup is complete
 * @returns True when the view may be opened
 */
export function isMainTabAllowed<T extends string>(gatedViews: ReadonlyArray<T>, view: T, setupDone: boolean): boolean {
  return !gatedViews.includes(view) || setupDone;
}

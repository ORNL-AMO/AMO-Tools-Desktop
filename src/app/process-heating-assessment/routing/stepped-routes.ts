import { InjectionToken } from '@angular/core';
import { Route } from '@angular/router';

export interface SteppedRoute {
  view: string;
  path: string;
}

export interface ProcessHeatingRouteData {
  mainView?: string;
  childView?: string;
  lossSubView?: string;
  stepIndex?: number;
}

export const STEPPED_ROUTES = new InjectionToken<SteppedRoute[]>('PROCESS_HEATING_STEPPED_ROUTES');

/**
 * Derives the module's linear prev/next step order from its `Route[]` tree instead of a second,
 * hand-synced literal: walks the tree, collecting one entry per node with a `data.stepIndex`,
 * ordered by that index. A node's own accumulated path is used as-is — a step whose node has a
 * `redirectTo` child (e.g. `assessment`) relies on the router resolving that on navigation, same as
 * `report` already did, rather than this pre-resolving the leaf path.
 */
export function deriveSteppedRoutes(routes: Route[]): SteppedRoute[] {
  const entries: (SteppedRoute & { stepIndex: number })[] = [];

  const walk = (nodes: Route[], parentPath: string): void => {
    for (const route of nodes) {
      /** Empty-path nodes are the root route or a `redirectTo` marker; neither adds a URL segment. */
      const path = route.path ? (parentPath ? `${parentPath}/${route.path}` : route.path) : parentPath;
      const data = route.data as ProcessHeatingRouteData | undefined;
      if (data?.stepIndex !== undefined) {
        const view = data.mainView ?? data.childView ?? data.lossSubView;
        if (view !== undefined) {
          entries.push({ view, path, stepIndex: data.stepIndex });
        }
      }
      if (route.children) {
        walk(route.children, path);
      }
    }
  };

  walk(routes, '');
  return entries
    .sort((a, b) => a.stepIndex - b.stepIndex)
    .map(({ view, path }) => ({ view, path }));
}

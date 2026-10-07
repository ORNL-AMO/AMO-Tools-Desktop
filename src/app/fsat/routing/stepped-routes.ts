import { InjectionToken } from '@angular/core';
import { Route } from '@angular/router';

export interface FsatRouteData {
  mainView?: string;
  stepIndex?: number;
}

export interface SteppedRoute {
  view: string;
  path: string;
}

export const STEPPED_ROUTES = new InjectionToken<SteppedRoute[]>('FSAT_STEPPED_ROUTES');

export function deriveSteppedRoutes(routes: Route[]): SteppedRoute[] {
  return routes
    .filter(route => (route.data as FsatRouteData)?.stepIndex !== undefined)
    .sort((a, b) => (a.data as FsatRouteData).stepIndex - (b.data as FsatRouteData).stepIndex)
    .map(route => ({ view: (route.data as FsatRouteData).mainView, path: route.path }));
}

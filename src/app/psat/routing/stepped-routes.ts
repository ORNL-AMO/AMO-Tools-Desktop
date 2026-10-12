import { InjectionToken } from '@angular/core';
import { Route } from '@angular/router';

export interface PsatRouteData {
  mainView?: string;
  stepIndex?: number;
}

export interface SteppedRoute {
  view: string;
  path: string;
}

export const PSAT_STEPPED_ROUTES = new InjectionToken<SteppedRoute[]>('PSAT_STEPPED_ROUTES');

export function deriveSteppedRoutes(routes: Route[]): SteppedRoute[] {
  return routes
    .filter(route => (route.data as PsatRouteData)?.stepIndex !== undefined)
    .sort((a, b) => (a.data as PsatRouteData).stepIndex - (b.data as PsatRouteData).stepIndex)
    .map(route => ({ view: (route.data as PsatRouteData).mainView, path: route.path }));
}

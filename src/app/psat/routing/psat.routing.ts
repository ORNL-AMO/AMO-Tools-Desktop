import { Routes } from '@angular/router';

/**
 * Componentless child routes: PsatComponent still renders each main tab itself and syncs mainTab from the active route's data.
 */
export const psatRoutes: Routes = [
  {
    path: '',
    redirectTo: 'baseline',
    pathMatch: 'full'
  },
  {
    path: 'baseline',
    children: [],
    data: { mainView: 'baseline', stepIndex: 0 }
  },
  {
    path: 'assessment',
    children: [],
    data: { mainView: 'assessment', stepIndex: 1 }
  },
  {
    path: 'diagram',
    children: [],
    data: { mainView: 'diagram', stepIndex: 2 }
  },
  {
    path: 'report',
    children: [],
    data: { mainView: 'report', stepIndex: 3 }
  },
  {
    path: 'sankey',
    children: [],
    data: { mainView: 'sankey', stepIndex: 4 }
  },
  {
    path: 'calculators',
    children: [],
    data: { mainView: 'calculators', stepIndex: 5 }
  }
];

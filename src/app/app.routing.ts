import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { CoreComponent } from './core/core.component';
import { coreRoutes } from './core/core.routing';

const appRoutes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: coreRoutes
  }
];

export const appRoutingProviders: any[] = [
];
const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload',
  scrollPositionRestoration: 'enabled',
};
export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(appRoutes, routerOptions);

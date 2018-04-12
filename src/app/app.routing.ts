import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { CoreComponent } from './core/core.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PhastComponent } from './phast/phast.component';
import { PsatComponent } from './psat/psat.component';
import { coreRoutes } from './core/core.routing';

const appRoutes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: coreRoutes
  }
]

export const appRoutingProviders: any[] = [
]

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

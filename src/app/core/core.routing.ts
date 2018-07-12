import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { CalculatorComponent } from '../calculator/calculator.component';
import { FsatComponent } from '../fsat/fsat.component';

export const coreRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'phast/:id',
    component: PhastComponent
  },
  {
    path: 'psat/:id',
    component: PsatComponent
  }, 
  {
    path: 'fsat/:id',
    component: FsatComponent
  }
]

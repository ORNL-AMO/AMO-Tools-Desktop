import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { FsatComponent } from '../fsat/fsat.component';
import { SsmtComponent } from '../ssmt/ssmt.component';

export const coreRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    redirectTo: ''
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
  },
  {
    path: 'ssmt/:id',
    component: SsmtComponent
  }
]

import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { CalculatorComponent } from '../calculator/calculator.component';
import { DetailedReportComponent } from '../detailed-report/detailed-report.component';

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
    path: 'phast',
    component: PhastComponent
  },
  {
    path: 'psat',
    component: PsatComponent
  },
  {
    path: 'detailed-report',
    component: DetailedReportComponent
  }
]

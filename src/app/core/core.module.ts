import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssessmentModule } from '../assessment/assessment.module';
import { PhastModule } from '../phast/phast.module';
import { PsatModule } from '../psat/psat.module';
import { CalculatorModule } from '../calculator/calculator.module';
import { CoreComponent } from './core.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssessmentModule,
    PsatModule,
    PhastModule,
    CalculatorModule
  ],
  providers: []
})

export class CoreModule {};

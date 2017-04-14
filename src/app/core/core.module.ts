import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { AssessmentModule } from '../assessment/assessment.module';
import { PhastModule } from '../phast/phast.module';
import { PsatModule } from '../psat/psat.module';
import { CalculatorModule } from '../calculator/calculator.module';
import { DetailedReportModule } from '../detailed-report/detailed-report.module';
import { ModalModule } from 'ng2-bootstrap';
import { autoUpdater } from 'electron-updater';

import { CoreComponent } from './core.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AssessmentService } from '../assessment/assessment.service';

@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssessmentModule,
    PsatModule,
    PhastModule,
    CalculatorModule,
    DetailedReportModule,
    ModalModule.forRoot(),
    NgxElectronModule
  ],
  providers: [
    AssessmentService
  ]
})

export class CoreModule {};

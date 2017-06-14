import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastyModule } from 'ng2-toasty';

import { NgxElectronModule } from 'ngx-electron';
import { AssessmentModule } from '../assessment/assessment.module';
import { PhastModule } from '../phast/phast.module';
import { PsatModule } from '../psat/psat.module';
import { CalculatorModule } from '../calculator/calculator.module';
import { DetailedReportModule } from '../detailed-report/detailed-report.module';
import { ModalModule } from 'ngx-bootstrap';
import { autoUpdater } from 'electron-updater';

import { CoreComponent } from './core.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AssessmentService } from '../assessment/assessment.service';
import { AssessmentItemComponent } from '../sidebar/assessment-item/assessment-item.component';
import { DirectoryItemComponent } from '../sidebar/directory-item/directory-item.component';
import { SettingsModule } from '../settings/settings.module';
import { IndexedDbModule } from '../indexedDb/indexedDb.module';

import { JsonToCsvModule } from '../shared/json-to-csv/json-to-csv.module';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { SuiteDbModule } from '../suiteDb/suiteDb.module';


import { LandingScreenComponent } from '../landing-screen/landing-screen.component';
import { AboutPageComponent } from '../about-page/about-page.component';
import { TutorialsComponent } from '../tutorials/tutorials.component';

@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent,
    DashboardComponent,
    AssessmentItemComponent,
    DirectoryItemComponent,
    LandingScreenComponent,
    AboutPageComponent,
    TutorialsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssessmentModule,
    PsatModule,
    PhastModule,
    CalculatorModule,
    DetailedReportModule,
    ModalModule,
    NgxElectronModule,
    IndexedDbModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    ToastyModule,
    JsonToCsvModule,
    SuiteDbModule,
    ImportExportModule
  ],
  providers: [
    AssessmentService
  ]
})

export class CoreModule { };

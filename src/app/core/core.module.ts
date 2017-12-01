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
import { ContactPageComponent } from '../contact-page/contact-page.component';
import { ReportRollupModule } from '../report-rollup/report-rollup.module';

import { VersionModalComponent } from '../version-modal/version-modal.component';
import { UpdateModalComponent } from '../update-modal/update-modal.component';
import {AcknowledgmentsPageComponent} from "../acknowledgments-page/acknowledgments-page.component";

@NgModule({
  declarations: [
    CoreComponent,
    SidebarComponent,
    DashboardComponent,
    AssessmentItemComponent,
    DirectoryItemComponent,
    LandingScreenComponent,
    AboutPageComponent,
    TutorialsComponent,
    ContactPageComponent,
    AcknowledgmentsPageComponent,
    UpdateModalComponent,
    VersionModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssessmentModule,
    PsatModule,
    PhastModule,
    CalculatorModule,
    ModalModule,
    NgxElectronModule,
    IndexedDbModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    ToastyModule.forRoot(),
    JsonToCsvModule,
    SuiteDbModule,
    ImportExportModule,
    ReportRollupModule
  ],
  providers: [
    AssessmentService
  ]
})

export class CoreModule { };

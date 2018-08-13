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
import { FsatModule } from '../fsat/fsat.module';
import { AcknowledgmentsPageComponent } from "../acknowledgments-page/acknowledgments-page.component";
import { PreAssessmentModule } from '../calculator/utilities/pre-assessment/pre-assessment.module';
import { MeasurComponent } from '../landing-screen/measur/measur.component';
import { OpeningTutorialComponent } from '../tutorials/opening-tutorial/opening-tutorial.component';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DeleteDataService } from '../indexedDb/delete-data.service';
import { CoreService } from './core.service';
import { CalculatorListComponent } from '../sidebar/calculator-list/calculator-list.component';
import { PsatTutorialComponent } from '../tutorials/psat-tutorial/psat-tutorial.component';

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
    VersionModalComponent,
    MeasurComponent,
    OpeningTutorialComponent,
    CalculatorListComponent,
    PsatTutorialComponent
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
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    ToastyModule.forRoot(),
    JsonToCsvModule,
    SuiteDbModule,
    ImportExportModule,
    ReportRollupModule,
    FsatModule,
    PreAssessmentModule
  ],
  providers: [
    AssessmentService,
    CoreService,
    WindowRefService,
    IndexedDbService,
    AssessmentDbService,
    DirectoryDbService,
    SettingsDbService,
    CalculatorDbService,
    DeleteDataService
  ]
})

export class CoreModule { };

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhastModule } from '../phast/phast.module';
import { PsatModule } from '../psat/psat.module';
import { CalculatorModule } from '../calculator/calculator.module';
import { ModalModule } from 'ngx-bootstrap/modal';

import { CoreComponent } from './core.component';
import { AssessmentService } from '../dashboard/assessment.service';
import { SettingsModule } from '../settings/settings.module';

import { SuiteDbModule } from '../suiteDb/suiteDb.module';
import { ReportRollupModule } from '../report-rollup/report-rollup.module';
import { FsatModule } from '../fsat/fsat.module';
import { PreAssessmentModule } from '../calculator/utilities/pre-assessment/pre-assessment.module';
import { WindowRefService } from '../indexedDb/window-ref.service';

import { CoreService } from './core.service';
import { SsmtModule } from '../ssmt/ssmt.module';
import { TreasureHuntModule } from '../treasure-hunt/treasure-hunt.module';
import { HelperServicesModule } from '../shared/helper-services/helper-services.module';
import { TutorialsModule } from '../tutorials/tutorials.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { LogToolModule } from '../log-tool/log-tool.module';
import { MotorInventoryModule } from '../motor-inventory/motor-inventory.module';
import { WasteWaterModule } from '../waste-water/waste-water.module';
import { ToolsSuiteApiModule } from '../tools-suite-api/tools-suite-api.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { CompressedAirAssessmentModule } from '../compressed-air-assessment/compressed-air-assessment.module';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { IndexedDbModule } from '../indexedDb/indexed-db.module';
import { AnalyticsModule } from '../shared/analytics/analytics.module';
import { SecurityAndPrivacyModule } from '../shared/security-and-privacy/security-and-privacy.module';
import { BrowsingDataToastModule } from '../shared/browsing-data-toast/browsing-data-toast.module';
import { PumpInventoryModule } from '../pump-inventory/pump-inventory.module';
import { EmailMeasurDataModule } from '../shared/email-measur-data/email-measur-data.module';
import { ImportBackupModalModule } from '../shared/import-backup-modal/import-backup-modal.module';
import { SurveyToastModule } from '../shared/survey-toast/survey-toast.module';
import { MeasurSurveyModule } from '../shared/measur-survey/measur-survey.module';
import { SnackbarModule } from '../shared/snackbar-notification/snackbar.module';
import { UpdateApplicationModule } from '../shared/update-application/update-application.module';
import { SubscribeToastComponent } from '../shared/subscribe-toast/subscribe-toast.component';
import { EmailListSubscribeService } from '../shared/subscribe-toast/email-list-subscribe.service';
import { SubscribeModalComponent } from '../shared/subscribe-modal/subscribe-modal.component';

@NgModule({
  declarations: [
    CoreComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PsatModule,
    PhastModule,
    CalculatorModule,
    ModalModule,
    // NgxElectronModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    SuiteDbModule,
    ReportRollupModule,
    FsatModule,
    PreAssessmentModule,
    SsmtModule,
    TreasureHuntModule,
    HelperServicesModule,
    TutorialsModule,
    DashboardModule,
    LogToolModule,
    MotorInventoryModule,
    PumpInventoryModule,
    WasteWaterModule,
    ToolsSuiteApiModule,
    CompressedAirAssessmentModule,
    PlotlyViaWindowModule,
    IndexedDbModule,
    SecurityAndPrivacyModule,
    BrowsingDataToastModule,
    AnalyticsModule,
    EmailMeasurDataModule,
    ImportBackupModalModule,
    SurveyToastModule,
    MeasurSurveyModule,
    SnackbarModule,
    UpdateApplicationModule,
    SubscribeToastComponent,
    SubscribeModalComponent
  ],
  providers: [
    AssessmentService,
    CoreService,
    WindowRefService,
    EmailListSubscribeService
  ]
})

export class CoreModule { };

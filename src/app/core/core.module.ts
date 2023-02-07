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
 
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DeleteDataService } from '../indexedDb/delete-data.service';
import { CoreService } from './core.service';
import { SsmtModule } from '../ssmt/ssmt.module';
import { TreasureHuntModule } from '../treasure-hunt/treasure-hunt.module';
import { HelperServicesModule } from '../shared/helper-services/helper-services.module';
import { ToastModule } from '../shared/toast/toast.module';
import { TutorialsModule } from '../tutorials/tutorials.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { UpdateToastComponent } from '../update-toast/update-toast.component';
import { LogToolModule } from '../log-tool/log-tool.module';
import { MotorInventoryModule } from '../motor-inventory/motor-inventory.module';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { WasteWaterModule } from '../waste-water/waste-water.module';
import { ToolsSuiteApiModule } from '../tools-suite-api/tools-suite-api.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { CompressedAirAssessmentModule } from '../compressed-air-assessment/compressed-air-assessment.module';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { IndexedDbModule } from '../indexedDb/indexed-db.module';
import { AnalyticsModule } from '../shared/analytics/analytics.module';
import { SecurityAndPrivacyModule } from '../shared/security-and-privacy/security-and-privacy.module';
import { BrowsingDataToastModule } from '../shared/browsing-data-toast/browsing-data-toast.module';

@NgModule({
  declarations: [
    CoreComponent,
    UpdateToastComponent,
    NotFoundComponent,
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
    ToastModule,
    TutorialsModule,
    DashboardModule,
    LogToolModule,
    MotorInventoryModule,
    WasteWaterModule,
    ToolsSuiteApiModule,
    CompressedAirAssessmentModule,
    PlotlyViaWindowModule,
    IndexedDbModule,
    SecurityAndPrivacyModule,
    BrowsingDataToastModule,
    AnalyticsModule,
    SecurityAndPrivacyModule
  ],
  providers: [
    AssessmentService,
    CoreService,
    WindowRefService,
  ]
})

export class CoreModule { };

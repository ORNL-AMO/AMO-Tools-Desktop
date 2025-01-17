import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectoryDashboardComponent } from './directory-dashboard.component';
import { DirectoryDashboardMenuComponent } from './directory-dashboard-menu/directory-dashboard-menu.component';
import { RouterModule } from '@angular/router';
import { FsatSummaryCardComponent } from './directory-items/assessment-item/fsat-summary-card/fsat-summary-card.component';
import { PhastSummaryCardComponent } from './directory-items/assessment-item/phast-summary-card/phast-summary-card.component';
import { PsatSummaryCardComponent } from './directory-items/assessment-item/psat-summary-card/psat-summary-card.component';
import { SsmtSummaryCardComponent } from './directory-items/assessment-item/ssmt-summary-card/ssmt-summary-card.component';
import { TreasureHuntSummaryCardComponent } from './directory-items/assessment-item/treasure-hunt-summary-card/treasure-hunt-summary-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PsatModule } from '../../psat/psat.module';
import { FsatReportModule } from '../../fsat/fsat-report/fsat-report.module';
import { TreasureHuntReportModule } from '../../treasure-hunt/treasure-hunt-report/treasure-hunt-report.module';
import { SsmtReportModule } from '../../ssmt/ssmt-report/ssmt-report.module';
import { PhastReportModule } from '../../phast/phast-report/phast-report.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { DeleteItemsModalComponent } from './delete-items-modal/delete-items-modal.component';
import { DirectorySummaryComponent } from './directory-summary/directory-summary.component';
import { DirectoryContactInfoComponent } from './directory-contact-info/directory-contact-info.component';
import { SettingsModule } from '../../settings/settings.module';
import { PreAssessmentModalComponent } from './pre-assessment-modal/pre-assessment-modal.component';
import { PreAssessmentModule } from '../../calculator/utilities/pre-assessment/pre-assessment.module';
import { AssessmentItemComponent } from './directory-items/assessment-item/assessment-item.component';
import { DirectoryItemComponent } from './directory-items/directory-item/directory-item.component';
import { PreAssessmentItemComponent } from './directory-items/pre-assessment-item/pre-assessment-item.component';
import { AddPreAssessmentItemComponent } from './directory-items/add-pre-assessment-item/add-pre-assessment-item.component';
import { ContentControlsComponent } from './directory-dashboard-menu/content-controls/content-controls.component';
import { DashboardPipeModule } from '../dashboard-pipe/dashboard-pipe.module';
import { InventoryItemComponent } from './directory-items/inventory-item/inventory-item.component';
import { MotorInventoryCardComponent } from './directory-items/inventory-item/motor-inventory-card/motor-inventory-card.component';
import { WasteWaterSummaryCardComponent } from './directory-items/assessment-item/waste-water-summary-card/waste-water-summary-card.component';
import { WasteWaterReportModule } from '../../waste-water/waste-water-report/waste-water-report.module';
import { CompressedAirAssessmentCardComponent } from './directory-items/assessment-item/compressed-air-assessment-card/compressed-air-assessment-card.component';
import { CompressedAirReportModule } from '../../compressed-air-assessment/compressed-air-report/compressed-air-report.module';
import { PumpInventoryCardComponent } from './directory-items/inventory-item/pump-inventory-card/pump-inventory-card.component';
import { CompressedAirInventoryCardComponent } from './directory-items/inventory-item/compressed-air-inventory-card/compressed-air-inventory-card.component';

@NgModule({
  declarations: [
    DirectoryDashboardComponent,
    DirectoryDashboardMenuComponent,
    FsatSummaryCardComponent,
    PhastSummaryCardComponent,
    PsatSummaryCardComponent,
    SsmtSummaryCardComponent,
    TreasureHuntSummaryCardComponent,
    DeleteItemsModalComponent,
    DirectorySummaryComponent,
    DirectoryContactInfoComponent,
    PreAssessmentModalComponent,
    AssessmentItemComponent,
    DirectoryItemComponent,
    PreAssessmentItemComponent,
    AddPreAssessmentItemComponent,
    ContentControlsComponent,
    InventoryItemComponent,
    MotorInventoryCardComponent,
    WasteWaterSummaryCardComponent,
    CompressedAirAssessmentCardComponent,
    PumpInventoryCardComponent,
    CompressedAirInventoryCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    ModalModule,
    PsatModule,
    FsatReportModule,
    TreasureHuntReportModule,
    SsmtReportModule,
    PhastReportModule,
    SharedPipesModule,
    SettingsModule,
    PreAssessmentModule,
    DashboardPipeModule,
    WasteWaterReportModule,
    CompressedAirReportModule
  ],
  providers: [DirectoryDashboardService]
})
export class DirectoryDashboardModule { }

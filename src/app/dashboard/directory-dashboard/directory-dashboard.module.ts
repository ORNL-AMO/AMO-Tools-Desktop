import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectoryDashboardComponent } from './directory-dashboard.component';
import { DirectoryDashboardMenuComponent } from './directory-dashboard-menu/directory-dashboard-menu.component';
import { RouterModule } from '@angular/router';
import { AssessmentCardComponent } from './directory-grid-view/assessment-card/assessment-card.component';
import { DirectoryCardComponent } from './directory-grid-view/directory-card/directory-card.component';
import { FsatSummaryCardComponent } from './directory-grid-view/assessment-card/fsat-summary-card/fsat-summary-card.component';
import { PhastSummaryCardComponent } from './directory-grid-view/assessment-card/phast-summary-card/phast-summary-card.component';
import { PsatSummaryCardComponent } from './directory-grid-view/assessment-card/psat-summary-card/psat-summary-card.component';
import { SsmtSummaryCardComponent } from './directory-grid-view/assessment-card/ssmt-summary-card/ssmt-summary-card.component';
import { TreasureHuntSummaryCardComponent } from './directory-grid-view/assessment-card/treasure-hunt-summary-card/treasure-hunt-summary-card.component';
import { PreAssessmentCardComponent } from './directory-grid-view/pre-assessment-card/pre-assessment-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { PsatModule } from '../../psat/psat.module';
import { FsatReportModule } from '../../fsat/fsat-report/fsat-report.module';
import { TreasureHuntReportModule } from '../../treasure-hunt/treasure-hunt-report/treasure-hunt-report.module';
import { SsmtReportModule } from '../../ssmt/ssmt-report/ssmt-report.module';
import { PhastReportModule } from '../../phast/phast-report/phast-report.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { AssessmentListItemComponent } from './directory-list-view/assessment-list-item/assessment-list-item.component';
import { DirectoryListItemComponent } from './directory-list-view/directory-list-item/directory-list-item.component';
import { PreAssessmentListItemComponent } from './directory-list-view/pre-assessment-list-item/pre-assessment-list-item.component';
import { DeleteItemsModalComponent } from './delete-items-modal/delete-items-modal.component';
import { DirectorySummaryComponent } from './directory-summary/directory-summary.component';
import { DirectoryContactInfoComponent } from './directory-contact-info/directory-contact-info.component';
import { SettingsModule } from '../../settings/settings.module';
import { PreAssessmentModalComponent } from './pre-assessment-modal/pre-assessment-modal.component';
import { PreAssessmentModule } from '../../calculator/utilities/pre-assessment/pre-assessment.module';
import { AddPreAssessmentCardComponent } from './directory-grid-view/add-pre-assessment-card/add-pre-assessment-card.component';

@NgModule({
  declarations: [
    DirectoryDashboardComponent,
     DirectoryDashboardMenuComponent,
     AssessmentCardComponent,
     FsatSummaryCardComponent,
     PhastSummaryCardComponent,
     PsatSummaryCardComponent,
     SsmtSummaryCardComponent,
     TreasureHuntSummaryCardComponent,
     PreAssessmentCardComponent,
     DirectoryCardComponent,
     AssessmentListItemComponent,
     DirectoryListItemComponent,
     PreAssessmentListItemComponent,
     DeleteItemsModalComponent,
     DirectorySummaryComponent,
     DirectoryContactInfoComponent,
     PreAssessmentModalComponent,
     AddPreAssessmentCardComponent
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
    PreAssessmentModule
  ],
  providers: [DirectoryDashboardService]
})
export class DirectoryDashboardModule { }

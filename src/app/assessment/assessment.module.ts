import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';

import { AssessmentBannerComponent } from './assessment-banner/assessment-banner.component';
import { AssessmentMenuComponent } from './assessment-menu/assessment-menu.component';
import { AssessmentGridViewComponent } from './assessment-grid-view/assessment-grid-view.component';
import { AssessmentListViewComponent } from './assessment-list-view/assessment-list-view.component';
import { AssessmentCardComponent } from './assessment-grid-view/assessment-card/assessment-card.component';
import { DirectoryCardComponent } from './assessment-grid-view/directory-card/directory-card.component';
import { DirectoryListItemComponent } from './assessment-list-view/directory-list-item/directory-list-item.component';
import { AssessmentListItemComponent } from './assessment-list-view/assessment-list-item/assessment-list-item.component';
import { CreateFolderComponent } from './assessment-menu/create-folder/create-folder.component';
import { AssessmentCreateComponent } from './assessment-create/assessment-create.component';
import { AssessmentSettingsComponent } from './assessment-settings/assessment-settings.component';
import { SettingsModule } from '../settings/settings.module';
import { ToastyModule } from 'ng2-toasty';

import { ImportExportModule } from '../shared/import-export/import-export.module';
import { PhastSummaryCardComponent } from './assessment-grid-view/assessment-card/phast-summary-card/phast-summary-card.component';
import { PsatSummaryCardComponent } from './assessment-grid-view/assessment-card/psat-summary-card/psat-summary-card.component';
import { PhastReportModule } from '../phast/phast-report/phast-report.module';
import { PsatModule } from '../psat/psat.module';
import { FolderSummaryComponent } from './folder-summary/folder-summary.component';
import { FolderContactInfoComponent } from './folder-contact-info/folder-contact-info.component';
import { PreAssessmentCardComponent } from './assessment-grid-view/pre-assessment-card/pre-assessment-card.component';
import { AssessmentDashboardComponent } from './assessment-dashboard/assessment-dashboard.component';
import { PreAssessmentListItemComponent } from './assessment-list-view/pre-assessment-list-item/pre-assessment-list-item.component';
import { FsatSummaryCardComponent } from './assessment-grid-view/assessment-card/fsat-summary-card/fsat-summary-card.component';
import { FsatReportModule } from '../fsat/fsat-report/fsat-report.module';

@NgModule({
  declarations: [
    AssessmentBannerComponent,
    AssessmentMenuComponent,
    AssessmentGridViewComponent,
    AssessmentListViewComponent,
    AssessmentCardComponent,
    DirectoryCardComponent,
    DirectoryListItemComponent,
    AssessmentListItemComponent,
    CreateFolderComponent,
    AssessmentCreateComponent,
    AssessmentSettingsComponent,
    PhastSummaryCardComponent,
    PsatSummaryCardComponent,
    FolderSummaryComponent,
    FolderContactInfoComponent,
    PreAssessmentCardComponent,
    AssessmentDashboardComponent,
    PreAssessmentListItemComponent,
    FsatSummaryCardComponent
  ],
  exports: [
    AssessmentCreateComponent,
    AssessmentSettingsComponent,
    AssessmentDashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SettingsModule,
    ToastyModule,
    ImportExportModule,
    PhastReportModule,
    PsatModule,
    FsatReportModule
  ],
  providers: []
})

export class AssessmentModule { }

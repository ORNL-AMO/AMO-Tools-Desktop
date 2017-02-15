import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { AssessmentComponent } from './assessment.component';
import { AssessmentDashboardComponent } from './assessment-dashboard/assessment-dashboard.component';
import { AssessmentBannerComponent } from './assessment-banner/assessment-banner.component';
import { AssessmentMenuComponent } from './assessment-menu/assessment-menu.component';
import { AssessmentGridViewComponent } from './assessment-grid-view/assessment-grid-view.component';
import { AssessmentListViewComponent } from './assessment-list-view/assessment-list-view.component';
import { AssessmentCardComponent } from './assessment-grid-view/assessment-card/assessment-card.component';
import { DirectoryCardComponent } from './assessment-grid-view/directory-card/directory-card.component';

@NgModule({
  declarations: [
    AssessmentComponent,
    AssessmentDashboardComponent,
    AssessmentBannerComponent,
    AssessmentMenuComponent,
    AssessmentGridViewComponent,
    AssessmentListViewComponent,
    AssessmentCardComponent,
    DirectoryCardComponent
  ],
  exports: [
    AssessmentDashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: []
})

export class AssessmentModule { }

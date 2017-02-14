import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { AssessmentComponent } from './assessment.component';
import { AssessmentDashboardComponent } from './assessment-dashboard/assessment-dashboard.component';

@NgModule({
  declarations: [
    AssessmentComponent,
    AssessmentDashboardComponent
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

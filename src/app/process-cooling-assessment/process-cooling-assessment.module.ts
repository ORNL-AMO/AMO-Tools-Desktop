import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProcessCoolingAssessmentComponent } from './process-cooling-assessment/process-cooling-assessment.component';
import { Route, RouterModule } from '@angular/router';
import { ProcessCoolingAssessmentService } from './services/process-cooling-asessment.service';
import { ProcessCoolingUiService } from './services/process-cooling-ui.service';
import { ProcessCoolingBannerComponent } from './process-cooling-banner/process-cooling-banner.component';
import { AssessmentRedirectGuard } from './routing/assessment-redirect-guard';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { ChillerInventoryComponent } from './chiller-inventory/chiller-inventory.component';
import { ReportComponent } from './report/report.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { BaselineComponent } from './baseline/baseline.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';



export const ROUTE_TOKENS = {
  // Main tabs
  baseline: 'baseline',
  assessment: 'assessment',
  report: 'report',
  
  // Baseline sub-tabs
  assessmentBasics: 'assessment-basics',
  systemInformation: 'system-information',
  chillerInventory: 'chiller-inventory',
  
  // Assessment sub-tabs
  exploreOpportunities: 'explore-opportunities',
  
  // report sub tabs
  executiveSummary: 'executive-summary',
} as const;

const ROUTES: Route[] = [
  {
    path: '',
    component: ProcessCoolingAssessmentComponent, 
    children: [
      { path: '', redirectTo: ROUTE_TOKENS.baseline, pathMatch: 'full' },
      {
        path: ROUTE_TOKENS.baseline,
        component: BaselineComponent, 
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.assessmentBasics, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.assessmentBasics,
            component: SystemBasicsComponent,
          },
          {
            path: ROUTE_TOKENS.systemInformation,
            component: SystemInformationComponent,
          },
          {
            path: ROUTE_TOKENS.chillerInventory,
            component: ChillerInventoryComponent,
          },
        ]
      },
      {
        path: ROUTE_TOKENS.assessment,
        component: AssessmentComponent,
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.exploreOpportunities, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.exploreOpportunities,
            component: ExploreOpportunitiesComponent,
          },
        ]
      },
      {
        path: ROUTE_TOKENS.report,
        component: ReportComponent, 
        children: [
          // { path: '', redirectTo: ROUTE_TOKENS.executiveSummary, pathMatch: 'full' },
          // {
          //   path: ROUTE_TOKENS.executiveSummary,
          //   component: ExecutiveSummaryComponent,
          // },
        ]
      }
    ]
  }
];


// this.router.navigate(['../assessment'], { relativeTo: this.route });

// // Navigate within same main tab (between sub-tabs)
// this.router.navigate(['../system-information'], { relativeTo: this.route });


// export const ROUTE_TOKENS = {
//   baseline: 'baseline',
//   assessment: 'explore-opportunities',
//   report: 'report',
//   assessmentBasics: 'assessment-basics',
//   systemInformation: 'system-information',
//   chillerInventory: 'chiller-inventory',
// };

// const ROUTES: Route[] = [
//   {
//     path: '',
//     component: ProcessCoolingAssessmentComponent,
//     children: [
//       { path: '', redirectTo: ROUTE_TOKENS.assessmentBasics, pathMatch: 'full' },
//       {
//         path: ROUTE_TOKENS.assessmentBasics,
//         component: SystemBasicsComponent,
//       },
//       {
//         path: ROUTE_TOKENS.systemInformation,
//         component: SystemInformationComponent, // You'll need to create this
//       },
//       {
//         path: ROUTE_TOKENS.chillerInventory,
//         component: ChillerInventoryComponent,
//       }
//     ]
//   },
//   {
//     path: ROUTE_TOKENS.assessment,
//     component: ExploreOpportunitiesComponent,
//   },
//   {
//     path: ROUTE_TOKENS.report,
//     component: ReportComponent,
//   },
// ];


@NgModule({
  declarations: [
    ProcessCoolingAssessmentComponent,
    ProcessCoolingBannerComponent,
    SystemBasicsComponent,
    SystemInformationComponent,
    ChillerInventoryComponent,
    AssessmentComponent,
    ReportComponent,
    ExploreOpportunitiesComponent,
    BaselineComponent,
    ResultsPanelComponent
  ],
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule.forChild(ROUTES),
  ],
  providers: [
    ProcessCoolingAssessmentService,
    ProcessCoolingUiService,
    AssessmentRedirectGuard
  ],
})
export class ProcessCoolingAssessmentModule { }

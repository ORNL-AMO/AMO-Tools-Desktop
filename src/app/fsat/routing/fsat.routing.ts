import { Routes } from '@angular/router';
import { FsatBaselineComponent } from '../baseline/fsat-baseline.component';
import { FsatAssessmentComponent } from '../assessment/fsat-assessment.component';
import { FsatDiagramComponent } from '../fsat-diagram/fsat-diagram.component';
import { FsatReportComponent } from '../fsat-report/fsat-report.component';
import { FsatSankeyResultsComponent } from '../sankey/fsat-sankey-results.component';
import { FsatCalculatorsComponent } from '../calculators/fsat-calculators.component';

export const fsatRoutes: Routes = [
  {
    path: '',
    redirectTo: 'baseline',
    pathMatch: 'full'
  },
  {
    path: 'baseline',
    component: FsatBaselineComponent,
    data: { mainView: 'baseline' }
  },
  {
    path: 'assessment',
    component: FsatAssessmentComponent,
    data: { mainView: 'assessment' }
  },
  {
    path: 'diagram',
    component: FsatDiagramComponent,
    data: { mainView: 'diagram' }
  },
  {
    path: 'report',
    component: FsatReportComponent,
    data: { mainView: 'report' }
  },
  {
    path: 'sankey',
    component: FsatSankeyResultsComponent,
    data: { mainView: 'sankey' }
  },
  {
    path: 'calculators',
    component: FsatCalculatorsComponent,
    data: { mainView: 'calculators' }
  }
];

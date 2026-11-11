import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { FsatBaselineComponent } from '../baseline/fsat-baseline.component';
import { FsatAssessmentComponent } from '../assessment/fsat-assessment.component';
import { FsatDiagramComponent } from '../fsat-diagram/fsat-diagram.component';
import { FsatReportComponent } from '../fsat-report/fsat-report.component';
import { FsatSankeyResultsComponent } from '../sankey/fsat-sankey-results.component';
import { FsatCalculatorsComponent } from '../calculators/fsat-calculators.component';
import { MainTabRouteData } from '../../shared/main-tab-routing/main-tab-routing';
import { FSAT_MAIN_VIEWS } from './fsat-main-views';

const FSAT_VIEW_COMPONENTS: Record<string, Type<unknown>> = {
  baseline: FsatBaselineComponent,
  assessment: FsatAssessmentComponent,
  diagram: FsatDiagramComponent,
  report: FsatReportComponent,
  sankey: FsatSankeyResultsComponent,
  calculators: FsatCalculatorsComponent
};

/** Unlike the other modules, each FSAT tab is a routed component. */
export const fsatRoutes: Routes = [
  { path: '', redirectTo: FSAT_MAIN_VIEWS[0], pathMatch: 'full' },
  ...FSAT_MAIN_VIEWS.map(view => ({ path: view, component: FSAT_VIEW_COMPONENTS[view], data: { mainView: view } as MainTabRouteData }))
];

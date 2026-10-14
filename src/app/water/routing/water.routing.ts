import { Routes } from '@angular/router';
import { WaterProcessDiagramComponent } from '../../water-process-diagram/water-process-diagram.component';
import { diagramResolver } from '../../water-process-diagram/diagram.resolver';
import { WaterMainTabString } from '../water-assessment.service';
import { buildViewRoutes } from '../../shared/main-tab-routing/main-tab-routing';
import { WATER_MAIN_VIEWS } from './water-main-views';

export interface WaterRouteData {
  mainView?: WaterMainTabString;
}

/**
 * Componentless child routes: WaterAssessmentComponent renders baseline/report and syncs mainTab from route data.
 * The diagram renders through `diagram/:diagramId`; bare `diagram` is redirected there once the assessment's diagram is known.
 */
export const waterRoutes: Routes = [
  ...buildViewRoutes(WATER_MAIN_VIEWS.filter(view => view !== 'diagram')),
  {
    path: 'diagram/:diagramId',
    component: WaterProcessDiagramComponent,
    resolve: { diagram: diagramResolver },
    data: { integrated: true, mainView: 'diagram' } as WaterRouteData & { integrated: boolean },
  },
  { path: 'diagram', pathMatch: 'full', children: [], data: { mainView: 'diagram' } as WaterRouteData },
];

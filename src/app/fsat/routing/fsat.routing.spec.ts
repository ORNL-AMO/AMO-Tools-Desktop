import { fsatRoutes } from './fsat.routing';
import { FsatBaselineComponent } from '../baseline/fsat-baseline.component';
import { FsatAssessmentComponent } from '../assessment/fsat-assessment.component';
import { FsatDiagramComponent } from '../fsat-diagram/fsat-diagram.component';
import { FsatReportComponent } from '../fsat-report/fsat-report.component';
import { FsatSankeyResultsComponent } from '../sankey/fsat-sankey-results.component';
import { FsatCalculatorsComponent } from '../calculators/fsat-calculators.component';

describe('fsatRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = fsatRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  const cases: Array<[string, any, number]> = [
    ['baseline', FsatBaselineComponent, 0],
    ['assessment', FsatAssessmentComponent, 1],
    ['diagram', FsatDiagramComponent, 2],
    ['report', FsatReportComponent, 3],
    ['sankey', FsatSankeyResultsComponent, 4],
    ['calculators', FsatCalculatorsComponent, 5],
  ];

  cases.forEach(([path, component, stepIndex]) => {
    it(`resolves "${path}" to its component and sets data.mainView`, () => {
      const route = fsatRoutes.find(r => r.path === path);
      expect(route).toBeTruthy();
      expect(route.component).toBe(component);
      expect(route.data).toEqual({ mainView: path, stepIndex });
    });
  });
});

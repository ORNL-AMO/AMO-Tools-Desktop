import { fsatRoutes } from './fsat.routing';
import { FSAT_MAIN_VIEWS, FSAT_SETUP_GATED_VIEWS } from './fsat-main-views';
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

  const cases: Array<[string, any]> = [
    ['baseline', FsatBaselineComponent],
    ['assessment', FsatAssessmentComponent],
    ['diagram', FsatDiagramComponent],
    ['report', FsatReportComponent],
    ['sankey', FsatSankeyResultsComponent],
    ['calculators', FsatCalculatorsComponent],
  ];

  it('defines one route per main view in banner order', () => {
    const paths = fsatRoutes.filter(route => route.path !== '').map(route => route.path);
    expect(paths).toEqual(FSAT_MAIN_VIEWS);
    expect(paths).toEqual(cases.map(([path]) => path));
  });

  it('gates every main view except baseline and calculators', () => {
    expect(FSAT_SETUP_GATED_VIEWS).toEqual(FSAT_MAIN_VIEWS.filter(view => view !== 'baseline' && view !== 'calculators'));
  });

  cases.forEach(([path, component]) => {
    it(`resolves "${path}" to its component and sets data.mainView`, () => {
      const route = fsatRoutes.find(r => r.path === path);
      expect(route).toBeTruthy();
      expect(route.component).toBe(component);
      expect(route.data).toEqual({ mainView: path });
    });
  });
});

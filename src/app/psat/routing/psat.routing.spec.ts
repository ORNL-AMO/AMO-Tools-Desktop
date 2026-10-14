import { PSAT_MAIN_VIEWS, PSAT_SETUP_GATED_VIEWS, psatRoutes } from './psat.routing';

describe('psatRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = psatRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('defines one route per main view in banner order', () => {
    const paths = psatRoutes.filter(route => route.path !== '').map(route => route.path);
    expect(paths).toEqual(PSAT_MAIN_VIEWS);
    expect(paths).toEqual(['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators']);
  });

  PSAT_MAIN_VIEWS.forEach(view => {
    it(`defines "${view}" as a componentless route with data.mainView`, () => {
      const route = psatRoutes.find(r => r.path === view);
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: view });
    });
  });

  it('gates every main view except baseline and calculators', () => {
    expect(PSAT_SETUP_GATED_VIEWS).toEqual(PSAT_MAIN_VIEWS.filter(view => view !== 'baseline' && view !== 'calculators'));
  });
});

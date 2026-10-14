import { SSMT_MAIN_VIEWS, SSMT_SETUP_GATED_VIEWS, ssmtRoutes } from './ssmt.routing';

describe('ssmtRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = ssmtRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('defines one route per main view in banner order', () => {
    const paths = ssmtRoutes.filter(route => route.path !== '').map(route => route.path);
    expect(paths).toEqual(SSMT_MAIN_VIEWS);
    expect(paths).toEqual(['baseline', 'assessment', 'diagram', 'report', 'sankey', 'calculators']);
  });

  SSMT_MAIN_VIEWS.forEach(view => {
    it(`defines "${view}" as a componentless route with data.mainView`, () => {
      const route = ssmtRoutes.find(r => r.path === view);
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: view });
    });
  });

  it('gates every main view except baseline and calculators', () => {
    expect(SSMT_SETUP_GATED_VIEWS).toEqual(SSMT_MAIN_VIEWS.filter(view => view !== 'baseline' && view !== 'calculators'));
  });
});

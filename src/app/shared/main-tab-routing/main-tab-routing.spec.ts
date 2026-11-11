import { ActivatedRouteSnapshot } from '@angular/router';
import { buildViewRoutes, getSteppedView, getMergedRouteData, isMainTabAllowed } from './main-tab-routing';

const VIEWS = ['baseline', 'assessment', 'report'];

function snapshot(data: object, firstChild?: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return { data, firstChild } as ActivatedRouteSnapshot;
}

describe('main-tab-routing', () => {
  describe('buildViewRoutes', () => {
    it('redirects the empty path to the first view', () => {
      const emptyRoute = buildViewRoutes(VIEWS).find(route => route.path === '');
      expect(emptyRoute.redirectTo).toBe('baseline');
      expect(emptyRoute.pathMatch).toBe('full');
    });

    it('defines one componentless route per view in order with data.mainView', () => {
      const viewRoutes = buildViewRoutes(VIEWS).filter(route => route.path !== '');
      expect(viewRoutes.map(route => route.path)).toEqual(VIEWS);
      viewRoutes.forEach(route => {
        expect(route.component).toBeUndefined();
        expect(route.children).toEqual([]);
        expect(route.data).toEqual({ mainView: route.path });
      });
    });

    it('uses the given data key', () => {
      const route = buildViewRoutes(['overview'], 'summaryView').find(r => r.path === 'overview');
      expect(route.data).toEqual({ summaryView: 'overview' });
    });

    it('adds extra properties to every view route but not the redirect', () => {
      const guard = () => true;
      const routes = buildViewRoutes(VIEWS, 'mainView', { canDeactivate: [guard] });
      routes.filter(route => route.path !== '').forEach(route => expect(route.canDeactivate).toEqual([guard]));
      expect(routes.find(route => route.path === '').canDeactivate).toBeUndefined();
    });
  });

  describe('getMergedRouteData', () => {
    it('returns an empty object for an undefined snapshot', () => {
      expect(getMergedRouteData(undefined)).toEqual({});
    });

    it('reads data from a single snapshot', () => {
      expect(getMergedRouteData(snapshot({ mainView: 'baseline' }))).toEqual({ mainView: 'baseline' });
    });

    it('merges data down the firstChild chain', () => {
      const nested = snapshot({}, snapshot({ mainView: 'setup' }, snapshot({ setupView: 'plant-setup' })));
      expect(getMergedRouteData(nested)).toEqual({ mainView: 'setup', setupView: 'plant-setup' });
    });

    it('lets deeper routes override shallower ones', () => {
      const nested = snapshot({ mainView: 'setup' }, snapshot({ mainView: 'summary' }));
      expect(getMergedRouteData(nested).mainView).toBe('summary');
    });
  });

  describe('getSteppedView', () => {
    it('steps forward and back', () => {
      expect(getSteppedView(VIEWS, 'assessment', 1)).toBe('report');
      expect(getSteppedView(VIEWS, 'assessment', -1)).toBe('baseline');
    });

    it('returns undefined past either end', () => {
      expect(getSteppedView(VIEWS, 'report', 1)).toBeUndefined();
      expect(getSteppedView(VIEWS, 'baseline', -1)).toBeUndefined();
    });

    it('returns undefined when the current view is not in the list', () => {
      expect(getSteppedView(VIEWS, 'unknown', 1)).toBeUndefined();
      expect(getSteppedView(VIEWS, undefined, -1)).toBeUndefined();
    });
  });

  describe('isMainTabAllowed', () => {
    const gated = ['assessment', 'report'];

    it('allows views that are not gated regardless of setup', () => {
      expect(isMainTabAllowed(gated, 'baseline', false)).toBeTrue();
    });

    it('blocks gated views until setup is done', () => {
      expect(isMainTabAllowed(gated, 'report', false)).toBeFalse();
      expect(isMainTabAllowed(gated, 'report', true)).toBeTrue();
    });
  });
});

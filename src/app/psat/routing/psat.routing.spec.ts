import { psatRoutes } from './psat.routing';
import { deriveSteppedRoutes } from './stepped-routes';

describe('psatRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = psatRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  const cases: Array<[string, number]> = [
    ['baseline', 0],
    ['assessment', 1],
    ['diagram', 2],
    ['report', 3],
    ['sankey', 4],
    ['calculators', 5],
  ];

  cases.forEach(([path, stepIndex]) => {
    it(`declares "${path}" as a componentless route with data.mainView`, () => {
      const route = psatRoutes.find(r => r.path === path);
      expect(route).toBeTruthy();
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: path, stepIndex });
    });
  });

  it('derives stepped routes in banner order', () => {
    expect(deriveSteppedRoutes(psatRoutes).map(route => route.view)).toEqual(cases.map(([path]) => path));
  });
});

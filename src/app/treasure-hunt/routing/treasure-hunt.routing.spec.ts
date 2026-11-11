import { TREASURE_HUNT_MAIN_VIEWS, treasureHuntRoutes } from './treasure-hunt.routing';
import { openCalculatorGuard } from './open-calculator.guard';

describe('treasureHuntRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = treasureHuntRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('defines one route per main view in banner order', () => {
    const paths = treasureHuntRoutes.filter(route => route.path !== '').map(route => route.path);
    expect(paths).toEqual(TREASURE_HUNT_MAIN_VIEWS);
    expect(paths).toEqual(['baseline', 'find-treasure', 'treasure-chest', 'report']);
  });

  TREASURE_HUNT_MAIN_VIEWS.forEach(view => {
    it(`defines "${view}" as a componentless route with data.mainView`, () => {
      const route = treasureHuntRoutes.find(r => r.path === view);
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: view });
      expect(route.canDeactivate).toEqual([openCalculatorGuard]);
    });
  });
});

import { MOTOR_INVENTORY_MAIN_VIEWS, motorInventoryRoutes } from './motor-inventory.routing';

describe('motorInventoryRoutes', () => {
  it('redirects the empty path to setup', () => {
    const emptyRoute = motorInventoryRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('setup');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('redirects unknown paths to setup', () => {
    expect(motorInventoryRoutes.find(route => route.path === '**').redirectTo).toBe('setup');
  });

  it('defines one route per main view in banner order', () => {
    const paths = motorInventoryRoutes.filter(route => route.path !== '' && route.path !== '**').map(route => route.path);
    expect(paths).toEqual(MOTOR_INVENTORY_MAIN_VIEWS);
    expect(paths).toEqual(['setup', 'summary', 'analysis']);
  });

  MOTOR_INVENTORY_MAIN_VIEWS.forEach(view => {
    it(`defines "${view}" as a componentless route with data.mainView`, () => {
      const route = motorInventoryRoutes.find(r => r.path === view);
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: view });
    });
  });
});

import { WASTE_WATER_MAIN_VIEWS, WASTE_WATER_SETUP_GATED_VIEWS, wasteWaterRoutes } from './waste-water.routing';

describe('wasteWaterRoutes', () => {
  const mainViews: Array<string> = ['baseline', 'assessment', 'analysis', 'diagram', 'report', 'calculators'];

  it('redirects the empty path to baseline', () => {
    const emptyRoute = wasteWaterRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  mainViews.forEach(path => {
    it(`declares "${path}" as a componentless route with data.mainView`, () => {
      const route = wasteWaterRoutes.find(r => r.path === path);
      expect(route).toBeTruthy();
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: path });
    });
  });

  it('lists main views in banner order', () => {
    expect(WASTE_WATER_MAIN_VIEWS).toEqual(mainViews);
  });

  it('gates the setup-dependent main views only', () => {
    expect(WASTE_WATER_SETUP_GATED_VIEWS).toEqual(['assessment', 'analysis', 'diagram', 'report']);
  });
});

import { PUMP_INVENTORY_MAIN_VIEWS, PUMP_INVENTORY_SETUP_GATED_VIEWS, PUMP_INVENTORY_SETUP_VIEWS, PUMP_INVENTORY_SUMMARY_VIEWS, pumpInventoryRoutes } from './pump-inventory.routing';

describe('pumpInventoryRoutes', () => {
  it('redirects the empty path to setup', () => {
    const emptyRoute = pumpInventoryRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('setup');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('redirects unknown paths to setup', () => {
    expect(pumpInventoryRoutes.find(route => route.path === '**').redirectTo).toBe('setup');
  });

  ['setup', 'summary'].forEach(mainView => {
    it(`sets data.mainView on "${mainView}"`, () => {
      expect(pumpInventoryRoutes.find(route => route.path === mainView).data).toEqual({ mainView });
    });
  });

  it('redirects the main tab paths to their first sub-tab', () => {
    const setupChildren = pumpInventoryRoutes.find(route => route.path === 'setup').children;
    const summaryChildren = pumpInventoryRoutes.find(route => route.path === 'summary').children;
    expect(setupChildren.find(route => route.path === '').redirectTo).toBe('plant-setup');
    expect(summaryChildren.find(route => route.path === '').redirectTo).toBe('overview');
  });

  it('declares setup sub-tabs without pump-properties', () => {
    expect(PUMP_INVENTORY_SETUP_VIEWS).toEqual(['plant-setup', 'department-setup', 'pump-catalog']);
    const setupChildren = pumpInventoryRoutes.find(route => route.path === 'setup').children;
    expect(setupChildren.filter(route => route.path !== '').map(route => route.data.setupView)).toEqual(PUMP_INVENTORY_SETUP_VIEWS);
  });

  it('declares summary sub-tabs', () => {
    expect(PUMP_INVENTORY_SUMMARY_VIEWS).toEqual(['overview', 'graphs', 'table']);
    const summaryChildren = pumpInventoryRoutes.find(route => route.path === 'summary').children;
    expect(summaryChildren.filter(route => route.path !== '').map(route => route.data.summaryView)).toEqual(PUMP_INVENTORY_SUMMARY_VIEWS);
  });

  it('lists main views in banner order and gates summary', () => {
    expect(PUMP_INVENTORY_MAIN_VIEWS).toEqual(['setup', 'summary']);
    expect(PUMP_INVENTORY_SETUP_GATED_VIEWS).toEqual(['summary']);
  });
});

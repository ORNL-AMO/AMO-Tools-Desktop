import {
  COMPRESSED_AIR_INVENTORY_MAIN_VIEWS,
  COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS,
  COMPRESSED_AIR_INVENTORY_SETUP_VIEWS,
  COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS,
  compressedAirInventoryRoutes
} from './compressed-air-inventory.routing';

describe('compressedAirInventoryRoutes', () => {
  it('redirects the empty path to the first main view', () => {
    const emptyRoute = compressedAirInventoryRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe(COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]);
    expect(emptyRoute.pathMatch).toBe('full');
  });

  it('redirects unknown paths to the first main view', () => {
    expect(compressedAirInventoryRoutes.find(route => route.path === '**').redirectTo).toBe('setup');
  });

  it('declares one componentless route per main view with data.mainView', () => {
    COMPRESSED_AIR_INVENTORY_MAIN_VIEWS.forEach(mainView => {
      const route = compressedAirInventoryRoutes.find(r => r.path === mainView);
      expect(route.data).toEqual({ mainView });
      expect(route.component).toBeUndefined();
    });
  });

  it('gates only the summary view', () => {
    expect(COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS).toEqual(['summary']);
  });

  it('redirects the main view paths to their first sub-view', () => {
    const setupChildren = compressedAirInventoryRoutes.find(route => route.path === 'setup').children;
    const summaryChildren = compressedAirInventoryRoutes.find(route => route.path === 'summary').children;
    expect(setupChildren.find(route => route.path === '').redirectTo).toBe('plant-setup');
    expect(summaryChildren.find(route => route.path === '').redirectTo).toBe('overview');
  });

  it('declares setup sub-views in order', () => {
    expect(COMPRESSED_AIR_INVENTORY_SETUP_VIEWS).toEqual(['plant-setup', 'system-setup', 'compressed-air-catalog', 'end-uses']);
    const setupChildren = compressedAirInventoryRoutes.find(route => route.path === 'setup').children;
    expect(setupChildren.filter(route => route.path !== '').map(route => route.data.setupView)).toEqual(COMPRESSED_AIR_INVENTORY_SETUP_VIEWS);
  });

  it('declares summary sub-views in order', () => {
    expect(COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS).toEqual(['overview', 'graphs', 'table']);
    const summaryChildren = compressedAirInventoryRoutes.find(route => route.path === 'summary').children;
    expect(summaryChildren.filter(route => route.path !== '').map(route => route.data.summaryView)).toEqual(COMPRESSED_AIR_INVENTORY_SUMMARY_VIEWS);
  });
});

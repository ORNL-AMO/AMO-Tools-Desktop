import { pumpInventoryRoutes, setupTabs, summaryTabs } from './pump-inventory.routing';

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
    expect(setupTabs).toEqual(['plant-setup', 'department-setup', 'pump-catalog']);
    const setupChildren = pumpInventoryRoutes.find(route => route.path === 'setup').children;
    expect(setupChildren.filter(route => route.path !== '').map(route => route.data.setupView)).toEqual(setupTabs);
  });

  it('declares summary sub-tabs', () => {
    expect(summaryTabs).toEqual(['overview', 'graphs', 'table']);
    const summaryChildren = pumpInventoryRoutes.find(route => route.path === 'summary').children;
    expect(summaryChildren.filter(route => route.path !== '').map(route => route.data.summaryView)).toEqual(summaryTabs);
  });
});

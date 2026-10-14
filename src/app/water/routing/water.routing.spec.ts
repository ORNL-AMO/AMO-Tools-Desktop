import { diagramResolver } from '../../water-process-diagram/diagram.resolver';
import { WaterProcessDiagramComponent } from '../../water-process-diagram/water-process-diagram.component';
import { waterRoutes } from './water.routing';
import { WATER_MAIN_VIEWS } from './water-main-views';

describe('waterRoutes', () => {
  it('redirects the empty path to baseline', () => {
    const emptyRoute = waterRoutes.find(route => route.path === '');
    expect(emptyRoute.redirectTo).toBe('baseline');
    expect(emptyRoute.pathMatch).toBe('full');
  });

  ['baseline', 'report'].forEach(view => {
    it(`defines "${view}" as a componentless route with data.mainView`, () => {
      const route = waterRoutes.find(r => r.path === view);
      expect(route.component).toBeUndefined();
      expect(route.children).toEqual([]);
      expect(route.data).toEqual({ mainView: view });
    });
  });

  it('keeps the diagram/:diagramId route and marks it as the diagram main view', () => {
    const route = waterRoutes.find(r => r.path === 'diagram/:diagramId');
    expect(route.component).toBe(WaterProcessDiagramComponent);
    expect(route.resolve).toEqual({ diagram: diagramResolver });
    expect(route.data).toEqual({ integrated: true, mainView: 'diagram' });
  });

  it('defines bare diagram as a componentless full-match route', () => {
    const route = waterRoutes.find(r => r.path === 'diagram');
    expect(route.component).toBeUndefined();
    expect(route.pathMatch).toBe('full');
    expect(route.data).toEqual({ mainView: 'diagram' });
  });

  it('lists main views in banner order', () => {
    expect(WATER_MAIN_VIEWS).toEqual(['baseline', 'diagram', 'report']);
  });
});

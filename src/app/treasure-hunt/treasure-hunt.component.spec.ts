import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { TreasureHuntComponent } from './treasure-hunt.component';
import { TreasureHuntService } from './treasure-hunt.service';
import { Assessment } from '../shared/models/assessment';
import { TreasureHunt } from '../shared/models/treasure-hunt';

describe('TreasureHuntComponent syncMainTabFromRoute', () => {
  let component: TreasureHuntComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let mainTab: BehaviorSubject<string>;
  let activatedRoute: { firstChild: { snapshot: { data: { mainView?: string } } } };

  function setAssessment(setupDone: boolean) {
    component.assessment = { id: 9, type: 'TreasureHunt', treasureHunt: { setupDone } as TreasureHunt } as Assessment;
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mainTab = new BehaviorSubject<string>('baseline');
    activatedRoute = { firstChild: { snapshot: { data: {} } } };
    // syncMainTabFromRoute only uses Router, ActivatedRoute and TreasureHuntService; the rest are never touched.
    const unused = {} as never;
    component = new TreasureHuntComponent(
      unused, routerSpy, activatedRoute as unknown as ActivatedRoute, unused, unused,
      { mainTab } as unknown as TreasureHuntService, unused, unused, unused, unused, unused, unused
    );
  });

  it('pushes the route main view into mainTab', () => {
    setAssessment(true);
    activatedRoute.firstChild.snapshot.data = { mainView: 'report' };
    component.syncMainTabFromRoute();
    expect(mainTab.value).toBe('report');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  ['find-treasure', 'treasure-chest', 'report'].forEach(view => {
    it(`redirects ${view} to baseline when setup is not done`, () => {
      setAssessment(false);
      activatedRoute.firstChild.snapshot.data = { mainView: view };
      component.syncMainTabFromRoute();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/treasure-hunt', 9, 'baseline'], { replaceUrl: true });
      expect(mainTab.value).toBe('baseline');
    });
  });

  it('allows baseline when setup is not done', () => {
    setAssessment(false);
    activatedRoute.firstChild.snapshot.data = { mainView: 'baseline' };
    component.syncMainTabFromRoute();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(mainTab.value).toBe('baseline');
  });

  it('does nothing without a child route or assessment', () => {
    setAssessment(true);
    activatedRoute.firstChild = undefined;
    component.syncMainTabFromRoute();
    expect(mainTab.value).toBe('baseline');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

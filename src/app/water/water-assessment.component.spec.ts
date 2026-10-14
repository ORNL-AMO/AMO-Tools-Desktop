import { ActivatedRoute, Router } from '@angular/router';

import { WaterAssessmentComponent } from './water-assessment.component';
import { WaterAssessmentService } from './water-assessment.service';
import { Assessment } from '../shared/models/assessment';

describe('WaterAssessmentComponent syncMainTabFromRoute', () => {
  let component: WaterAssessmentComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let waterAssessmentService: { mainTab: { next: jasmine.Spy, getValue: jasmine.Spy } };
  let activatedRoute: { firstChild: { snapshot: { data: { mainView?: string }, paramMap: { has: (name: string) => boolean } } } };

  function setRoute(mainView: string, hasDiagramId: boolean = false) {
    activatedRoute.firstChild = { snapshot: { data: { mainView }, paramMap: { has: () => hasDiagramId } } };
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    waterAssessmentService = { mainTab: jasmine.createSpyObj('mainTab', ['next', 'getValue']) };
    activatedRoute = { firstChild: undefined };
    // syncMainTabFromRoute only uses Router, ActivatedRoute and WaterAssessmentService; the rest are never touched.
    const unused = {} as never;
    component = new WaterAssessmentComponent(
      activatedRoute as unknown as ActivatedRoute, routerSpy, unused, unused, unused, unused, unused, unused,
      waterAssessmentService as unknown as WaterAssessmentService, unused, unused
    );
    component.assessment = { id: 9, type: 'Water', diagramId: 4 } as Assessment;
    component.isInitialized = true;
  });

  ['baseline', 'report'].forEach(view => {
    it(`pushes ${view} into mainTab`, () => {
      setRoute(view);
      component.syncMainTabFromRoute();
      expect(waterAssessmentService.mainTab.next).toHaveBeenCalledWith(view);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  it('pushes diagram into mainTab when the diagram param is present', () => {
    setRoute('diagram', true);
    component.syncMainTabFromRoute();
    expect(waterAssessmentService.mainTab.next).toHaveBeenCalledWith('diagram');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('redirects bare diagram to diagram/:diagramId', () => {
    setRoute('diagram', false);
    component.syncMainTabFromRoute();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['diagram', 4], { relativeTo: activatedRoute as unknown as ActivatedRoute, replaceUrl: true });
    expect(waterAssessmentService.mainTab.next).not.toHaveBeenCalled();
  });

  it('pushes the route main view before initialization completes', () => {
    component.isInitialized = false;
    setRoute('report');
    component.syncMainTabFromRoute();
    expect(waterAssessmentService.mainTab.next).toHaveBeenCalledWith('report');
  });

  it('waits for initialization before redirecting bare diagram', () => {
    component.isInitialized = false;
    setRoute('diagram', false);
    component.syncMainTabFromRoute();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(waterAssessmentService.mainTab.next).not.toHaveBeenCalled();
  });

  it('does not re-emit when mainTab already matches the route', () => {
    waterAssessmentService.mainTab.getValue.and.returnValue('diagram');
    setRoute('diagram', true);
    component.syncMainTabFromRoute();
    expect(waterAssessmentService.mainTab.next).not.toHaveBeenCalled();
  });

  it('does nothing without a child route', () => {
    component.syncMainTabFromRoute();
    expect(waterAssessmentService.mainTab.next).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

describe('WaterAssessmentComponent initAssessment with overlapping inits', () => {
  it('lets a superseded init return before marking initialization or redirecting', async () => {
    const assessments: { [id: number]: Assessment } = {
      1: { id: 1, type: 'Water', diagramId: 11, water: {} } as Assessment,
      2: { id: 2, type: 'Water', diagramId: 22, water: {} } as Assessment,
    };
    let releaseFirstSync: () => void;
    const firstSync = new Promise<void>(resolve => releaseFirstSync = resolve);
    const updateAssessmentFromDiagramService = {
      syncAssessmentToDiagram: (assessment: Assessment) => assessment.id === 1 ? firstSync : Promise.resolve()
    };
    const assessmentDbService = { findById: (id: number) => assessments[id] };
    const settingsDbService = { getByAssessmentId: () => ({}) };
    const waterAssessmentService = {
      settings: { next: () => {} },
      setAssessment: () => {},
      updateWaterAssessment: () => {},
      mainTab: { getValue: () => 'baseline', next: () => {} },
    };
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRoute = { firstChild: { snapshot: { data: { mainView: 'diagram' }, paramMap: { has: () => false } } } };
    const unused = {} as never;
    const component = new WaterAssessmentComponent(
      activatedRoute as unknown as ActivatedRoute, routerSpy, unused, updateAssessmentFromDiagramService as never,
      assessmentDbService as never, unused, unused, settingsDbService as never,
      waterAssessmentService as unknown as WaterAssessmentService, unused, unused
    );

    const firstInit = component.initAssessment(1);
    await component.initAssessment(2);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);

    releaseFirstSync();
    await firstInit;
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate.calls.mostRecent().args[0]).toEqual(['diagram', 22]);
  });
});

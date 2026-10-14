import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';

import { WaterAssessmentService } from './water-assessment.service';
import { WaterSystemComponentService } from './water-system-component.service';
import { UpdateDiagramFromAssessmentService } from '../water-process-diagram/update-diagram-from-assessment.service';
import { waterRoutes } from './routing/water.routing';
import { Assessment } from '../shared/models/assessment';

describe('WaterAssessmentService main tab navigation', () => {
  let service: WaterAssessmentService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        WaterAssessmentService,
        { provide: Router, useValue: routerSpy },
        { provide: WaterSystemComponentService, useValue: {} },
        { provide: UpdateDiagramFromAssessmentService, useValue: {} },
      ],
    });
    service = TestBed.inject(WaterAssessmentService);
  });

  describe('goToMainTab', () => {
    it('navigates to the main tab route for the assessment', () => {
      service.assessmentId = 7;
      service.goToMainTab('report');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/water', 7, 'report']);
    });

    it('navigates to the diagram route with the diagram id when known', () => {
      service.assessmentId = 7;
      service.setAssessment({ id: 7, diagramId: 12 } as Assessment);
      service.goToMainTab('diagram');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/water', 7, 'diagram', 12]);
    });

    it('navigates to bare diagram when the diagram id is not known yet', () => {
      service.assessmentId = 7;
      service.goToMainTab('diagram');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/water', 7, 'diagram']);
    });

    it('does nothing without an assessment id', () => {
      service.goToMainTab('report');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('does not change mainTab directly', () => {
      service.assessmentId = 7;
      service.goToMainTab('report');
      expect(service.mainTab.value).toBe('baseline');
    });
  });

  describe('continueSetupTab / backSetupTab', () => {
    it('steps through the setup tabs on baseline', () => {
      service.mainTab.next('baseline');
      service.setupTab.next('water-intake');
      service.continueSetupTab();
      expect(service.setupTab.getValue()).toBe('water-discharge');
      service.backSetupTab();
      expect(service.setupTab.getValue()).toBe('water-intake');
    });

    it('does not step past either end', () => {
      service.mainTab.next('baseline');
      service.setupTab.next('system-basics');
      service.backSetupTab();
      expect(service.setupTab.getValue()).toBe('system-basics');
      service.setupTab.next('waste-water-treatment');
      service.continueSetupTab();
      expect(service.setupTab.getValue()).toBe('waste-water-treatment');
    });
  });

  describe('continueMainTab / backMainTab', () => {
    beforeEach(() => {
      service.assessmentId = 7;
    });

    it('continue navigates to the next view', () => {
      service.mainTab.next('baseline');
      service.continueMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/water', 7, 'diagram']);
    });

    it('back navigates to the previous view', () => {
      service.mainTab.next('report');
      service.backMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/water', 7, 'diagram']);
    });

    it('continue does nothing at the last view', () => {
      service.mainTab.next('report');
      service.continueMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('back does nothing at the first view', () => {
      service.mainTab.next('baseline');
      service.backMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });
});

@Component({ template: '', standalone: true })
class WaterStubComponent {}

describe('WaterAssessmentService with the real router', () => {
  let service: WaterAssessmentService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WaterAssessmentService,
        { provide: WaterSystemComponentService, useValue: {} },
        { provide: UpdateDiagramFromAssessmentService, useValue: {} },
        provideRouter([{
          path: 'water/:id',
          component: WaterStubComponent,
          children: [
            ...waterRoutes.filter(route => route.path !== 'diagram/:diagramId'),
            { path: 'diagram/:diagramId', component: WaterStubComponent, data: { mainView: 'diagram' } }
          ]
        }]),
        provideLocationMocks()
      ]
    });
    service = TestBed.inject(WaterAssessmentService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    service.assessmentId = 5;
  });

  const urlsAfterRedirects: [string, string][] = [
    ['/water/5', '/water/5/baseline'],
    ['/water/5/baseline', '/water/5/baseline'],
    ['/water/5/diagram', '/water/5/diagram'],
    ['/water/5/diagram/12', '/water/5/diagram/12'],
    ['/water/5/report', '/water/5/report']
  ];
  urlsAfterRedirects.forEach(([url, expectedUrl]) => {
    it(`resolves ${url} to ${expectedUrl}`, async () => {
      await router.navigateByUrl(url);
      expect(router.url).toBe(expectedUrl);
    });
  });

  ['/water/5/baseline', '/water/5/report', '/water/5/diagram', '/water/5/diagram/12'].forEach(url => {
    it(`exposes the main view in route data for ${url}`, async () => {
      await router.navigateByUrl(url);
      const expected = url.split('/')[3];
      expect(router.routerState.snapshot.root.firstChild.firstChild.data['mainView']).toBe(expected);
    });
  });

  it('navigates to the main tab route with goToMainTab', async () => {
    await router.navigateByUrl('/water/5/baseline');
    service.goToMainTab('report');
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/water/5/report');
  });

  it('moves between main tabs with browser back and forward', async () => {
    router.initialNavigation();
    await router.navigateByUrl('/water/5/baseline');
    await router.navigateByUrl('/water/5/report');
    location.back();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/water/5/baseline');
    location.forward();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/water/5/report');
  });
});

import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { TreasureHuntService } from './treasure-hunt.service';
import { treasureHuntRoutes } from './routing/treasure-hunt.routing';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SettingsService } from '../settings/settings.service';
import { CalculatorsService } from './calculators/calculators.service';
import { SnackbarService } from '../shared/snackbar-notification/snackbar.service';

describe('TreasureHuntService main tab navigation', () => {
  let service: TreasureHuntService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        TreasureHuntService,
        { provide: Router, useValue: routerSpy },
        { provide: SettingsDbService, useValue: {} },
        { provide: SettingsService, useValue: {} },
      ],
    });
    service = TestBed.inject(TreasureHuntService);
  });

  describe('goToMainTab', () => {
    it('navigates to the main tab route for the assessment', () => {
      service.assessmentId = 7;
      service.goToMainTab('report');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/treasure-hunt', 7, 'report']);
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

  describe('continueMainTab / backMainTab', () => {
    beforeEach(() => {
      service.assessmentId = 7;
    });

    it('continue navigates to the next view', () => {
      service.mainTab.next('find-treasure');
      service.continueMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/treasure-hunt', 7, 'treasure-chest']);
    });

    it('back navigates to the previous view', () => {
      service.mainTab.next('report');
      service.backMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/treasure-hunt', 7, 'treasure-chest']);
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
class TreasureHuntStubComponent {}

describe('TreasureHuntService with the real router', () => {
  let service: TreasureHuntService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TreasureHuntService,
        { provide: SettingsDbService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: CalculatorsService, useValue: { selectedCalc: new BehaviorSubject<string>('none') } },
        { provide: SnackbarService, useValue: {} },
        provideRouter([{ path: 'treasure-hunt/:id', component: TreasureHuntStubComponent, children: treasureHuntRoutes }]),
        provideLocationMocks()
      ]
    });
    service = TestBed.inject(TreasureHuntService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    service.assessmentId = 5;
  });

  const urlsAfterRedirects: [string, string][] = [
    ['/treasure-hunt/5', '/treasure-hunt/5/baseline'],
    ['/treasure-hunt/5/baseline', '/treasure-hunt/5/baseline'],
    ['/treasure-hunt/5/find-treasure', '/treasure-hunt/5/find-treasure'],
    ['/treasure-hunt/5/treasure-chest', '/treasure-hunt/5/treasure-chest'],
    ['/treasure-hunt/5/report', '/treasure-hunt/5/report']
  ];
  urlsAfterRedirects.forEach(([url, expectedUrl]) => {
    it(`resolves ${url} to ${expectedUrl}`, async () => {
      await router.navigateByUrl(url);
      expect(router.url).toBe(expectedUrl);
    });
  });

  it('exposes the main view in route data', async () => {
    await router.navigateByUrl('/treasure-hunt/5/report');
    expect(router.routerState.snapshot.root.firstChild.firstChild.data).toEqual({ mainView: 'report' });
  });

  it('navigates to the main tab route with goToMainTab', async () => {
    await router.navigateByUrl('/treasure-hunt/5/baseline');
    service.goToMainTab('report');
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/report');
  });

  it('steps through the main tabs with continueMainTab and backMainTab', async () => {
    await router.navigateByUrl('/treasure-hunt/5/find-treasure');
    service.mainTab.next('find-treasure');
    service.continueMainTab();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/treasure-chest');
    service.mainTab.next('treasure-chest');
    service.backMainTab();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/find-treasure');
  });

  it('moves between main tabs with browser back and forward', async () => {
    router.initialNavigation();
    await router.navigateByUrl('/treasure-hunt/5/baseline');
    await router.navigateByUrl('/treasure-hunt/5/report');
    location.back();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/baseline');
    location.forward();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/treasure-hunt/5/report');
  });
});

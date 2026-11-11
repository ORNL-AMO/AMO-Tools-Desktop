import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { MotorInventoryService } from './motor-inventory.service';
import { motorInventoryRoutes } from './motor-inventory.routing';

function snapshotFor(...dataChain: object[]): ActivatedRouteSnapshot {
  let child: ActivatedRouteSnapshot = undefined;
  [...dataChain].reverse().forEach(data => {
    child = { data, firstChild: child } as ActivatedRouteSnapshot;
  });
  return child;
}

describe('MotorInventoryService routing', () => {
  let service: MotorInventoryService;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        MotorInventoryService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(MotorInventoryService);
    service.currentInventoryId = 5;
  });

  it('syncs the main tab from route data found down the child chain', () => {
    service.syncMainTabFromRoute(snapshotFor({}, { mainView: 'analysis' }));
    expect(service.mainTab.getValue()).toBe('analysis');
  });

  it('leaves the main tab alone when no route data has a main view', () => {
    service.mainTab.next('summary');
    service.syncMainTabFromRoute(snapshotFor({}, {}));
    expect(service.mainTab.getValue()).toBe('summary');
  });

  it('navigates to the main tab route for the current inventory', () => {
    service.goToMainTab('summary');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'summary']);
  });

  it('steps forward and back through the main tabs', () => {
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'summary']);
    service.mainTab.next('summary');
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'analysis']);
    service.backMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/motor-inventory', 5, 'setup']);
  });

  it('does not navigate past the first or last main tab', () => {
    service.backMainTab();
    service.mainTab.next('analysis');
    service.continueMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

@Component({ template: '', standalone: true })
class MotorInventoryStubComponent {}

describe('MotorInventoryService with the real router', () => {
  let service: MotorInventoryService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MotorInventoryService,
        provideRouter([{ path: 'motor-inventory/:id', component: MotorInventoryStubComponent, children: motorInventoryRoutes }]),
        provideLocationMocks()
      ]
    });
    service = TestBed.inject(MotorInventoryService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    service.currentInventoryId = 5;
  });

  const urlsAfterRedirects: [string, string][] = [
    ['/motor-inventory/5', '/motor-inventory/5/setup'],
    ['/motor-inventory/5/setup', '/motor-inventory/5/setup'],
    ['/motor-inventory/5/summary', '/motor-inventory/5/summary'],
    ['/motor-inventory/5/analysis', '/motor-inventory/5/analysis'],
    ['/motor-inventory/5/unknown', '/motor-inventory/5/setup']
  ];
  urlsAfterRedirects.forEach(([url, expectedUrl]) => {
    it(`resolves ${url} to ${expectedUrl}`, async () => {
      await router.navigateByUrl(url);
      expect(router.url).toBe(expectedUrl);
    });
  });

  it('opens the main tab named by the URL', async () => {
    await router.navigateByUrl('/motor-inventory/5/analysis');
    service.syncMainTabFromRoute(router.routerState.snapshot.root);
    expect(service.mainTab.getValue()).toBe('analysis');
    await router.navigateByUrl('/motor-inventory/5/summary');
    service.syncMainTabFromRoute(router.routerState.snapshot.root);
    expect(service.mainTab.getValue()).toBe('summary');
  });

  it('navigates to the main tab route with goToMainTab', async () => {
    await router.navigateByUrl('/motor-inventory/5/setup');
    service.goToMainTab('analysis');
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/motor-inventory/5/analysis');
  });

  it('moves between main tabs with browser back and forward', async () => {
    router.initialNavigation();
    await router.navigateByUrl('/motor-inventory/5/setup');
    await router.navigateByUrl('/motor-inventory/5/summary');
    location.back();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/motor-inventory/5/setup');
    location.forward();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/motor-inventory/5/summary');
  });
});

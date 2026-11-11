import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { PumpInventoryData } from './pump-inventory';
import { pumpInventoryRoutes } from './pump-inventory.routing';
import { PumpInventoryService } from './pump-inventory.service';
import { PumpMotorIntegrationService } from '../shared/connected-inventory/pump-motor-integration.service';
import { FieldMeasurementsCatalogService } from './pump-inventory-setup/pump-catalog/field-measurements-catalog/field-measurements-catalog.service';
import { PumpEquipmentCatalogService } from './pump-inventory-setup/pump-catalog/pump-equipment-catalog/pump-equipment-catalog.service';
import { PumpMotorCatalogService } from './pump-inventory-setup/pump-catalog/pump-motor-catalog/pump-motor-catalog.service';

function snapshotFor(...dataChain: object[]): ActivatedRouteSnapshot {
  let child: ActivatedRouteSnapshot = undefined;
  [...dataChain].reverse().forEach(data => {
    child = { data, firstChild: child } as ActivatedRouteSnapshot;
  });
  return child;
}

describe('PumpInventoryService routing', () => {
  let service: PumpInventoryService;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        PumpInventoryService,
        { provide: Router, useValue: routerSpy },
        { provide: FieldMeasurementsCatalogService, useValue: {} },
        { provide: PumpMotorCatalogService, useValue: {} },
        { provide: PumpEquipmentCatalogService, useValue: {} },
        { provide: PumpMotorIntegrationService, useValue: {} }
      ]
    });
    service = TestBed.inject(PumpInventoryService);
    service.currentInventoryId = 5;
  });

  it('syncs main, setup and summary tabs from route data', () => {
    service.syncTabsFromRoute(snapshotFor({}, { mainView: 'summary' }, { summaryView: 'table' }));
    expect(service.mainTab.getValue()).toBe('summary');
    expect(service.summaryTab.getValue()).toBe('table');
    service.syncTabsFromRoute(snapshotFor({ mainView: 'setup' }, { setupView: 'pump-catalog' }));
    expect(service.mainTab.getValue()).toBe('setup');
    expect(service.setupTab.getValue()).toBe('pump-catalog');
  });

  it('navigates to the main tab on its last visited sub-tab', () => {
    service.setupTab.next('department-setup');
    service.goToMainTab('setup');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'setup', 'department-setup']);
    service.summaryTab.next('graphs');
    service.goToMainTab('summary');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'summary', 'graphs']);
  });

  it('steps through setup tabs without pump-properties', () => {
    service.setupTab.next('department-setup');
    service.continueSetupTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'setup', 'pump-catalog']);
    service.backSetupTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'setup', 'plant-setup']);
  });

  it('replaces the summary route with plant setup while the inventory is invalid', () => {
    service.mainTab.next('summary');
    service.pumpInventoryData.next({ isValid: false } as PumpInventoryData);
    service.redirectInvalidSummary();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'setup', 'plant-setup'], { replaceUrl: true });
  });

  it('keeps the summary route when the inventory is valid or setup is open', () => {
    service.mainTab.next('summary');
    service.pumpInventoryData.next({ isValid: true } as PumpInventoryData);
    service.redirectInvalidSummary();
    service.mainTab.next('setup');
    service.pumpInventoryData.next({ isValid: false } as PumpInventoryData);
    service.redirectInvalidSummary();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('steps between main tabs on their last visited sub-tabs', () => {
    service.mainTab.next('setup');
    service.setupTab.next('pump-catalog');
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'summary', 'overview']);
    service.mainTab.next('summary');
    service.backMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'setup', 'pump-catalog']);
  });

  it('does not step past the first or last main tab', () => {
    service.mainTab.next('setup');
    service.backMainTab();
    service.mainTab.next('summary');
    service.continueMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('does not navigate past the first or last tab', () => {
    service.setupTab.next('plant-setup');
    service.backSetupTab();
    service.summaryTab.next('table');
    service.continueSummaryTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('steps through summary tabs', () => {
    service.summaryTab.next('overview');
    service.continueSummaryTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'summary', 'graphs']);
    service.summaryTab.next('table');
    service.backSummaryTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pump-inventory', 5, 'summary', 'graphs']);
  });
});

@Component({ template: '', standalone: true })
class PumpInventoryStubComponent {}

describe('PumpInventoryService with the real router', () => {
  let service: PumpInventoryService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PumpInventoryService,
        provideRouter([{ path: 'pump-inventory/:id', component: PumpInventoryStubComponent, children: pumpInventoryRoutes }]),
        provideLocationMocks(),
        { provide: FieldMeasurementsCatalogService, useValue: {} },
        { provide: PumpMotorCatalogService, useValue: {} },
        { provide: PumpEquipmentCatalogService, useValue: {} },
        { provide: PumpMotorIntegrationService, useValue: {} }
      ]
    });
    service = TestBed.inject(PumpInventoryService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    service.currentInventoryId = 5;
  });

  const urlsAfterRedirects: [string, string][] = [
    ['/pump-inventory/5', '/pump-inventory/5/setup/plant-setup'],
    ['/pump-inventory/5/setup', '/pump-inventory/5/setup/plant-setup'],
    ['/pump-inventory/5/summary', '/pump-inventory/5/summary/overview'],
    ['/pump-inventory/5/unknown', '/pump-inventory/5/setup/plant-setup'],
    ['/pump-inventory/5/setup/pump-catalog', '/pump-inventory/5/setup/pump-catalog'],
    ['/pump-inventory/5/summary/table', '/pump-inventory/5/summary/table']
  ];
  urlsAfterRedirects.forEach(([url, expectedUrl]) => {
    it(`resolves ${url} to ${expectedUrl}`, async () => {
      await router.navigateByUrl(url);
      expect(router.url).toBe(expectedUrl);
    });
  });

  it('opens the tabs named by the URL', async () => {
    await router.navigateByUrl('/pump-inventory/5/summary/graphs');
    service.syncTabsFromRoute(router.routerState.snapshot.root);
    expect(service.mainTab.getValue()).toBe('summary');
    expect(service.summaryTab.getValue()).toBe('graphs');
    await router.navigateByUrl('/pump-inventory/5/setup/department-setup');
    service.syncTabsFromRoute(router.routerState.snapshot.root);
    expect(service.mainTab.getValue()).toBe('setup');
    expect(service.setupTab.getValue()).toBe('department-setup');
  });

  it('moves between main tabs with browser back and forward', async () => {
    router.initialNavigation();
    await router.navigateByUrl('/pump-inventory/5/setup/plant-setup');
    await router.navigateByUrl('/pump-inventory/5/summary/overview');
    location.back();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/pump-inventory/5/setup/plant-setup');
    location.forward();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/pump-inventory/5/summary/overview');
  });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { CentrifugalSpecificsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/centrifugal-specifics-catalog/centrifugal-specifics-catalog.service';
import { CompressedAirControlsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-controls-catalog/compressed-air-controls-catalog.service';
import { CompressedAirMotorCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-motor-catalog/compressed-air-motor-catalog.service';
import { DesignDetailsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/design-details-catalog/design-details-catalog.service';
import { FieldMeasurementsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/field-measurements-catalog/field-measurements-catalog.service';
import { NameplateDataCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/nameplate-data-catalog/nameplate-data-catalog.service';
import { PerformancePointsCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/performance-points-catalog/performance-points-catalog.service';
import { CompressedAirMotorIntegrationService } from '../shared/connected-inventory/compressed-air-motor-integration.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

describe('CompressedAirInventoryService routing', () => {
  let service: CompressedAirInventoryService;
  let routerSpy: { navigate: jasmine.Spy };

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        CompressedAirInventoryService,
        { provide: Router, useValue: routerSpy },
        { provide: ConvertUnitsService, useValue: {} },
        { provide: CentrifugalSpecificsCatalogService, useValue: {} },
        { provide: CompressedAirControlsCatalogService, useValue: {} },
        { provide: CompressedAirMotorCatalogService, useValue: {} },
        { provide: DesignDetailsCatalogService, useValue: {} },
        { provide: FieldMeasurementsCatalogService, useValue: {} },
        { provide: NameplateDataCatalogService, useValue: {} },
        { provide: PerformancePointsCatalogService, useValue: {} },
        { provide: CompressedAirMotorIntegrationService, useValue: {} }
      ]
    });
    service = TestBed.inject(CompressedAirInventoryService);
    service.currentInventoryId = 5;
  });

  it('navigates to the main tab on its last visited sub-tab', () => {
    service.setupTab.next('system-setup');
    service.goToMainTab('setup');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'setup', 'system-setup']);
    service.summaryTab.next('graphs');
    service.goToMainTab('summary');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'summary', 'graphs']);
  });

  it('steps between main tabs', () => {
    service.continueMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'summary', 'overview']);
    service.mainTab.next('summary');
    service.backMainTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'setup', 'plant-setup']);
  });

  it('steps through setup tabs', () => {
    service.setupTab.next('plant-setup');
    service.continueSetupTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'setup', 'system-setup']);
    service.setupTab.next('end-uses');
    service.backSetupTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'setup', 'compressed-air-catalog']);
  });

  it('steps through summary tabs', () => {
    service.continueSummaryTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'summary', 'graphs']);
    service.summaryTab.next('table');
    service.backSummaryTab();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 5, 'summary', 'graphs']);
  });

  it('does not navigate past the first or last tab', () => {
    service.setupTab.next('plant-setup');
    service.backSetupTab();
    service.setupTab.next('end-uses');
    service.continueSetupTab();
    service.summaryTab.next('overview');
    service.backSummaryTab();
    service.summaryTab.next('table');
    service.continueSummaryTab();
    service.backMainTab();
    service.mainTab.next('summary');
    service.continueMainTab();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { CompressedAirInventoryComponent } from './compressed-air-inventory.component';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { GenericCompressorDbService } from '../shared/generic-compressor-db.service';
import { CompressedAirMotorIntegrationService } from '../shared/connected-inventory/compressed-air-motor-integration.service';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { IntegrationStateService } from '../shared/connected-inventory/integration-state.service';
import { CompressedAirAssessmentIntegrationService } from '../shared/connected-inventory/compressed-air-assessment-integration.service';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirItem } from './compressed-air-inventory';

function makeInventoryItem(isValid: boolean): InventoryItem {
  return {
    id: 1,
    compressedAirInventoryData: { isValid, systems: [{ id: 'system-1', catalog: [] }] } as CompressedAirInventoryData
  } as InventoryItem;
}

describe('CompressedAirInventoryComponent', () => {
  let component: CompressedAirInventoryComponent;
  let fixture: ComponentFixture<CompressedAirInventoryComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEvents: Subject<Event>;
  let activatedRouteMock: { params: BehaviorSubject<{ id: string }>, snapshot: any };
  let inventoryDbServiceSpy: jasmine.SpyObj<InventoryDbService>;
  let inventoryServiceSpy: jasmine.SpyObj<CompressedAirInventoryService>;

  beforeEach(async () => {
    routerEvents = new Subject<Event>();
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: routerEvents });
    activatedRouteMock = {
      params: new BehaviorSubject({ id: '1' }),
      snapshot: {
        data: {},
        queryParamMap: { get: () => null },
        firstChild: { data: { mainView: 'setup' }, firstChild: { data: { setupView: 'plant-setup' } } }
      }
    };

    inventoryDbServiceSpy = jasmine.createSpyObj('InventoryDbService', ['getById', 'updateWithObservable', 'getAllInventory', 'setAll']);
    inventoryDbServiceSpy.getById.and.returnValue(makeInventoryItem(false));
    inventoryDbServiceSpy.updateWithObservable.and.returnValue(of(undefined));
    inventoryDbServiceSpy.getAllInventory.and.returnValue(of([]));

    inventoryServiceSpy = jasmine.createSpyObj('CompressedAirInventoryService',
      ['setIsValidInventory', 'goToMainTab', 'continueSetupTab', 'backSetupTab'],
      {
        mainTab: new BehaviorSubject<string>('setup'),
        setupTab: new BehaviorSubject<string>('plant-setup'),
        summaryTab: new BehaviorSubject<string>('overview'),
        compressedAirInventoryData: new BehaviorSubject<CompressedAirInventoryData>(undefined),
        settings: new BehaviorSubject<Settings>(undefined),
        modalOpen: new BehaviorSubject<boolean>(false),
        showExportModal: new BehaviorSubject<boolean>(false)
      }
    );

    const settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByInventoryId']);
    settingsDbServiceSpy.getByInventoryId.and.returnValue({} as Settings);

    await TestBed.configureTestingModule({
      declarations: [CompressedAirInventoryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerSpy },
        { provide: CompressedAirInventoryService, useValue: inventoryServiceSpy },
        { provide: AnalyticsService, useValue: jasmine.createSpyObj('AnalyticsService', ['sendEvent']) },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: InventoryDbService, useValue: inventoryDbServiceSpy },
        { provide: GenericCompressorDbService, useValue: jasmine.createSpyObj('GenericCompressorDbService', ['getAllCompressors']) },
        { provide: CompressedAirMotorIntegrationService, useValue: jasmine.createSpyObj('CompressedAirMotorIntegrationService', ['getHasConnectedMotorItems']) },
        {
          provide: CompressedAirCatalogService, useValue: {
            selectedSystemId: new BehaviorSubject<string>(undefined),
            selectedCompressedAirItem: new BehaviorSubject(undefined),
            showCompressorProperties: new BehaviorSubject<boolean>(false)
          }
        },
        { provide: IntegrationStateService, useValue: { connectedInventoryData: new BehaviorSubject({ shouldRestoreConnectedValues: false }) } },
        { provide: CompressedAirAssessmentIntegrationService, useValue: jasmine.createSpyObj('CompressedAirAssessmentIntegrationService', ['getHasConnectedCompressedAirAssessment', 'checkConnectedAssessmentDiffers']) }
      ]
    })
      .overrideTemplate(CompressedAirInventoryComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryComponent);
    component = fixture.componentInstance;
  });

  function loadInventory(isValid: boolean) {
    inventoryDbServiceSpy.getById.and.returnValue(makeInventoryItem(isValid));
  }

  function navigateTo(...dataChain: object[]) {
    let child: any = undefined;
    [...dataChain].reverse().forEach(data => child = { data, firstChild: child });
    activatedRouteMock.snapshot.firstChild = child;
    routerEvents.next(new NavigationEnd(1, '/compressed-air-inventory/1', '/compressed-air-inventory/1'));
  }

  it('sets the service inventory id on load and clears it on destroy', () => {
    loadInventory(true);
    fixture.detectChanges();
    expect(inventoryServiceSpy.currentInventoryId).toBe(1);
    fixture.destroy();
    expect(inventoryServiceSpy.currentInventoryId).toBeUndefined();
  });

  it('syncs main and setup tabs from the active route on load', () => {
    loadInventory(true);
    activatedRouteMock.snapshot.firstChild = { data: { mainView: 'setup' }, firstChild: { data: { setupView: 'end-uses' } } };
    fixture.detectChanges();
    expect(inventoryServiceSpy.mainTab.value).toBe('setup');
    expect(inventoryServiceSpy.setupTab.value).toBe('end-uses');
  });

  it('syncs summary tabs on NavigationEnd', () => {
    loadInventory(true);
    fixture.detectChanges();
    navigateTo({ mainView: 'summary' }, { summaryView: 'table' });
    expect(inventoryServiceSpy.mainTab.value).toBe('summary');
    expect(inventoryServiceSpy.summaryTab.value).toBe('table');
  });

  it('redirects summary to setup, replacing the URL, while the inventory is invalid', () => {
    loadInventory(false);
    inventoryServiceSpy.mainTab.next('summary');
    activatedRouteMock.snapshot.firstChild = { data: { mainView: 'summary' }, firstChild: { data: { summaryView: 'overview' } } };
    fixture.detectChanges();
    expect(inventoryServiceSpy.mainTab.value).toBe('setup');
    navigateTo({ mainView: 'summary' }, { summaryView: 'overview' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/compressed-air-inventory', 1, 'setup'], { replaceUrl: true });
    expect(inventoryServiceSpy.mainTab.value).toBe('setup');
  });

  it('stops syncing after destroy', () => {
    loadInventory(true);
    fixture.detectChanges();
    fixture.destroy();
    navigateTo({ mainView: 'summary' }, { summaryView: 'graphs' });
    expect(inventoryServiceSpy.mainTab.value).toBe('setup');
  });

  it('continue from end-uses navigates to the summary tab', () => {
    loadInventory(true);
    fixture.detectChanges();
    inventoryServiceSpy.setupTab.next('end-uses');
    component.continue();
    expect(inventoryServiceSpy.goToMainTab).toHaveBeenCalledWith('summary');
  });

  it('clears a compressor selected in a previous visit when the inventory loads', () => {
    const catalogService = TestBed.inject(CompressedAirCatalogService);
    catalogService.selectedCompressedAirItem.next({ id: 'stale' } as CompressedAirItem);
    loadInventory(true);
    fixture.detectChanges();
    expect(catalogService.selectedCompressedAirItem.value).toBeUndefined();
  });

  it('continue and back step setup tabs elsewhere', () => {
    loadInventory(true);
    fixture.detectChanges();
    component.continue();
    component.back();
    expect(inventoryServiceSpy.continueSetupTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.backSetupTab).toHaveBeenCalled();
  });
});

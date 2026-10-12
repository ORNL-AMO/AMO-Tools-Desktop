import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { CompressedAirInventoryBannerComponent } from './compressed-air-inventory-banner.component';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { CompressedAirInventoryData } from '../compressed-air-inventory';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { CompressedAirCatalogService } from '../compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';

function makeInventoryData(isValid: boolean): CompressedAirInventoryData {
  return { isValid, systems: [{ id: 'system-1', catalog: [] }] } as CompressedAirInventoryData;
}

describe('CompressedAirInventoryBannerComponent', () => {
  let component: CompressedAirInventoryBannerComponent;
  let fixture: ComponentFixture<CompressedAirInventoryBannerComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<CompressedAirInventoryService>;
  let inventoryDataSubject: BehaviorSubject<CompressedAirInventoryData>;
  let selectedSystemIdSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    inventoryDataSubject = new BehaviorSubject<CompressedAirInventoryData>(makeInventoryData(true));
    selectedSystemIdSubject = new BehaviorSubject<string>('system-2');
    inventoryServiceSpy = jasmine.createSpyObj('CompressedAirInventoryService',
      ['goToMainTab', 'goToSetupTab', 'goToSummaryTab', 'backMainTab', 'continueMainTab', 'backSetupTab', 'continueSetupTab', 'backSummaryTab', 'continueSummaryTab'],
      {
        mainTab: new BehaviorSubject<string>('setup'),
        setupTab: new BehaviorSubject<string>('plant-setup'),
        summaryTab: new BehaviorSubject<string>('overview'),
        compressedAirInventoryData: inventoryDataSubject
      }
    );

    await TestBed.configureTestingModule({
      declarations: [CompressedAirInventoryBannerComponent],
      providers: [
        { provide: CompressedAirInventoryService, useValue: inventoryServiceSpy },
        { provide: ModalDialogService, useValue: {} },
        { provide: EmailMeasurDataService, useValue: {} },
        { provide: DashboardService, useValue: {} },
        {
          provide: CompressedAirCatalogService, useValue: {
            selectedSystemId: selectedSystemIdSubject,
            showCompressorProperties: new BehaviorSubject<boolean>(false)
          }
        },
        { provide: IntegrationStateService, useValue: { connectedInventoryData: new BehaviorSubject({}) } }
      ]
    })
      .overrideTemplate(CompressedAirInventoryBannerComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryBannerComponent);
    component = fixture.componentInstance;
  });

  describe('setMainTab', () => {
    it('navigates to summary when the inventory is valid', () => {
      fixture.detectChanges();
      component.setMainTab('summary');
      expect(inventoryServiceSpy.goToMainTab).toHaveBeenCalledWith('summary');
    });

    it('blocks summary when the inventory is invalid', () => {
      inventoryDataSubject.next(makeInventoryData(false));
      fixture.detectChanges();
      component.setMainTab('summary');
      expect(inventoryServiceSpy.goToMainTab).not.toHaveBeenCalled();
    });

    it('allows setup when the inventory is invalid', () => {
      inventoryDataSubject.next(makeInventoryData(false));
      fixture.detectChanges();
      component.setMainTab('setup');
      expect(inventoryServiceSpy.goToMainTab).toHaveBeenCalledWith('setup');
    });
  });

  it('keeps the selected system from a connected-inventory link on init', () => {
    fixture.detectChanges();
    expect(selectedSystemIdSubject.value).toBe('system-2');
  });

  it('does not reset the setup tab on init', () => {
    fixture.detectChanges();
    expect(inventoryServiceSpy.setupTab.value).toBe('plant-setup');
    expect(inventoryServiceSpy.goToSetupTab).not.toHaveBeenCalled();
  });

  it('delegates main, setup and summary stepping to the service', () => {
    fixture.detectChanges();
    component.back();
    component.continue();
    component.backSetupTabs();
    component.continueSetupTabs();
    component.backSummaryTabs();
    component.continueSummaryTabs();
    expect(inventoryServiceSpy.backMainTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.continueMainTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.backSetupTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.continueSetupTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.backSummaryTab).toHaveBeenCalled();
    expect(inventoryServiceSpy.continueSummaryTab).toHaveBeenCalled();
  });

  it('routes sub-tab clicks through the service', () => {
    fixture.detectChanges();
    component.setSetupTab('end-uses');
    component.setSummaryTab('table');
    expect(inventoryServiceSpy.goToSetupTab).toHaveBeenCalledWith('end-uses');
    expect(inventoryServiceSpy.goToSummaryTab).toHaveBeenCalledWith('table');
  });
});

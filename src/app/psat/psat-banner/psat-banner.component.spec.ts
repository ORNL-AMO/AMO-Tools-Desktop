import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PsatBannerComponent } from './psat-banner.component';
import { PsatTabService } from '../psat-tab.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { ConnectedInventoryData } from '../../shared/connected-inventory/integrations';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { Assessment } from '../../shared/models/assessment';

function makeAssessment(setupDone = true): Assessment {
  return {
    name: 'Test Pump Assessment',
    type: 'PSAT',
    directoryId: 1,
    modifiedDate: new Date('2024-01-15'),
    psat: { setupDone } as Assessment['psat'],
  } as Assessment;
}

function makeConnectedInventoryData(connectedItem?: unknown): ConnectedInventoryData {
  return { connectedItem } as ConnectedInventoryData;
}

describe('PsatBannerComponent', () => {
  let component: PsatBannerComponent;
  let fixture: ComponentFixture<PsatBannerComponent>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let integrationStateServiceSpy: jasmine.SpyObj<IntegrationStateService>;
  let emailMeasurDataServiceSpy: jasmine.SpyObj<EmailMeasurDataService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let coreServiceSpy: jasmine.SpyObj<CoreService>;
  let mainTabSubject: BehaviorSubject<string>;
  let connectedInventoryDataSubject: BehaviorSubject<ConnectedInventoryData>;

  beforeEach(async () => {
    mainTabSubject = new BehaviorSubject<string>('baseline');
    connectedInventoryDataSubject = new BehaviorSubject<ConnectedInventoryData>(makeConnectedInventoryData(undefined));

    psatTabServiceSpy = jasmine.createSpyObj(
      'PsatTabService',
      [],
      {
        mainTab: mainTabSubject,
        showExportModal: new BehaviorSubject<boolean>(false),
      }
    );

    integrationStateServiceSpy = jasmine.createSpyObj(
      'IntegrationStateService',
      [],
      { connectedInventoryData: connectedInventoryDataSubject }
    );

    emailMeasurDataServiceSpy = jasmine.createSpyObj(
      'EmailMeasurDataService',
      [],
      { emailItemType: new BehaviorSubject<string>(undefined) }
    );

    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    coreServiceSpy = jasmine.createSpyObj(
      'CoreService',
      [],
      { showShareDataModal: new BehaviorSubject<boolean>(false) }
    );

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PsatBannerComponent],
      providers: [
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceSpy },
        { provide: EmailMeasurDataService, useValue: emailMeasurDataServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
        { provide: CoreService, useValue: coreServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatBannerComponent);
    component = fixture.componentInstance;
    component.assessment = makeAssessment();
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets mainTab from the initial value of psatTabService.mainTab', () => {
      expect(component.mainTab).toBe('baseline');
    });

    it('updates mainTab when psatTabService.mainTab emits a new value', () => {
      mainTabSubject.next('report');
      expect(component.mainTab).toBe('report');
    });

    it('sets showConnectedItemIcon to false when there is no connected item', () => {
      expect(component.showConnectedItemIcon).toBeFalse();
    });

    it('sets showConnectedItemIcon to true when integrationStateService reports a connected item', () => {
      connectedInventoryDataSubject.next(makeConnectedInventoryData({ id: 'inv-1' }));
      expect(component.showConnectedItemIcon).toBeTrue();
    });
  });

  describe('changeTab', () => {
    it('changes to baseline and collapses the banner regardless of setupDone', () => {
      component.assessment = makeAssessment(false);
      component.bannerCollapsed = false;

      component.changeTab('baseline');

      expect(mainTabSubject.value).toBe('baseline');
      expect(component.bannerCollapsed).toBeTrue();
    });

    it('changes to calculators regardless of setupDone', () => {
      component.assessment = makeAssessment(false);

      component.changeTab('calculators');

      expect(mainTabSubject.value).toBe('calculators');
    });

    it('changes to another tab when setupDone is true', () => {
      component.assessment = makeAssessment(true);

      component.changeTab('assessment');

      expect(mainTabSubject.value).toBe('assessment');
    });

    it('does not change to another tab when setupDone is false', () => {
      component.assessment = makeAssessment(false);
      mainTabSubject.next('baseline');

      component.changeTab('assessment');

      expect(mainTabSubject.value).toBe('baseline');
    });
  });

  describe('back / continue', () => {
    it('back() moves from calculators to sankey', () => {
      mainTabSubject.next('calculators');
      component.mainTab = 'calculators';

      component.back();

      expect(mainTabSubject.value).toBe('sankey');
    });

    it('back() does nothing when mainTab is baseline', () => {
      mainTabSubject.next('baseline');
      component.mainTab = 'baseline';

      component.back();

      expect(mainTabSubject.value).toBe('baseline');
    });

    it('continue() moves from baseline to assessment', () => {
      component.mainTab = 'baseline';

      component.continue();

      expect(mainTabSubject.value).toBe('assessment');
    });

    it('continue() does nothing when mainTab is calculators', () => {
      mainTabSubject.next('calculators');
      component.mainTab = 'calculators';

      component.continue();

      expect(mainTabSubject.value).toBe('calculators');
    });
  });

  describe('collapseBanner', () => {
    it('toggles bannerCollapsed and dispatches a resize event', () => {
      spyOn(window, 'dispatchEvent').and.callThrough();
      component.bannerCollapsed = true;

      component.collapseBanner();

      expect(component.bannerCollapsed).toBeFalse();
      expect(window.dispatchEvent).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'resize' }));

      component.collapseBanner();
      expect(component.bannerCollapsed).toBeTrue();
    });
  });

  describe('showSecurityAndPrivacyModal', () => {
    it('collapses the banner and opens the security and privacy modal', () => {
      component.bannerCollapsed = false;

      component.showSecurityAndPrivacyModal();

      expect(component.bannerCollapsed).toBeTrue();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalledWith(
        SecurityAndPrivacyItemComponent,
        SecurityAndPrivacyItemComponent.getDialogConfig()
      );
    });
  });

  describe('navigateHome', () => {
    it('navigates to the landing screen without collapsing the sidebar', () => {
      component.navigateHome();

      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith(
        '/landing-screen', { shouldCollapse: false }
      );
    });
  });

  describe('openExportModal', () => {
    it('sets showExportModal to true on the tab service', () => {
      component.openExportModal();

      expect(psatTabServiceSpy.showExportModal.value).toBeTrue();
    });
  });

  describe('openShareDataModal', () => {
    it('sets the measur item attachment and emits the PSAT email item type', () => {
      component.assessment = makeAssessment();

      component.openShareDataModal();

      expect(emailMeasurDataServiceSpy.measurItemAttachment).toEqual({
        itemType: 'assessment',
        itemName: component.assessment.name,
        itemData: component.assessment,
      });
      expect(emailMeasurDataServiceSpy.emailItemType.value).toBe('PSAT');
      expect(coreServiceSpy.showShareDataModal.value).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the pump icon and hides the connected-inventory icon when showConnectedItemIcon is false', () => {
      expect(fixture.nativeElement.querySelector('img[src="assets/images/pump-icon.png"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('img[src="assets/images/psat-inventory-icon.png"]')).toBeNull();
    });

    it('shows the connected-inventory icon and hides the pump icon when showConnectedItemIcon is true', () => {
      connectedInventoryDataSubject.next(makeConnectedInventoryData({ id: 'inv-1' }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('img[src="assets/images/psat-inventory-icon.png"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('img[src="assets/images/pump-icon.png"]')).toBeNull();
    });

    it('shows the collapsed toggle and hides the expanded mobile controls when bannerCollapsed is true', () => {
      expect(fixture.nativeElement.querySelector('.d-lg-none.ml-2.pr-2.h-100.flex-wrap')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.d-lg-none.ml-auto.pr-2.h-100.flex-wrap')).toBeNull();
      expect(fixture.nativeElement.querySelector('.d-block.d-lg-none.align-items-center.nav-pills.nav-fill.mx-auto')).toBeNull();
    });

    it('shows the expanded mobile controls and hides the collapsed toggle when bannerCollapsed is false', () => {
      component.bannerCollapsed = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.d-lg-none.ml-auto.pr-2.h-100.flex-wrap')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.d-lg-none.ml-2.pr-2.h-100.flex-wrap')).toBeNull();
      expect(fixture.nativeElement.querySelector('.d-block.d-lg-none.align-items-center.nav-pills.nav-fill.mx-auto')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating mainTab after component is destroyed', () => {
      fixture.destroy();
      mainTabSubject.next('report');
      expect(component.mainTab).not.toBe('report');
    });

    it('stops updating showConnectedItemIcon after component is destroyed', () => {
      fixture.destroy();
      connectedInventoryDataSubject.next(makeConnectedInventoryData({ id: 'inv-1' }));
      expect(component.showConnectedItemIcon).toBeFalse();
    });
  });
});

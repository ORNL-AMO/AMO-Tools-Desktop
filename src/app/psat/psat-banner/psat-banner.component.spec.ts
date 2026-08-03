import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsatBannerComponent } from './psat-banner.component';
import { PsatTabService } from '../psat-tab.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { CoreService } from '../../core/core.service';

describe('PsatBannerComponent', () => {
  let component: PsatBannerComponent;
  let fixture: ComponentFixture<PsatBannerComponent>;

  const mockAssessment: any = {
    name: 'Test Assessment',
    modifiedDate: new Date(),
    directoryId: 1,
    psat: { setupDone: true }
  };

  beforeEach(async () => {
    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], {
      mainTab: new BehaviorSubject<string>('baseline'),
      showExportModal: new BehaviorSubject<boolean>(false),
    });

    const integrationStateServiceSpy = jasmine.createSpyObj('IntegrationStateService', [], {
      connectedInventoryData: new BehaviorSubject<any>({ connectedItem: undefined }),
    });

    const emailMeasurDataServiceSpy = jasmine.createSpyObj('EmailMeasurDataService', [], {
      emailItemType: new BehaviorSubject<string>(''),
      measurItemAttachment: undefined
    });

    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    const modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    const coreServiceSpy = jasmine.createSpyObj('CoreService', [], {
      showShareDataModal: new BehaviorSubject<boolean>(false),
    });

    await TestBed.configureTestingModule({
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
    component.assessment = mockAssessment;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('bannerCollapsed toggling', () => {
    it('shows collapsed menu icon when bannerCollapsed is true', () => {
      component.bannerCollapsed = true;
      fixture.detectChanges();
      const collapsedDiv = fixture.nativeElement.querySelector('.d-block.d-lg-none.ml-2.pr-2');
      expect(collapsedDiv).not.toBeNull();
    });

    it('hides mobile nav when bannerCollapsed is true', () => {
      component.bannerCollapsed = true;
      fixture.detectChanges();
      // The expanded mobile nav div should not be present when bannerCollapsed = true
      const expandedNav = fixture.nativeElement.querySelector('.d-block.d-lg-none.ml-auto.pr-2');
      expect(expandedNav).toBeNull();
    });

    it('shows mobile nav items when bannerCollapsed is false', () => {
      component.bannerCollapsed = false;
      fixture.detectChanges();
      const expandedNav = fixture.nativeElement.querySelector('.d-block.d-lg-none.ml-auto.pr-2');
      expect(expandedNav).not.toBeNull();
    });
  });

  describe('showConnectedItemIcon', () => {
    it('shows default pump icon when showConnectedItemIcon is false', () => {
      component.showConnectedItemIcon = false;
      fixture.detectChanges();
      const pumpIcon = fixture.nativeElement.querySelector('img[src="assets/images/pump-icon.png"]');
      expect(pumpIcon).not.toBeNull();
    });

    it('shows inventory icon when showConnectedItemIcon is true', () => {
      component.showConnectedItemIcon = true;
      fixture.detectChanges();
      const inventoryIcon = fixture.nativeElement.querySelector('img[src="assets/images/psat-inventory-icon.png"]');
      expect(inventoryIcon).not.toBeNull();
    });
  });
});

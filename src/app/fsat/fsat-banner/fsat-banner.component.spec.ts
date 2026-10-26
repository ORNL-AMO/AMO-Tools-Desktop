import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FsatBannerComponent } from './fsat-banner.component';
import { FsatService } from '../fsat.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { Assessment } from '../../shared/models/assessment';
import { FsatMainView } from '../routing/fsat-main-views';

function makeAssessment(setupDone: boolean): Assessment {
  return { name: 'Test Fan Assessment', type: 'FSAT', fsat: { setupDone } as Assessment['fsat'] } as Assessment;
}

describe('FsatBannerComponent', () => {
  let component: FsatBannerComponent;
  let fixture: ComponentFixture<FsatBannerComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;

  beforeEach(async () => {
    fsatServiceSpy = jasmine.createSpyObj(
      'FsatService',
      ['goToMainTab', 'backMainTab', 'continueMainTab'],
      { mainTab: new BehaviorSubject<string>('baseline'), showExportModal: new BehaviorSubject<boolean>(false) }
    );

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [FsatBannerComponent],
      providers: [
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: EmailMeasurDataService, useValue: jasmine.createSpyObj('EmailMeasurDataService', [], { emailItemType: new BehaviorSubject<string>(undefined) }) },
        { provide: DashboardService, useValue: jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']) },
        { provide: ModalDialogService, useValue: jasmine.createSpyObj('ModalDialogService', ['openModal']) },
        { provide: CoreService, useValue: jasmine.createSpyObj('CoreService', [], { showShareDataModal: new BehaviorSubject<boolean>(false) }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatBannerComponent);
    component = fixture.componentInstance;
    component.assessment = makeAssessment(true);
    fixture.detectChanges();
  });

  describe('canOpenMainTab', () => {
    it('allows gated tabs only once setup is done', () => {
      component.assessment = makeAssessment(false);
      expect(component.canOpenMainTab('baseline')).toBeTrue();
      expect(component.canOpenMainTab('report')).toBeFalse();
      component.assessment = makeAssessment(true);
      expect(component.canOpenMainTab('report')).toBeTrue();
    });
  });

  describe('changeTab', () => {
    (['baseline', 'calculators'] satisfies Array<FsatMainView>).forEach(view => {
      it(`changes to ${view} regardless of setupDone and collapses the banner`, () => {
        component.assessment = makeAssessment(false);
        component.bannerCollapsed = false;

        component.changeTab(view);

        expect(fsatServiceSpy.goToMainTab).toHaveBeenCalledWith(view);
        expect(component.bannerCollapsed).toBeTrue();
      });
    });

    (['assessment', 'diagram', 'report', 'sankey'] satisfies Array<FsatMainView>).forEach(view => {
      it(`changes to ${view} when setupDone is true`, () => {
        component.changeTab(view);
        expect(fsatServiceSpy.goToMainTab).toHaveBeenCalledWith(view);
      });

      it(`does not change to ${view} when setupDone is false`, () => {
        component.assessment = makeAssessment(false);
        component.changeTab(view);
        expect(fsatServiceSpy.goToMainTab).not.toHaveBeenCalled();
      });
    });
  });

  describe('template visibility', () => {
    const collapsedToggle = (): HTMLElement => fixture.nativeElement.querySelector('.d-block.d-lg-none.ml-2.pr-2.h-100.flex-wrap');
    const mobileNav = (): HTMLElement => fixture.nativeElement.querySelector('.d-block.d-lg-none.nav-pills');
    const expandedMenu = (): HTMLElement => fixture.nativeElement.querySelector('.d-block.d-lg-none.ml-auto.pr-2.h-100.flex-wrap');

    describe('when the banner is collapsed', () => {
      it('shows only the menu toggle', () => {
        component.bannerCollapsed = true;
        fixture.detectChanges();

        expect(collapsedToggle()).not.toBeNull();
        expect(collapsedToggle().querySelectorAll('.fa-bars').length).toBe(1);
        expect(mobileNav()).toBeNull();
        expect(expandedMenu()).toBeNull();
      });
    });

    describe('when the banner is expanded', () => {
      beforeEach(() => {
        component.bannerCollapsed = false;
        fixture.detectChanges();
      });

      it('hides the menu toggle', () => {
        expect(collapsedToggle()).toBeNull();
      });

      it('shows the mobile tab navigation with one item per tab', () => {
        expect(mobileNav()).not.toBeNull();
        expect(mobileNav().querySelectorAll('.nav-item').length).toBe(6);
      });

      it('shows the mobile action menu with a collapse button and the action items', () => {
        expect(expandedMenu()).not.toBeNull();
        expect(expandedMenu().querySelectorAll('.fa-bars').length).toBe(1);
        expect(expandedMenu().querySelectorAll('.home-nav-item').length).toBe(8);
      });
    });

    it('switches between the collapsed and expanded views when the banner is toggled', () => {
      component.collapseBanner();
      fixture.detectChanges();
      expect(mobileNav()).not.toBeNull();
      expect(collapsedToggle()).toBeNull();

      component.collapseBanner();
      fixture.detectChanges();
      expect(mobileNav()).toBeNull();
      expect(collapsedToggle()).not.toBeNull();
    });
  });
});

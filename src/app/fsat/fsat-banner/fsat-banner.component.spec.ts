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
});

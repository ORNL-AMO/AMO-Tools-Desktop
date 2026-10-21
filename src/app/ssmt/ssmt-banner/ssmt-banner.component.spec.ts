import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { SsmtBannerComponent } from './ssmt-banner.component';
import { SsmtService } from '../ssmt.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { CoreService } from '../../core/core.service';
import { Assessment } from '../../shared/models/assessment';
import { SSMT } from '../../shared/models/steam/ssmt';
import { SsmtMainView } from '../routing/ssmt.routing';

function makeAssessment(setupDone: boolean): Assessment {
  return { id: 1, type: 'SSMT', ssmt: { setupDone } as SSMT } as Assessment;
}

describe('SsmtBannerComponent', () => {
  let component: SsmtBannerComponent;
  let fixture: ComponentFixture<SsmtBannerComponent>;
  let ssmtServiceSpy: jasmine.SpyObj<SsmtService>;

  beforeEach(async () => {
    ssmtServiceSpy = jasmine.createSpyObj('SsmtService', ['goToMainTab', 'backMainTab', 'continueMainTab'], {
      mainTab: new BehaviorSubject<string>('baseline'),
    });

    await TestBed.configureTestingModule({
      declarations: [SsmtBannerComponent],
      providers: [
        { provide: SsmtService, useValue: ssmtServiceSpy },
        { provide: EmailMeasurDataService, useValue: {} },
        { provide: DashboardService, useValue: {} },
        { provide: ModalDialogService, useValue: {} },
        { provide: CoreService, useValue: {} },
      ],
    })
      .overrideTemplate(SsmtBannerComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SsmtBannerComponent);
    component = fixture.componentInstance;
  });

  describe('canOpenMainTab', () => {
    it('allows gated tabs only once setup is done', () => {
      component.assessment = makeAssessment(false);
      fixture.detectChanges();
      expect(component.canOpenMainTab('baseline')).toBeTrue();
      expect(component.canOpenMainTab('report')).toBeFalse();
      component.assessment = makeAssessment(true);
      expect(component.canOpenMainTab('report')).toBeTrue();
    });
  });

  describe('changeTab', () => {
    it('navigates to a gated tab when setup is done', () => {
      component.assessment = makeAssessment(true);
      fixture.detectChanges();
      component.changeTab('report');
      expect(ssmtServiceSpy.goToMainTab).toHaveBeenCalledWith('report');
    });

    (['assessment', 'diagram', 'report', 'sankey'] satisfies Array<SsmtMainView>).forEach(tab => {
      it(`blocks ${tab} when setup is not done`, () => {
        component.assessment = makeAssessment(false);
        fixture.detectChanges();
        component.changeTab(tab);
        expect(ssmtServiceSpy.goToMainTab).not.toHaveBeenCalled();
      });
    });

    (['baseline', 'calculators'] satisfies Array<SsmtMainView>).forEach(tab => {
      it(`allows ${tab} when setup is not done`, () => {
        component.assessment = makeAssessment(false);
        fixture.detectChanges();
        component.changeTab(tab);
        expect(ssmtServiceSpy.goToMainTab).toHaveBeenCalledWith(tab);
      });
    });
  });

  it('back delegates to backMainTab', () => {
    component.assessment = makeAssessment(true);
    fixture.detectChanges();
    component.back();
    expect(ssmtServiceSpy.backMainTab).toHaveBeenCalled();
  });

  it('continue delegates to continueMainTab', () => {
    component.assessment = makeAssessment(true);
    fixture.detectChanges();
    component.continue();
    expect(ssmtServiceSpy.continueMainTab).toHaveBeenCalled();
  });
});

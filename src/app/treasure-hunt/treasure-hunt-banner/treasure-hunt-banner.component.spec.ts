import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { TreasureHuntBannerComponent } from './treasure-hunt-banner.component';
import { TreasureHuntService } from '../treasure-hunt.service';
import { CalculatorsService } from '../calculators/calculators.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { CoreService } from '../../core/core.service';
import { Assessment } from '../../shared/models/assessment';
import { TreasureHunt } from '../../shared/models/treasure-hunt';

function makeAssessment(setupDone: boolean): Assessment {
  return { id: 1, type: 'TreasureHunt', treasureHunt: { setupDone } as TreasureHunt } as Assessment;
}

describe('TreasureHuntBannerComponent', () => {
  let component: TreasureHuntBannerComponent;
  let fixture: ComponentFixture<TreasureHuntBannerComponent>;
  let treasureHuntServiceSpy: jasmine.SpyObj<TreasureHuntService>;
  let mainTab: BehaviorSubject<string>;
  let subTab: BehaviorSubject<string>;
  let selectedCalc: BehaviorSubject<string>;

  beforeEach(async () => {
    mainTab = new BehaviorSubject<string>('baseline');
    subTab = new BehaviorSubject<string>('settings');
    selectedCalc = new BehaviorSubject<string>('none');
    treasureHuntServiceSpy = jasmine.createSpyObj('TreasureHuntService', ['goToMainTab', 'backMainTab', 'continueMainTab'], {
      mainTab,
      subTab,
    });

    await TestBed.configureTestingModule({
      declarations: [TreasureHuntBannerComponent],
      providers: [
        { provide: TreasureHuntService, useValue: treasureHuntServiceSpy },
        { provide: CalculatorsService, useValue: { selectedCalc } },
        { provide: EmailMeasurDataService, useValue: {} },
        { provide: DashboardService, useValue: {} },
        { provide: ModalDialogService, useValue: {} },
        { provide: CoreService, useValue: {} },
      ],
    })
      .overrideTemplate(TreasureHuntBannerComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TreasureHuntBannerComponent);
    component = fixture.componentInstance;
  });

  describe('changeTab', () => {
    ['find-treasure', 'treasure-chest', 'report'].forEach(tab => {
      it(`navigates to ${tab} when setup is done`, () => {
        component.assessment = makeAssessment(true);
        fixture.detectChanges();
        component.changeTab(tab);
        expect(treasureHuntServiceSpy.goToMainTab).toHaveBeenCalledWith(tab);
      });

      it(`blocks ${tab} when setup is not done`, () => {
        component.assessment = makeAssessment(false);
        fixture.detectChanges();
        component.changeTab(tab);
        expect(treasureHuntServiceSpy.goToMainTab).not.toHaveBeenCalled();
      });
    });

    it('allows baseline when setup is not done', () => {
      component.assessment = makeAssessment(false);
      fixture.detectChanges();
      component.changeTab('baseline');
      expect(treasureHuntServiceSpy.goToMainTab).toHaveBeenCalledWith('baseline');
    });

    it('blocks navigation while a calculator is open', () => {
      component.assessment = makeAssessment(true);
      fixture.detectChanges();
      selectedCalc.next('opportunity-sheet');
      component.changeTab('report');
      expect(treasureHuntServiceSpy.goToMainTab).not.toHaveBeenCalled();
    });
  });

  describe('back', () => {
    it('delegates to backMainTab outside baseline', () => {
      component.assessment = makeAssessment(true);
      mainTab.next('report');
      fixture.detectChanges();
      component.back();
      expect(treasureHuntServiceSpy.backMainTab).toHaveBeenCalled();
    });

    it('steps the baseline sub tab back instead of changing main tab', () => {
      component.assessment = makeAssessment(true);
      subTab.next('operation-costs');
      fixture.detectChanges();
      component.back();
      expect(treasureHuntServiceSpy.backMainTab).not.toHaveBeenCalled();
      expect(subTab.value).toBe('settings');
    });
  });

  describe('continue', () => {
    it('delegates to continueMainTab outside baseline', () => {
      component.assessment = makeAssessment(true);
      mainTab.next('find-treasure');
      fixture.detectChanges();
      component.continue();
      expect(treasureHuntServiceSpy.continueMainTab).toHaveBeenCalled();
    });

    it('advances the baseline sub tab before leaving baseline', () => {
      component.assessment = makeAssessment(true);
      fixture.detectChanges();
      component.continue();
      expect(treasureHuntServiceSpy.continueMainTab).not.toHaveBeenCalled();
      expect(subTab.value).toBe('operation-costs');
    });

    it('leaves baseline from the last sub tab', () => {
      component.assessment = makeAssessment(true);
      subTab.next('operation-costs');
      fixture.detectChanges();
      component.continue();
      expect(treasureHuntServiceSpy.continueMainTab).toHaveBeenCalled();
    });
  });
});

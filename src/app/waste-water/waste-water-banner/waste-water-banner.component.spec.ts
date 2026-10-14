import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { WasteWaterBannerComponent } from './waste-water-banner.component';
import { WasteWaterService } from '../waste-water.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { CoreService } from '../../core/core.service';
import { WasteWater } from '../../shared/models/waste-water';
import { WasteWaterMainView } from '../routing/waste-water.routing';

function makeWasteWater(isValid: boolean): WasteWater {
  return {
    baselineData: { valid: { isValid } },
  } as WasteWater;
}

describe('WasteWaterBannerComponent', () => {
  let component: WasteWaterBannerComponent;
  let fixture: ComponentFixture<WasteWaterBannerComponent>;
  let wasteWaterServiceSpy: jasmine.SpyObj<WasteWaterService>;
  let wasteWaterSubject: BehaviorSubject<WasteWater>;

  beforeEach(async () => {
    wasteWaterSubject = new BehaviorSubject<WasteWater>(makeWasteWater(true));
    wasteWaterServiceSpy = jasmine.createSpyObj(
      'WasteWaterService',
      ['goToMainTab', 'backMainTab', 'continueMainTab', 'getModificationFromId'],
      {
        wasteWater: wasteWaterSubject,
        mainTab: new BehaviorSubject<string>('baseline'),
        assessmentTab: new BehaviorSubject<string>('modify-conditions'),
        selectedModificationId: new BehaviorSubject<string>(undefined),
      }
    );

    await TestBed.configureTestingModule({
      declarations: [WasteWaterBannerComponent],
      providers: [
        { provide: WasteWaterService, useValue: wasteWaterServiceSpy },
        { provide: EmailMeasurDataService, useValue: {} },
        { provide: DashboardService, useValue: {} },
        { provide: ModalDialogService, useValue: {} },
        { provide: CoreService, useValue: {} },
      ],
    })
      .overrideTemplate(WasteWaterBannerComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WasteWaterBannerComponent);
    component = fixture.componentInstance;
  });

  describe('canOpenMainTab', () => {
    it('allows gated tabs only while the baseline is valid', () => {
      wasteWaterSubject.next(makeWasteWater(false));
      fixture.detectChanges();
      expect(component.canOpenMainTab('calculators')).toBeTrue();
      expect(component.canOpenMainTab('assessment')).toBeFalse();
      wasteWaterSubject.next(makeWasteWater(true));
      fixture.detectChanges();
      expect(component.canOpenMainTab('assessment')).toBeTrue();
    });
  });

  describe('changeTab', () => {
    it('navigates to the selected main tab when the baseline is valid', () => {
      fixture.detectChanges();
      component.changeTab('report');
      expect(wasteWaterServiceSpy.goToMainTab).toHaveBeenCalledWith('report');
    });

    (['assessment', 'analysis', 'diagram', 'report'] satisfies Array<WasteWaterMainView>).forEach(tab => {
      it(`blocks ${tab} when the baseline is invalid`, () => {
        wasteWaterSubject.next(makeWasteWater(false));
        fixture.detectChanges();
        component.changeTab(tab);
        expect(wasteWaterServiceSpy.goToMainTab).not.toHaveBeenCalled();
      });
    });

    (['baseline', 'calculators'] satisfies Array<WasteWaterMainView>).forEach(tab => {
      it(`allows ${tab} when the baseline is invalid`, () => {
        wasteWaterSubject.next(makeWasteWater(false));
        fixture.detectChanges();
        component.changeTab(tab);
        expect(wasteWaterServiceSpy.goToMainTab).toHaveBeenCalledWith(tab);
      });
    });
  });

  it('back delegates to backMainTab', () => {
    fixture.detectChanges();
    component.back();
    expect(wasteWaterServiceSpy.backMainTab).toHaveBeenCalled();
  });

  it('continue delegates to continueMainTab', () => {
    fixture.detectChanges();
    component.continue();
    expect(wasteWaterServiceSpy.continueMainTab).toHaveBeenCalled();
  });
});

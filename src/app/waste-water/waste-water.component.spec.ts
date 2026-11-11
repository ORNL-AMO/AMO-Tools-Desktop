import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data, Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { WasteWaterComponent } from './waste-water.component';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { WasteWaterService } from './waste-water.service';
import { ConvertWasteWaterService } from './convert-waste-water.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CompareService } from './modify-conditions/compare.service';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { WasteWaterOperationsService } from './waste-water-operations/waste-water-operations.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WasteWater } from '../shared/models/waste-water';

function makeAssessment(setupDone: boolean): Assessment {
  return {
    id: 1,
    type: 'WasteWater',
    wasteWater: { setupDone, baselineData: {} } as WasteWater,
  } as Assessment;
}

describe('WasteWaterComponent', () => {
  let component: WasteWaterComponent;
  let fixture: ComponentFixture<WasteWaterComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEvents: Subject<Event>;
  let activatedRouteMock: {
    params: BehaviorSubject<{ id: string }>;
    firstChild: { snapshot: { data: Data } };
  };
  let assessmentDbServiceSpy: jasmine.SpyObj<AssessmentDbService>;
  let wasteWaterServiceSpy: jasmine.SpyObj<WasteWaterService>;

  beforeEach(async () => {
    routerEvents = new Subject<Event>();
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: routerEvents });

    activatedRouteMock = {
      params: new BehaviorSubject({ id: '1' }),
      firstChild: { snapshot: { data: { mainView: 'baseline' } } },
    };

    assessmentDbServiceSpy = jasmine.createSpyObj('AssessmentDbService', ['findById']);
    assessmentDbServiceSpy.findById.and.returnValue(makeAssessment(false));

    wasteWaterServiceSpy = jasmine.createSpyObj(
      'WasteWaterService',
      ['updateWasteWater', 'goToMainTab'],
      {
        mainTab: new BehaviorSubject<string>('baseline'),
        setupTab: new BehaviorSubject<string>('baseline'),
        assessmentTab: new BehaviorSubject<string>('modify-conditions'),
        wasteWater: new BehaviorSubject<WasteWater>(undefined),
        settings: new BehaviorSubject<Settings>(undefined),
        showAddModificationModal: new BehaviorSubject<boolean>(false),
        showModificationListModal: new BehaviorSubject<boolean>(false),
        isModalOpen: new BehaviorSubject<boolean>(false),
        showExportModal: new BehaviorSubject<boolean>(false),
      }
    );

    const settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByAssessmentId']);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue({} as Settings);
    settingsDbServiceSpy.globalSettings = { disableWasteWaterTutorial: true } as Settings;

    await TestBed.configureTestingModule({
      declarations: [WasteWaterComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: WasteWaterService, useValue: wasteWaterServiceSpy },
        { provide: ConvertWasteWaterService, useValue: {} },
        { provide: AssessmentDbService, useValue: assessmentDbServiceSpy },
        { provide: CompareService, useValue: jasmine.createSpyObj('CompareService', ['setWasteWaterDifferent']) },
        { provide: ActivatedSludgeFormService, useValue: {} },
        { provide: AeratorPerformanceFormService, useValue: {} },
        { provide: SystemBasicsService, useValue: {} },
        { provide: WasteWaterOperationsService, useValue: {} },
        { provide: AnalyticsService, useValue: jasmine.createSpyObj('AnalyticsService', ['sendEvent']) },
      ],
    })
      .overrideTemplate(WasteWaterComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WasteWaterComponent);
    component = fixture.componentInstance;
  });

  function navigateTo(mainView: string) {
    activatedRouteMock.firstChild.snapshot.data = { mainView };
    routerEvents.next(new NavigationEnd(1, `/waste-water/1/${mainView}`, `/waste-water/1/${mainView}`));
  }

  it('sets mainTab from the active child route on load', () => {
    assessmentDbServiceSpy.findById.and.returnValue(makeAssessment(true));
    activatedRouteMock.firstChild.snapshot.data = { mainView: 'report' };
    fixture.detectChanges();
    expect(component.mainTab).toBe('report');
  });

  it('updates mainTab on NavigationEnd', () => {
    assessmentDbServiceSpy.findById.and.returnValue(makeAssessment(true));
    fixture.detectChanges();
    navigateTo('analysis');
    expect(wasteWaterServiceSpy.mainTab.value).toBe('analysis');
  });

  ['assessment', 'analysis', 'diagram', 'report'].forEach(mainView => {
    it(`redirects ${mainView} to baseline, replacing the URL, when setup is not done`, () => {
      fixture.detectChanges();
      navigateTo(mainView);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 1, 'baseline'], { replaceUrl: true });
      expect(wasteWaterServiceSpy.mainTab.value).toBe('baseline');
    });
  });

  it('allows calculators when setup is not done', () => {
    fixture.detectChanges();
    navigateTo('calculators');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(wasteWaterServiceSpy.mainTab.value).toBe('calculators');
  });

  it('stops syncing after destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    navigateTo('calculators');
    expect(wasteWaterServiceSpy.mainTab.value).toBe('baseline');
  });

  it('sets the service assessment id on load and clears it on destroy', () => {
    fixture.detectChanges();
    expect(wasteWaterServiceSpy.assessmentId).toBe(1);
    fixture.destroy();
    expect(wasteWaterServiceSpy.assessmentId).toBeUndefined();
  });

  it('continue from aerator-performance navigates to the assessment tab', () => {
    fixture.detectChanges();
    wasteWaterServiceSpy.setupTab.next('aerator-performance');
    component.continue();
    expect(wasteWaterServiceSpy.goToMainTab).toHaveBeenCalledWith('assessment');
  });
});

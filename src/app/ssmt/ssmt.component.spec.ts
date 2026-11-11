import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data, Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { SsmtComponent } from './ssmt.component';
import { SsmtService } from './ssmt.service';
import { BoilerService } from './boiler/boiler.service';
import { CompareService } from './compare.service';
import { ConvertSsmtService } from './convert-ssmt.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsService } from '../settings/settings.service';
import { SteamService } from '../calculator/steam/steam.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SnackbarService } from '../shared/snackbar-notification/snackbar.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { SSMT } from '../shared/models/steam/ssmt';

function makeAssessment(setupDone: boolean): Assessment {
  return { id: 1, type: 'SSMT', ssmt: { setupDone, modifications: [] } as SSMT } as Assessment;
}

describe('SsmtComponent', () => {
  let component: SsmtComponent;
  let fixture: ComponentFixture<SsmtComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEvents: Subject<Event>;
  let activatedRouteMock: {
    params: BehaviorSubject<{ id: string }>;
    firstChild: { snapshot: { data: Data } };
  };
  let assessmentDbServiceSpy: jasmine.SpyObj<AssessmentDbService>;
  let ssmtServiceSpy: jasmine.SpyObj<SsmtService>;

  beforeEach(async () => {
    routerEvents = new Subject<Event>();
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: routerEvents });

    activatedRouteMock = {
      params: new BehaviorSubject({ id: '1' }),
      firstChild: { snapshot: { data: { mainView: 'baseline' } } },
    };

    assessmentDbServiceSpy = jasmine.createSpyObj('AssessmentDbService', ['findById']);
    assessmentDbServiceSpy.findById.and.returnValue(makeAssessment(false));

    ssmtServiceSpy = jasmine.createSpyObj('SsmtService', ['goToMainTab'], {
      mainTab: new BehaviorSubject<string>('baseline'),
      stepTab: new BehaviorSubject<string>('baseline'),
      assessmentTab: new BehaviorSubject<string>('explore-opportunities'),
      steamModelTab: new BehaviorSubject<string>('operations'),
      calcTab: new BehaviorSubject<string>('boiler'),
      openNewModificationModal: new BehaviorSubject<boolean>(false),
      openModificationSelectModal: new BehaviorSubject<boolean>(false),
      modalOpen: new BehaviorSubject<boolean>(false),
      saveSSMT: new BehaviorSubject<SSMT>(undefined),
      showExportModal: new BehaviorSubject<boolean>(false),
    });

    const settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByAssessmentId']);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue({} as Settings);
    settingsDbServiceSpy.globalSettings = { disableSteamTutorial: true } as Settings;

    await TestBed.configureTestingModule({
      declarations: [SsmtComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerSpy },
        { provide: SsmtService, useValue: ssmtServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AssessmentDbService, useValue: assessmentDbServiceSpy },
        { provide: BoilerService, useValue: {} },
        { provide: CompareService, useValue: jasmine.createSpyObj('CompareService', ['setCompareVals'], { selectedModification: new BehaviorSubject(undefined) }) },
        { provide: SettingsService, useValue: {} },
        { provide: SteamService, useValue: { steamModelerError: new BehaviorSubject<string>(undefined) } },
        { provide: ConvertSsmtService, useValue: {} },
        { provide: AnalyticsService, useValue: jasmine.createSpyObj('AnalyticsService', ['sendEvent']) },
        { provide: SnackbarService, useValue: jasmine.createSpyObj('SnackbarService', ['setSnackbarMessage']) },
      ],
    })
      .overrideTemplate(SsmtComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SsmtComponent);
    component = fixture.componentInstance;
  });

  function navigateTo(mainView: string) {
    activatedRouteMock.firstChild.snapshot.data = { mainView };
    routerEvents.next(new NavigationEnd(1, `/ssmt/1/${mainView}`, `/ssmt/1/${mainView}`));
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
    navigateTo('sankey');
    expect(ssmtServiceSpy.mainTab.value).toBe('sankey');
  });

  ['assessment', 'diagram', 'report', 'sankey'].forEach(mainView => {
    it(`redirects ${mainView} to baseline, replacing the URL, when setup is not done`, () => {
      fixture.detectChanges();
      navigateTo(mainView);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 1, 'baseline'], { replaceUrl: true });
      expect(ssmtServiceSpy.mainTab.value).toBe('baseline');
    });
  });

  it('allows calculators when setup is not done', () => {
    fixture.detectChanges();
    navigateTo('calculators');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(ssmtServiceSpy.mainTab.value).toBe('calculators');
  });

  it('stops syncing after destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    navigateTo('calculators');
    expect(ssmtServiceSpy.mainTab.value).toBe('baseline');
  });

  it('sets the service assessment id on load and clears it on destroy', () => {
    fixture.detectChanges();
    expect(ssmtServiceSpy.assessmentId).toBe(1);
    fixture.destroy();
    expect(ssmtServiceSpy.assessmentId).toBeUndefined();
  });

  it('goToReport navigates to the report tab', () => {
    fixture.detectChanges();
    component.goToReport();
    expect(ssmtServiceSpy.goToMainTab).toHaveBeenCalledWith('report');
  });

  it('continue from the turbine step navigates to the assessment tab', () => {
    fixture.detectChanges();
    ssmtServiceSpy.stepTab.next('turbine');
    component.continue();
    expect(ssmtServiceSpy.goToMainTab).toHaveBeenCalledWith('assessment');
  });
});

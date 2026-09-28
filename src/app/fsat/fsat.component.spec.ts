import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { FsatComponent } from './fsat.component';
import { FsatService } from './fsat.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CompareService } from './compare.service';
import { ConvertFsatService } from './convert-fsat.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { FSAT, Modification } from '../shared/models/fans';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';

describe('FsatComponent', () => {
  let component: FsatComponent;
  let fixture: ComponentFixture<FsatComponent>;
  let fsatServiceStub: any;
  let settingsDbServiceStub: any;
  let assessmentDbServiceStub: any;
  let compareServiceStub: any;
  let convertFsatServiceStub: any;

  const assessment: Assessment = { id: 1, type: 'FSAT' } as Assessment;
  const settings: Settings = { id: 1 } as Settings;

  const getFsat = (modifications: Modification[] = []): FSAT => ({
    modifications,
    fsatOperations: {} as any
  } as FSAT);

  beforeEach(async () => {
    fsatServiceStub = {
      assessment: new BehaviorSubject<Assessment>(assessment),
      fsat: new BehaviorSubject<FSAT>(getFsat()),
      settings: new BehaviorSubject<Settings>(settings),
      mainTab: new BehaviorSubject<string>('baseline'),
      stepTab: new BehaviorSubject<string>('baseline'),
      assessmentTab: new BehaviorSubject<string>('explore-opportunities'),
      showUpdateUnitsModal: new BehaviorSubject<{ show: boolean, oldSettings?: Settings }>({ show: false }),
      smallScreenTab: new BehaviorSubject<string>('form'),
      openNewModal: new BehaviorSubject<boolean>(false),
      openModificationModal: new BehaviorSubject<boolean>(false),
      showExportModal: new BehaviorSubject<boolean>(false),
      modalOpen: new BehaviorSubject<boolean>(false),
      modificationExists: new BehaviorSubject<boolean>(false),
      modificationIndex: new BehaviorSubject<number>(undefined),
      updateData: new BehaviorSubject<boolean>(false),
      fsatEdited: new Subject<FSAT>(),
      settingsEdited: new Subject<Settings>(),
      addNewModRequested: new Subject<{ exploreOpportunities: boolean }>(),
      setFsat: jasmine.createSpy('setFsat'),
      getCanContinueFromStep: jasmine.createSpy('getCanContinueFromStep').and.returnValue(true),
      checkValid: jasmine.createSpy('checkValid').and.returnValue({ isValid: true }),
      goToMainTab: jasmine.createSpy('goToMainTab'),
      continue: jasmine.createSpy('continue'),
      back: jasmine.createSpy('back'),
      initData: jasmine.createSpy('initData'),
    };

    settingsDbServiceStub = {
      globalSettings: { disableFansTutorial: true } as Settings,
      updateWithObservable: jasmine.createSpy('updateWithObservable').and.returnValue(of(settings)),
      getAllSettings: jasmine.createSpy('getAllSettings').and.returnValue(of([settings])),
      setAll: jasmine.createSpy('setAll'),
      getByAssessmentId: jasmine.createSpy('getByAssessmentId').and.returnValue(settings),
    };

    assessmentDbServiceStub = {
      updateWithObservable: jasmine.createSpy('updateWithObservable').and.returnValue(of(assessment)),
      getAllAssessments: jasmine.createSpy('getAllAssessments').and.returnValue(of([assessment])),
      setAll: jasmine.createSpy('setAll'),
    };

    compareServiceStub = {
      setCompareVals: jasmine.createSpy('setCompareVals'),
      selectedModification: new BehaviorSubject<Modification>(undefined),
      baselineFSAT: undefined,
      modifiedFSAT: undefined,
    };

    convertFsatServiceStub = {
      convertExistingData: jasmine.createSpy('convertExistingData').and.returnValue(getFsat()),
    };

    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [FsatComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FsatService, useValue: fsatServiceStub },
        { provide: SettingsDbService, useValue: settingsDbServiceStub },
        { provide: AssessmentDbService, useValue: assessmentDbServiceStub },
        { provide: CompareService, useValue: compareServiceStub },
        { provide: ConvertFsatService, useValue: convertFsatServiceStub },
        { provide: AnalyticsService, useValue: { sendEvent: jasmine.createSpy('sendEvent') } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FsatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('save', () => {
    it('persists the fsat and flags modificationExists false when there are no modifications', async () => {
      const fsat: FSAT = getFsat([]);
      await component.save(fsat);

      expect(component.modificationExists).toBe(false);
      expect(fsatServiceStub.modificationExists.getValue()).toBe(false);
      expect(assessmentDbServiceStub.updateWithObservable).toHaveBeenCalled();
      expect(assessmentDbServiceStub.setAll).toHaveBeenCalledWith([assessment]);
      expect(fsatServiceStub.updateData.getValue()).toBe(true);
    });

    it('flags modificationExists true and re-derives compare values when modifications exist', async () => {
      const mod: Modification = { id: '1', fsat: { name: 'Scenario 1' } } as Modification;
      const fsat: FSAT = getFsat([mod]);
      component.modificationIndex = 0;

      await component.save(fsat);

      expect(component.modificationExists).toBe(true);
      expect(compareServiceStub.setCompareVals).toHaveBeenCalledWith(fsat, 0);
    });
  });

  describe('saveNewMod', () => {
    it('appends the modification, selects it, and saves through FsatService.setFsat', () => {
      const current: FSAT = getFsat([]);
      fsatServiceStub.fsat.next(current);
      const newMod: Modification = { id: '2', fsat: { name: 'Scenario 1' } } as Modification;

      component.saveNewMod(newMod);

      expect(component.modificationIndex).toBe(0);
      expect(fsatServiceStub.modificationIndex.getValue()).toBe(0);
      expect(fsatServiceStub.setFsat).toHaveBeenCalledWith(jasmine.objectContaining({ modifications: [newMod] }));
    });
  });

  describe('selectUpdateAction', () => {
    it('converts existing data through ConvertFsatService when shouldUpdateData is true', () => {
      spyOn(component, 'save');
      component.selectUpdateAction(true);

      expect(convertFsatServiceStub.convertExistingData).toHaveBeenCalled();
      expect(fsatServiceStub.setFsat).toHaveBeenCalled();
      expect(component.save).not.toHaveBeenCalled();
    });

    it('saves the current fsat as-is when shouldUpdateData is false', () => {
      spyOn(component, 'save');
      component.selectUpdateAction(false);

      expect(convertFsatServiceStub.convertExistingData).not.toHaveBeenCalled();
      expect(component.save).toHaveBeenCalledWith(component.fsat);
    });
  });

  describe('getCanContinue', () => {
    it('delegates to FsatService.getCanContinueFromStep with the current fsat and settings', () => {
      const result: boolean = component.getCanContinue();

      expect(fsatServiceStub.getCanContinueFromStep).toHaveBeenCalledWith(component.fsat, component.settings);
      expect(result).toBe(true);
    });
  });

  describe('modalOpen aggregation', () => {
    it('opens the Select Scenario modal through FsatService.modalOpen', () => {
      component.selectModificationModal();

      expect(fsatServiceStub.modalOpen.getValue()).toBe(true);
      expect(component.modListOpen).toBe(true);
    });

    it('closes the Select Scenario modal and requests an update', () => {
      component.selectModificationModal();
      component.closeSelectModification();

      expect(fsatServiceStub.modalOpen.getValue()).toBe(false);
      expect(component.modListOpen).toBe(false);
      expect(fsatServiceStub.updateData.getValue()).toBe(true);
    });

    it('checkShowWelcomeScreen opens the welcome modal when the tutorial has not been dismissed', () => {
      settingsDbServiceStub.globalSettings.disableFansTutorial = false;

      component.checkShowWelcomeScreen();

      expect(component.showWelcomeScreen).toBe(true);
      expect(fsatServiceStub.modalOpen.getValue()).toBe(true);
    });

    it('closeWelcomeScreen persists globalSettings and closes the modal', async () => {
      await component.closeWelcomeScreen();

      expect(settingsDbServiceStub.globalSettings.disableFansTutorial).toBe(true);
      expect(settingsDbServiceStub.updateWithObservable).toHaveBeenCalledWith(settingsDbServiceStub.globalSettings);
      expect(component.showWelcomeScreen).toBe(false);
      expect(fsatServiceStub.modalOpen.getValue()).toBe(false);
    });
  });
});

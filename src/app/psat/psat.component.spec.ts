import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BehaviorSubject, of } from 'rxjs';

import { PsatComponent } from './psat.component';
import { AssessmentService } from '../dashboard/assessment.service';
import { PsatService } from './psat.service';
import { PsatIntegrationService } from '../shared/connected-inventory/psat-integration.service';
import { IntegrationStateService } from '../shared/connected-inventory/integration-state.service';
import { PumpOperationsService } from './pump-operations/pump-operations.service';
import { CompareService } from './compare.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { PsatTabService } from './psat-tab.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { SettingsService } from '../settings/settings.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { ConnectedInventoryData } from '../shared/connected-inventory/integrations';
import { Assessment } from '../shared/models/assessment';
import { PSAT, Modification, PsatInputs, PsatOutputs } from '../shared/models/psat';
import { Settings } from '../shared/models/settings';

const MOCK_SETTINGS: Settings = { unitsOfMeasure: 'Imperial', powerMeasurement: 'kW' } as Settings;

function makePsat(overrides: Partial<PSAT> = {}): PSAT {
  return {
    inputs: {} as PsatInputs,
    modifications: [],
    ...overrides,
  };
}

function makeAssessment(psat: PSAT = makePsat()): Assessment {
  return { id: 1, name: 'Test PSAT Assessment', type: 'PSAT', psat };
}

function makeModification(name: string = 'Scenario 1'): Modification {
  return { id: 'mod-1', psat: { name, inputs: {} as PsatInputs }, notes: undefined };
}

function makeEmptyConnectedInventoryData(): ConnectedInventoryData {
  return { connectedItem: undefined };
}

// A form the getCanContinue() branches accept as either valid or invalid, regardless of its controls.
function makeForm(valid: boolean): UntypedFormGroup {
  return new UntypedFormGroup({
    x: new UntypedFormControl(valid ? 1 : null, valid ? [] : [Validators.required]),
  });
}

describe('PsatComponent', () => {
  let component: PsatComponent;
  let fixture: ComponentFixture<PsatComponent>;

  let assessmentServiceSpy: jasmine.SpyObj<AssessmentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatIntegrationServiceSpy: jasmine.SpyObj<PsatIntegrationService>;
  let integrationStateServiceSpy: jasmine.SpyObj<IntegrationStateService>;
  let pumpOperationsServiceSpy: jasmine.SpyObj<PumpOperationsService>;
  let activatedRouteMock: { params: BehaviorSubject<{ id: string }>; snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let assessmentDbServiceSpy: jasmine.SpyObj<AssessmentDbService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let fieldDataServiceSpy: jasmine.SpyObj<FieldDataService>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  let mockAssessment: Assessment;

  beforeEach(async () => {
    mockAssessment = makeAssessment();

    assessmentServiceSpy = jasmine.createSpyObj('AssessmentService', ['getStartingTab']);
    assessmentServiceSpy.getStartingTab.and.returnValue(undefined);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    psatServiceSpy = jasmine.createSpyObj(
      'PsatService',
      ['resultsExisting', 'convertExistingData'],
      {
        modalOpen: new BehaviorSubject<boolean>(false),
        getResults: new BehaviorSubject<boolean>(true),
      }
    );
    psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 80 } as PsatOutputs);
    psatServiceSpy.convertExistingData.and.callFake((psat: PSAT) => psat);

    psatIntegrationServiceSpy = jasmine.createSpyObj('PsatIntegrationService', [
      'setPSATConnectedInventoryData', 'restoreConnectedAssessmentValues', 'checkConnectedInventoryDiffers',
    ]);
    psatIntegrationServiceSpy.restoreConnectedAssessmentValues.and.callFake((_data: ConnectedInventoryData, psat: PSAT) => psat);

    integrationStateServiceSpy = jasmine.createSpyObj(
      'IntegrationStateService',
      ['getEmptyConnectedInventoryData'],
      { connectedInventoryData: new BehaviorSubject<ConnectedInventoryData>(makeEmptyConnectedInventoryData()) }
    );
    integrationStateServiceSpy.getEmptyConnectedInventoryData.and.returnValue(makeEmptyConnectedInventoryData());

    pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj']);
    pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    activatedRouteMock = {
      params: new BehaviorSubject({ id: '1' }),
      snapshot: { queryParamMap: convertToParamMap({}) },
    };

    compareServiceSpy = jasmine.createSpyObj(
      'CompareService',
      ['setCompareVals'],
      {
        selectedModification: new BehaviorSubject<PSAT>(undefined),
        openModificationModal: new BehaviorSubject<boolean>(undefined),
        openNewModal: new BehaviorSubject<boolean>(undefined),
      }
    );
    (compareServiceSpy as any).baselinePSAT = undefined;
    (compareServiceSpy as any).modifiedPSAT = undefined;
    // Mirrors the real service's side effect of pushing the selected modification's psat onto
    // selectedModification — psat.component's selectedModification subscription depends on this to
    // resolve modificationIndex, so a no-op spy would misrepresent real reactive wiring.
    compareServiceSpy.setCompareVals.and.callFake((psat: PSAT, selectedModIndex?: number) => {
      if (psat.modifications && selectedModIndex !== undefined && psat.modifications.length !== 0) {
        compareServiceSpy.selectedModification.next(psat.modifications[selectedModIndex].psat);
      } else {
        compareServiceSpy.selectedModification.next(undefined);
      }
    });

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [
      'getByAssessmentId', 'addWithObservable', 'updateWithObservable', 'getAllSettings', 'setAll',
    ]);
    settingsDbServiceSpy.getByAssessmentId.and.returnValue(MOCK_SETTINGS);
    settingsDbServiceSpy.addWithObservable.and.returnValue(of(MOCK_SETTINGS));
    settingsDbServiceSpy.updateWithObservable.and.returnValue(of(MOCK_SETTINGS));
    settingsDbServiceSpy.getAllSettings.and.returnValue(of([MOCK_SETTINGS]));
    (settingsDbServiceSpy as any).globalSettings = { disablePsatTutorial: true };

    assessmentDbServiceSpy = jasmine.createSpyObj('AssessmentDbService', [
      'findById', 'updateWithObservable', 'getAllAssessments', 'setAll',
    ]);
    assessmentDbServiceSpy.findById.and.returnValue(mockAssessment);
    assessmentDbServiceSpy.updateWithObservable.and.returnValue(of(mockAssessment));
    assessmentDbServiceSpy.getAllAssessments.and.returnValue(of([mockAssessment]));

    psatTabServiceSpy = jasmine.createSpyObj(
      'PsatTabService',
      ['continue', 'back'],
      {
        mainTab: new BehaviorSubject<string>('baseline'),
        secondaryTab: new BehaviorSubject<string>('explore-opportunities'),
        calcTab: new BehaviorSubject<string>('achievable-efficiency'),
        stepTab: new BehaviorSubject<string>('baseline'),
        showExportModal: new BehaviorSubject<boolean>(false),
        modifyConditionsTab: new BehaviorSubject<string>('pump-fluid'),
      }
    );

    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['getFormFromObj']);
    pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    motorServiceSpy = jasmine.createSpyObj('MotorService', ['getFormFromObj']);
    motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj']);
    fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getNewSettingFromSetting', 'setPumpSettingsUnitType']);
    settingsServiceSpy.getNewSettingFromSetting.and.returnValue({ ...MOCK_SETTINGS });
    settingsServiceSpy.setPumpSettingsUnitType.and.returnValue({ ...MOCK_SETTINGS });

    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      imports: [ModalModule.forRoot()],
      declarations: [PsatComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatIntegrationService, useValue: psatIntegrationServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceSpy },
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AssessmentDbService, useValue: assessmentDbServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('sends the view-pump-assessment analytics event', () => {
      fixture.detectChanges();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('view-pump-assessment');
    });

    it('loads the assessment matching the route id and assigns settings and a deep-copied psat', () => {
      fixture.detectChanges();
      expect(assessmentDbServiceSpy.findById).toHaveBeenCalledWith(1);
      expect(component.assessment).toBe(mockAssessment);
      expect(component.settings).toEqual(MOCK_SETTINGS);
      expect(component._psat).toEqual(mockAssessment.psat);
      expect(component._psat).not.toBe(mockAssessment.psat);
    });

    it('redirects to not-found when no assessment matches the route id', () => {
      assessmentDbServiceSpy.findById.and.returnValue(undefined);
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
    });

    it('redirects to not-found when the assessment is not a PSAT assessment', () => {
      assessmentDbServiceSpy.findById.and.returnValue({ ...mockAssessment, type: 'PHAST' } as Assessment);
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
    });

    it('sets modificationExists and modificationIndex from existing modifications', () => {
      // setupDone: true mirrors real saved state — save()'s checkSetupDone() always sets setupDone true
      // once a modification exists, and setCompareVals (called only when setupDone is true) is what
      // re-syncs compareService.selectedModification so the selectedModification subscription doesn't
      // immediately clobber the modificationIndex this method just set.
      assessmentDbServiceSpy.findById.and.returnValue(
        makeAssessment(makePsat({ modifications: [makeModification()], setupDone: true }))
      );
      fixture.detectChanges();
      expect(component.modificationExists).toBeTrue();
      expect(component.modificationIndex).toBe(0);
    });

    it('leaves modificationExists false when there are no modifications', () => {
      fixture.detectChanges();
      expect(component.modificationExists).toBeFalse();
    });

    it('redirects from connected inventory and does not set PSAT connected inventory data when fromConnectedItem is present', () => {
      activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ fromConnectedItem: 'true' });
      fixture.detectChanges();
      expect(psatTabServiceSpy.mainTab.value).toBe('baseline');
      expect(psatTabServiceSpy.stepTab.value).toBe('motor');
      expect(psatIntegrationServiceSpy.setPSATConnectedInventoryData).not.toHaveBeenCalled();
    });

    it('sets PSAT connected inventory data when not redirecting from a connected item', () => {
      fixture.detectChanges();
      expect(psatIntegrationServiceSpy.setPSATConnectedInventoryData).toHaveBeenCalledWith(component.assessment, component.settings);
    });

    it('saves when the connectedInventory query param is present', () => {
      activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ connectedInventory: 'true' });
      fixture.detectChanges();
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
    });

    it('sets mainTab from assessmentService.getStartingTab when provided', () => {
      assessmentServiceSpy.getStartingTab.and.returnValue('sankey');
      fixture.detectChanges();
      expect(component.mainTab).toBe('sankey');
    });

    it('shows the welcome screen and opens the modal state when the tutorial has not been dismissed', () => {
      (settingsDbServiceSpy as any).globalSettings = { disablePsatTutorial: false };
      fixture.detectChanges();
      expect(component.showWelcomeScreen).toBeTrue();
      expect(component.isModalOpen).toBeTrue();
    });

    it('does not show the welcome screen when the tutorial has already been dismissed', () => {
      fixture.detectChanges();
      expect(component.showWelcomeScreen).toBeFalse();
    });
  });

  describe('observeMainTabChange', () => {
    beforeEach(() => fixture.detectChanges());

    it('switches secondaryTab to system-curve when mainTab becomes diagram', () => {
      psatTabServiceSpy.mainTab.next('diagram');
      expect(psatTabServiceSpy.secondaryTab.value).toBe('system-curve');
    });

    it('switches secondaryTab to explore-opportunities when mainTab becomes assessment from an unrelated tab', () => {
      component.currentTab = 'other';
      psatTabServiceSpy.mainTab.next('assessment');
      expect(psatTabServiceSpy.secondaryTab.value).toBe('explore-opportunities');
    });

    it('leaves secondaryTab alone when mainTab becomes assessment while already on modify-conditions', () => {
      component.currentTab = 'modify-conditions';
      psatTabServiceSpy.secondaryTab.next('modify-conditions');
      psatTabServiceSpy.mainTab.next('assessment');
      expect(psatTabServiceSpy.secondaryTab.value).toBe('modify-conditions');
    });
  });

  describe('observeSecondaryTabChange', () => {
    it('sets currentTab from the secondaryTab subject', () => {
      fixture.detectChanges();
      psatTabServiceSpy.secondaryTab.next('modify-conditions');
      expect(component.currentTab).toBe('modify-conditions');
    });
  });

  describe('observeCalcTabChange', () => {
    it('sets calcTab from the psatTabService calcTab subject', () => {
      fixture.detectChanges();
      psatTabServiceSpy.calcTab.next('motor-performance');
      expect(component.calcTab).toBe('motor-performance');
    });
  });

  describe('observeSelectedModificationChange', () => {
    it('sets modificationIndex to the matching modification index when a modification is selected', () => {
      assessmentDbServiceSpy.findById.and.returnValue(
        makeAssessment(makePsat({ modifications: [makeModification('Scenario 1'), makeModification('Scenario 2')] }))
      );
      fixture.detectChanges();
      compareServiceSpy.selectedModification.next({ name: 'Scenario 2' } as PSAT);
      expect(component.modificationIndex).toBe(1);
    });

    it('clears modificationIndex when no modification is selected', () => {
      fixture.detectChanges();
      compareServiceSpy.selectedModification.next(undefined);
      expect(component.modificationIndex).toBeUndefined();
    });
  });

  describe('observeModificationModalChange', () => {
    it('opens the change modification modal when openModificationModal becomes true', () => {
      fixture.detectChanges();
      component.changeModificationModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      compareServiceSpy.openModificationModal.next(true);
      expect(component.modificationModalOpen).toBeTrue();
      expect(component.modListOpen).toBeTrue();
      expect(component.changeModificationModal.show).toHaveBeenCalled();
    });

    it('does not open the modal when openModificationModal becomes false', () => {
      fixture.detectChanges();
      component.changeModificationModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      compareServiceSpy.openModificationModal.next(false);
      expect(component.modificationModalOpen).toBeFalse();
      expect(component.changeModificationModal.show).not.toHaveBeenCalled();
    });
  });

  describe('observeNewModalChange', () => {
    it('opens the add-new modal when openNewModal becomes true', () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      compareServiceSpy.openNewModal.next(true);
      expect(component.showAdd).toBeTrue();
      expect(component.addNewModal.show).toHaveBeenCalled();
    });

    it('does not open the modal when openNewModal becomes false', () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      compareServiceSpy.openNewModal.next(false);
      expect(component.showAdd).toBeFalse();
      expect(component.addNewModal.show).not.toHaveBeenCalled();
    });
  });

  describe('observeConnectedInventoryDataChange', () => {
    it('restores connected values and saves when shouldRestoreConnectedValues is true', () => {
      fixture.detectChanges();
      assessmentDbServiceSpy.updateWithObservable.calls.reset();

      integrationStateServiceSpy.connectedInventoryData.next({ connectedItem: undefined, shouldRestoreConnectedValues: true });

      expect(psatIntegrationServiceSpy.restoreConnectedAssessmentValues).toHaveBeenCalled();
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
    });

    it('does not restore or save when shouldRestoreConnectedValues is false', () => {
      fixture.detectChanges();
      assessmentDbServiceSpy.updateWithObservable.calls.reset();

      integrationStateServiceSpy.connectedInventoryData.next({ connectedItem: undefined, shouldRestoreConnectedValues: false });

      expect(psatIntegrationServiceSpy.restoreConnectedAssessmentValues).not.toHaveBeenCalled();
      expect(assessmentDbServiceSpy.updateWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('observeStepTabChange', () => {
    it('sets stepTab from the psatTabService stepTab subject', () => {
      fixture.detectChanges();
      psatTabServiceSpy.stepTab.next('motor');
      expect(component.stepTab).toBe('motor');
    });

    it('checks for connected inventory differences when the connected item is a pump', () => {
      assessmentDbServiceSpy.findById.and.returnValue(
        makeAssessment(makePsat({ connectedItem: { inventoryType: 'pump' } as any }))
      );
      fixture.detectChanges();
      psatIntegrationServiceSpy.checkConnectedInventoryDiffers.calls.reset();

      psatTabServiceSpy.stepTab.next('motor');
      expect(psatIntegrationServiceSpy.checkConnectedInventoryDiffers).toHaveBeenCalledWith(component.assessment);
    });
  });

  describe('observeModalOpenChange', () => {
    it('sets isModalOpen from the psatService modalOpen subject', () => {
      fixture.detectChanges();
      psatServiceSpy.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });
  });

  describe('observeShowExportModalChange', () => {
    it('sets showExportModal from the psatTabService showExportModal subject', () => {
      fixture.detectChanges();
      psatTabServiceSpy.showExportModal.next(true);
      expect(component.showExportModal).toBeTrue();
    });
  });

  describe('continue', () => {
    it('delegates to psatTabService.continue', () => {
      fixture.detectChanges();
      component.continue();
      expect(psatTabServiceSpy.continue).toHaveBeenCalled();
    });
  });

  describe('back', () => {
    it('delegates to psatTabService.back', () => {
      fixture.detectChanges();
      component.back();
      expect(psatTabServiceSpy.back).toHaveBeenCalled();
    });
  });

  describe('setSankeyLabelStyle', () => {
    it('sets sankeyLabelStyle to the given style', () => {
      fixture.detectChanges();
      component.setSankeyLabelStyle('percent');
      expect(component.sankeyLabelStyle).toBe('percent');
    });
  });

  describe('setSmallScreenTab', () => {
    it('sets smallScreenTab to the given tab', () => {
      fixture.detectChanges();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('closeExportModal', () => {
    it('pushes the given value to psatTabService.showExportModal', () => {
      fixture.detectChanges();
      component.closeExportModal(true);
      expect(psatTabServiceSpy.showExportModal.value).toBeTrue();
      expect(component.showExportModal).toBeTrue();
    });
  });

  describe('selectModificationModal', () => {
    it('opens the modal state and shows the change modification modal', () => {
      fixture.detectChanges();
      component.changeModificationModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      component.selectModificationModal();
      expect(component.isModalOpen).toBeTrue();
      expect(component.modListOpen).toBeTrue();
      expect(component.changeModificationModal.show).toHaveBeenCalled();
    });
  });

  describe('closeSelectModification', () => {
    it('closes the modal state and hides the change modification modal', () => {
      fixture.detectChanges();
      component.changeModificationModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      component.isModalOpen = true;
      component.modListOpen = true;

      component.closeSelectModification();

      expect(component.isModalOpen).toBeFalse();
      expect(component.modListOpen).toBeFalse();
      expect(compareServiceSpy.openModificationModal.value).toBeFalse();
      expect(component.changeModificationModal.hide).toHaveBeenCalled();
    });
  });

  describe('showAddNewModal', () => {
    it('opens the modal state and shows the add-new modal', () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      component.showAddNewModal();
      expect(component.isModalOpen).toBeTrue();
      expect(component.addNewModal.show).toHaveBeenCalled();
    });
  });

  describe('closeAddNewModal', () => {
    it('closes the modal state and hides the add-new modal', () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      component.isModalOpen = true;

      component.closeAddNewModal();

      expect(component.isModalOpen).toBeFalse();
      expect(compareServiceSpy.openNewModal.value).toBeFalse();
      expect(component.addNewModal.hide).toHaveBeenCalled();
    });
  });

  describe('saveNewMod', () => {
    it('appends the modification, updates compare values, and saves', async () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      const modification = makeModification('New Scenario');

      await component.saveNewMod(modification);

      expect(component._psat.modifications).toContain(modification);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component._psat, 0);
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
    });
  });

  describe('addNewMod', () => {
    it('gets baseline results and uses pump_efficiency as pump_specified on the new modification', async () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 42 } as PsatOutputs);

      await component.addNewMod();

      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledWith(component._psat.inputs, component.settings);
      const added = component._psat.modifications[component._psat.modifications.length - 1];
      expect(added.psat.inputs.pump_specified).toBe(42);
      expect(added.psat.inputs.whatIfScenario).toBeTrue();
    });

    it('reflects a different pump_efficiency the next time it is called', async () => {
      fixture.detectChanges();
      component.addNewModal = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);

      psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 10 } as PsatOutputs);
      await component.addNewMod();
      psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 99 } as PsatOutputs);
      await component.addNewMod();

      const added = component._psat.modifications[component._psat.modifications.length - 1];
      expect(added.psat.inputs.pump_specified).toBe(99);
    });
  });

  describe('save', () => {
    it('persists the psat, refreshes the assessment list, and signals new results', async () => {
      fixture.detectChanges();
      await component.save();

      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
      expect(assessmentDbServiceSpy.getAllAssessments).toHaveBeenCalled();
      expect(assessmentDbServiceSpy.setAll).toHaveBeenCalledWith([mockAssessment]);
    });

    it('sets modificationExists based on the current modifications length', async () => {
      fixture.detectChanges();
      component._psat.modifications.push(makeModification());
      await component.save();
      expect(component.modificationExists).toBeTrue();
    });
  });

  describe('savePsat', () => {
    it('replaces _psat with the given value and saves', async () => {
      fixture.detectChanges();
      const newPsat = makePsat({ name: 'Replacement' });
      component.savePsat(newPsat);
      await fixture.whenStable();
      expect(component._psat).toBe(newPsat);
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
    });
  });

  describe('goToReport', () => {
    it('pushes report to psatTabService.mainTab', () => {
      fixture.detectChanges();
      component.goToReport();
      expect(psatTabServiceSpy.mainTab.value).toBe('report');
    });
  });

  describe('selectUpdateAction', () => {
    it('calls updateData and closes with updated=true when shouldUpdateData is true', async () => {
      fixture.detectChanges();
      component.oldSettings = { ...MOCK_SETTINGS, unitsOfMeasure: 'Metric' } as Settings;

      await component.selectUpdateAction(true);

      expect(psatServiceSpy.convertExistingData).toHaveBeenCalled();
      expect(component.showUpdateUnitsModal).toBeFalse();
      expect(psatTabServiceSpy.mainTab.value).toBe('baseline');
      expect(psatTabServiceSpy.stepTab.value).toBe('baseline');
    });

    it('calls save and closes with updated=false when shouldUpdateData is false', async () => {
      fixture.detectChanges();
      assessmentDbServiceSpy.updateWithObservable.calls.reset();

      await component.selectUpdateAction(false);

      expect(psatServiceSpy.convertExistingData).not.toHaveBeenCalled();
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
      expect(component.showUpdateUnitsModal).toBeFalse();
    });
  });

  describe('updateData', () => {
    it('converts the existing data to the new settings units and saves', async () => {
      fixture.detectChanges();
      component.oldSettings = { ...MOCK_SETTINGS, unitsOfMeasure: 'Metric' } as Settings;

      await component.updateData();

      expect(psatServiceSpy.convertExistingData).toHaveBeenCalledWith(component._psat, component.oldSettings, component.settings);
      expect(component._psat.existingDataUnits).toBe(component.settings.unitsOfMeasure);
      expect(assessmentDbServiceSpy.updateWithObservable).toHaveBeenCalled();
    });
  });

  describe('closeWelcomeScreen', () => {
    it('marks the tutorial dismissed and hides the welcome screen', async () => {
      (settingsDbServiceSpy as any).globalSettings = { disablePsatTutorial: false };
      fixture.detectChanges();
      expect(component.showWelcomeScreen).toBeTrue();

      await component.closeWelcomeScreen();

      expect((settingsDbServiceSpy as any).globalSettings.disablePsatTutorial).toBeTrue();
      expect(settingsDbServiceSpy.updateWithObservable).toHaveBeenCalled();
      expect(component.showWelcomeScreen).toBeFalse();
      expect(psatServiceSpy.modalOpen.value).toBeFalse();
    });
  });

  describe('initUpdateUnitsModal', () => {
    it('stores the old settings and opens the update units modal', () => {
      fixture.detectChanges();
      const oldSettings = { ...MOCK_SETTINGS, unitsOfMeasure: 'Metric' } as Settings;
      component.initUpdateUnitsModal(oldSettings);
      expect(component.oldSettings).toBe(oldSettings);
      expect(component.showUpdateUnitsModal).toBeTrue();
    });
  });

  describe('closeUpdateUnitsModal', () => {
    it('resets to the baseline tab when updated is true', () => {
      fixture.detectChanges();
      component.showUpdateUnitsModal = true;
      component.closeUpdateUnitsModal(true);
      expect(psatTabServiceSpy.mainTab.value).toBe('baseline');
      expect(psatTabServiceSpy.stepTab.value).toBe('baseline');
      expect(component.showUpdateUnitsModal).toBeFalse();
    });

    it('leaves tabs untouched when updated is not passed', () => {
      fixture.detectChanges();
      psatTabServiceSpy.mainTab.next('assessment');
      component.showUpdateUnitsModal = true;
      component.closeUpdateUnitsModal();
      expect(psatTabServiceSpy.mainTab.value).toBe('assessment');
      expect(component.showUpdateUnitsModal).toBeFalse();
    });
  });

  describe('getCanContinue', () => {
    it('returns true when stepTab is baseline', () => {
      fixture.detectChanges();
      component.stepTab = 'baseline';
      expect(component.getCanContinue()).toBeTrue();
    });

    it('returns the operations form validity when stepTab is operations', () => {
      fixture.detectChanges();
      component.stepTab = 'operations';
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      expect(component.getCanContinue()).toBeFalse();

      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      expect(component.getCanContinue()).toBeTrue();
    });

    it('returns the pump-fluid form validity when stepTab is pump-fluid', () => {
      fixture.detectChanges();
      component.stepTab = 'pump-fluid';
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      expect(component.getCanContinue()).toBeFalse();
    });

    it('returns the motor form validity when stepTab is motor', () => {
      fixture.detectChanges();
      component.stepTab = 'motor';
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      expect(component.getCanContinue()).toBeFalse();
    });

    it('returns the field-data form validity when stepTab is field-data', () => {
      fixture.detectChanges();
      component.stepTab = 'field-data';
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      expect(component.getCanContinue()).toBeFalse();
    });
  });

  describe('template visibility', () => {
    describe('main container', () => {
      it('hides the psat container when there is no assessment or settings', () => {
        assessmentDbServiceSpy.findById.and.returnValue(undefined);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.psat-container')).toBeNull();
      });

      it('shows the psat container when assessment and settings are set', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.psat-container')).not.toBeNull();
      });
    });

    describe('psat tabs', () => {
      it('shows app-psat-tabs when mainTab is baseline', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-psat-tabs')).not.toBeNull();
      });

      it('hides app-psat-tabs when mainTab is diagram', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('diagram');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-psat-tabs')).toBeNull();
      });
    });

    describe('mainTab switching', () => {
      it('shows the baseline container and hides the others by default', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.assessment-container')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-psat-diagram')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-psat-sankey')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-psat-report')).toBeNull();
      });

      it('shows the diagram container and hides baseline when mainTab is diagram', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('diagram');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-psat-diagram')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.assessment-container')).toBeNull();
      });

      it('shows the sankey container and hides baseline when mainTab is sankey', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('sankey');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-psat-sankey')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.assessment-container')).toBeNull();
      });

      it('shows the report container and hides baseline when mainTab is report', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('report');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-psat-report')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.assessment-container')).toBeNull();
      });

      it('shows the calculators container and hides baseline when mainTab is calculators', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('calculators');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-achievable-efficiency')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.assessment-container')).toBeNull();
      });
    });

    describe('small-tab-select', () => {
      it('hides the small tab select when mainTab is not baseline', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('assessment');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.small-tab-select')).toBeNull();
      });

      it('shows the small tab select when mainTab is baseline', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.small-tab-select')).not.toBeNull();
      });

      it('labels the first nav item for the current stepTab', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('motor');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.small-tab-select .nav-link').textContent).toBe('Motor');
      });

      it('shows Details instead of Help when stepTab is field-data', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('field-data');
        fixture.detectChanges();
        const labels = fixture.nativeElement.querySelectorAll('.small-tab-select .nav-link');
        expect(labels[1].textContent).toBe('Details');
      });

      it('shows Help when stepTab is not field-data', () => {
        fixture.detectChanges();
        const labels = fixture.nativeElement.querySelectorAll('.small-tab-select .nav-link');
        expect(labels[1].textContent).toBe('Help');
      });
    });

    describe('baseline stepTab content', () => {
      it('shows system-basics and integrate-pump-inventory by default (stepTab baseline, no connected motor)', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-system-basics')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-integrate-pump-inventory')).not.toBeNull();
      });

      it('hides integrate-pump-inventory when a motor item is already connected', () => {
        assessmentDbServiceSpy.findById.and.returnValue(
          makeAssessment(makePsat({ connectedItem: { inventoryType: 'motor' } as any }))
        );
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-integrate-pump-inventory')).toBeNull();
      });

      it('shows app-pump-operations and hides system-basics when stepTab is operations', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('operations');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-pump-operations')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-system-basics')).toBeNull();
      });

      it('shows app-pump-fluid when stepTab is pump-fluid', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('pump-fluid');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-pump-fluid')).not.toBeNull();
      });

      it('shows app-motor when stepTab is motor', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('motor');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-motor')).not.toBeNull();
      });

      it('shows app-field-data when stepTab is field-data', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('field-data');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-field-data')).not.toBeNull();
      });
    });

    describe('assessment tab content', () => {
      beforeEach(() => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('assessment');
      });

      it('shows explore-opportunities and hides modify-conditions on the explore-opportunities tab', () => {
        psatTabServiceSpy.secondaryTab.next('explore-opportunities');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-explore-opportunities')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-modify-conditions')).toBeNull();
      });

      it('shows modify-conditions and hides explore-opportunities on the modify-conditions tab', () => {
        psatTabServiceSpy.secondaryTab.next('modify-conditions');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-modify-conditions')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-explore-opportunities')).toBeNull();
      });

      it('hides the assessment tab container entirely while the modification modal is open', () => {
        psatTabServiceSpy.secondaryTab.next('explore-opportunities');
        component.modificationModalOpen = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-explore-opportunities')).toBeNull();
      });
    });

    describe('calculators tab content', () => {
      beforeEach(() => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('calculators');
      });

      it('hides all calculators when calcTab does not match any known calculator', () => {
        psatTabServiceSpy.calcTab.next('unknown');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-achievable-efficiency')).toBeNull();
        expect(fixture.nativeElement.querySelector('app-motor-performance')).toBeNull();
      });

      it('shows achievable-efficiency when calcTab is achievable-efficiency', () => {
        psatTabServiceSpy.calcTab.next('achievable-efficiency');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-achievable-efficiency')).not.toBeNull();
      });

      it('shows motor-performance when calcTab is motor-performance', () => {
        psatTabServiceSpy.calcTab.next('motor-performance');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-motor-performance')).not.toBeNull();
      });

      it('shows nema-energy-efficiency when calcTab is nema-energy-efficiency', () => {
        psatTabServiceSpy.calcTab.next('nema-energy-efficiency');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-nema-energy-efficiency')).not.toBeNull();
      });

      it('shows specific-speed when calcTab is specific-speed', () => {
        psatTabServiceSpy.calcTab.next('specific-speed');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-specific-speed')).not.toBeNull();
      });

      it('shows the pump curve when calcTab is pump-curve', () => {
        psatTabServiceSpy.calcTab.next('pump-curve');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-system-and-equipment-curve')).not.toBeNull();
      });

      it('shows the unit converter when calcTab is convert-units', () => {
        psatTabServiceSpy.calcTab.next('convert-units');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-unit-converter')).not.toBeNull();
      });
    });

    describe('sankey tab content', () => {
      it('hides the label options nav when showSankeyLabelOptions is false', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('sankey');
        component.showSankeyLabelOptions = false;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.btn-group')).toBeNull();
      });

      it('shows the label options nav when showSankeyLabelOptions is true', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('sankey');
        component.showSankeyLabelOptions = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.btn-group')).not.toBeNull();
      });

      it('shows the psat select dropdown with a single option when there is only one psat option', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('sankey');
        component.showSankeyLabelOptions = true;
        fixture.detectChanges();
        const select = fixture.nativeElement.querySelector('#psatSelect');
        expect(select).not.toBeNull();
        expect(select.querySelectorAll('option').length).toBe(1);
      });

      it('shows the psat select dropdown with one option per psatOptions entry when there is more than one', () => {
        assessmentDbServiceSpy.findById.and.returnValue(makeAssessment(makePsat({ modifications: [makeModification()] })));
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('sankey');
        component.showSankeyLabelOptions = true;
        fixture.detectChanges();
        const select = fixture.nativeElement.querySelector('#psatSelect');
        expect(select).not.toBeNull();
        expect(select.querySelectorAll('option').length).toBe(2);
      });
    });

    describe('footer', () => {
      it('hides the footer when mainTab is diagram', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('diagram');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer')).toBeNull();
      });

      it('shows the footer when mainTab is baseline', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer')).not.toBeNull();
      });

      it('hides the Back button when stepTab is baseline and mainTab is baseline', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer .pull-left')).toBeNull();
      });

      it('shows the Back button when stepTab is not baseline', () => {
        fixture.detectChanges();
        psatTabServiceSpy.stepTab.next('operations');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer .pull-left')).not.toBeNull();
      });

      it('shows the Next button when mainTab is baseline', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer .pull-right button').textContent.trim()).toBe('Next');
      });

      it('shows the View Report button when mainTab is assessment', () => {
        fixture.detectChanges();
        psatTabServiceSpy.mainTab.next('assessment');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.footer .pull-right button').textContent.trim()).toBe('View Report');
      });
    });

    describe('modals', () => {
      it('shows the change-modification modal wrapper by default (psat has a modifications array)', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[aria-labelledby="changeModificationModalLabel"]')).not.toBeNull();
      });

      it('hides the change-modification modal wrapper when _psat has no modifications array', () => {
        fixture.detectChanges();
        component._psat.modifications = undefined;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[aria-labelledby="changeModificationModalLabel"]')).toBeNull();
      });

      it('hides app-modification-list when modListOpen is false', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-modification-list')).toBeNull();
      });

      it('shows app-modification-list when modListOpen is true', () => {
        fixture.detectChanges();
        component.modListOpen = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-modification-list')).not.toBeNull();
      });

      it('hides app-add-modification when showAdd is false', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-add-modification')).toBeNull();
      });

      it('shows app-add-modification when showAdd is true', () => {
        fixture.detectChanges();
        component.showAdd = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-add-modification')).not.toBeNull();
      });

      it('hides app-update-units-modal when showUpdateUnitsModal is false', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-update-units-modal')).toBeNull();
      });

      it('shows app-update-units-modal when showUpdateUnitsModal is true', () => {
        fixture.detectChanges();
        component.showUpdateUnitsModal = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-update-units-modal')).not.toBeNull();
      });

      it('hides app-welcome-screen when showWelcomeScreen is false', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-welcome-screen')).toBeNull();
      });

      it('shows app-welcome-screen when showWelcomeScreen is true', () => {
        fixture.detectChanges();
        component.showWelcomeScreen = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-welcome-screen')).not.toBeNull();
      });

      it('hides app-export-modal when showExportModal is false', () => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-export-modal')).toBeNull();
      });

      it('shows app-export-modal when showExportModal is true', () => {
        fixture.detectChanges();
        component.showExportModal = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-export-modal')).not.toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops reacting to psatTabService.mainTab after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatTabServiceSpy.mainTab.next('sankey');
      expect(component.mainTab).toBe('baseline');
    });

    it('stops reacting to psatTabService.secondaryTab after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatTabServiceSpy.secondaryTab.next('modify-conditions');
      expect(component.currentTab).toBe('explore-opportunities');
    });

    it('stops reacting to psatTabService.calcTab after destroy', () => {
      fixture.detectChanges();
      const calcTabBefore = component.calcTab;
      fixture.destroy();
      psatTabServiceSpy.calcTab.next('motor-performance');
      expect(component.calcTab).toBe(calcTabBefore);
    });

    it('stops reacting to compareService.selectedModification after destroy', () => {
      fixture.detectChanges();
      const indexBefore = component.modificationIndex;
      fixture.destroy();
      compareServiceSpy.selectedModification.next({ name: 'Scenario 2' } as PSAT);
      expect(component.modificationIndex).toBe(indexBefore);
    });

    it('stops reacting to psatTabService.stepTab after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatTabServiceSpy.stepTab.next('motor');
      expect(component.stepTab).toBe('baseline');
    });

    it('stops reacting to psatTabService.showExportModal after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatTabServiceSpy.showExportModal.next(true);
      expect(component.showExportModal).toBeFalse();
    });

    it('resets shared tab state on the psatTabService and compareService', () => {
      fixture.detectChanges();
      fixture.destroy();
      expect(psatTabServiceSpy.secondaryTab.value).toBe('explore-opportunities');
      expect(psatTabServiceSpy.mainTab.value).toBe('baseline');
      expect(psatTabServiceSpy.stepTab.value).toBe('baseline');
      expect(psatTabServiceSpy.modifyConditionsTab.value).toBe('pump-fluid');
      expect(compareServiceSpy.selectedModification.value).toBeUndefined();
      expect((compareServiceSpy as any).baselinePSAT).toBeUndefined();
      expect((compareServiceSpy as any).modifiedPSAT).toBeUndefined();
    });

    it('resets connectedInventoryData to an empty value on destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      expect(integrationStateServiceSpy.connectedInventoryData.value).toEqual(makeEmptyConnectedInventoryData());
    });

    it('stops reacting to integrationStateService.connectedInventoryData after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatIntegrationServiceSpy.restoreConnectedAssessmentValues.calls.reset();
      // ngOnDestroy itself pushes one value (the empty-data reset above); this pushes a second, distinct value
      // to prove the component's own subscription is gone, not just coincidentally unaffected by the reset value.
      integrationStateServiceSpy.connectedInventoryData.next({ connectedItem: undefined, shouldRestoreConnectedValues: true });
      expect(psatIntegrationServiceSpy.restoreConnectedAssessmentValues).not.toHaveBeenCalled();
    });

    it('stops reacting to compareService.openModificationModal after destroy', () => {
      fixture.detectChanges();
      const modalOpenBefore = component.modificationModalOpen;
      fixture.destroy();
      compareServiceSpy.openModificationModal.next(true);
      expect(component.modificationModalOpen).toBe(modalOpenBefore);
    });

    it('stops reacting to compareService.openNewModal after destroy', () => {
      fixture.detectChanges();
      const showAddBefore = component.showAdd;
      fixture.destroy();
      compareServiceSpy.openNewModal.next(true);
      expect(component.showAdd).toBe(showAddBefore);
    });

    it('keeps reacting to psatService.modalOpen after destroy — modalOpenSub is never unsubscribed in ngOnDestroy (real bug)', () => {
      fixture.detectChanges();
      fixture.destroy();
      psatServiceSpy.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });
  });
});

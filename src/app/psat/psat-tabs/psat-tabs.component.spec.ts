import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PsatTabsComponent } from './psat-tabs.component';
import { PsatService } from '../psat.service';
import { PsatWarningService, PumpFluidWarnings, MotorWarnings, FieldDataWarnings, OperationsWarnings } from '../psat-warning.service';
import { PsatTabService } from '../psat-tab.service';
import { CompareService } from '../compare.service';
import { PumpFluidService } from '../pump-fluid/pump-fluid.service';
import { MotorService } from '../motor/motor.service';
import { FieldDataService } from '../field-data/field-data.service';
import { PumpOperationsService } from '../pump-operations/pump-operations.service';
import { PSAT, PsatInputs, Modification } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS: Settings = {} as Settings;

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    operating_hours: 8760,
    fluidType: 'Water',
    fluidTemperature: 60,
    ...overrides,
  };
}

function makePsat(modifications?: Modification[]): PSAT {
  return {
    name: 'Baseline',
    inputs: makePsatInputs(),
    modifications,
  } as PSAT;
}

/** A real UntypedFormGroup, valid or invalid via a required control, matching the shape
 * returned by the *-service.getFormFromObj() methods this component depends on. */
function makeForm(valid: boolean): UntypedFormGroup {
  return new UntypedFormGroup({
    field: new UntypedFormControl(valid ? 'ok' : null, Validators.required),
  });
}

describe('PsatTabsComponent', () => {
  let component: PsatTabsComponent;
  let fixture: ComponentFixture<PsatTabsComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let fieldDataServiceSpy: jasmine.SpyObj<FieldDataService>;
  let pumpOperationsServiceSpy: jasmine.SpyObj<PumpOperationsService>;

  let secondaryTabSubject: BehaviorSubject<string>;
  let calcTabSubject: BehaviorSubject<string>;
  let mainTabSubject: BehaviorSubject<string>;
  let stepTabSubject: BehaviorSubject<string>;
  let selectedModificationSubject: BehaviorSubject<PSAT>;
  let openModificationModalSubject: BehaviorSubject<boolean>;
  let getResultsSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    secondaryTabSubject = new BehaviorSubject<string>('explore-opportunities');
    calcTabSubject = new BehaviorSubject<string>('achievable-efficiency');
    mainTabSubject = new BehaviorSubject<string>('baseline');
    stepTabSubject = new BehaviorSubject<string>('baseline');
    selectedModificationSubject = new BehaviorSubject<PSAT>(undefined);
    openModificationModalSubject = new BehaviorSubject<boolean>(undefined);
    getResultsSubject = new BehaviorSubject<boolean>(true);

    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { getResults: getResultsSubject });

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', [
      'checkPumpOperations', 'checkPumpFluidWarnings', 'checkMotorWarnings', 'checkFieldData', 'checkWarningsExist',
    ]);
    psatWarningServiceSpy.checkPumpOperations.and.returnValue({} as OperationsWarnings);
    psatWarningServiceSpy.checkPumpFluidWarnings.and.returnValue({} as PumpFluidWarnings);
    psatWarningServiceSpy.checkMotorWarnings.and.returnValue({} as MotorWarnings);
    psatWarningServiceSpy.checkFieldData.and.returnValue({} as FieldDataWarnings);
    psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);

    psatTabServiceSpy = jasmine.createSpyObj(
      'PsatTabService',
      ['continue', 'back'],
      {
        secondaryTab: secondaryTabSubject,
        calcTab: calcTabSubject,
        mainTab: mainTabSubject,
        stepTab: stepTabSubject,
      }
    );

    compareServiceSpy = jasmine.createSpyObj(
      'CompareService',
      [],
      {
        selectedModification: selectedModificationSubject,
        openModificationModal: openModificationModalSubject,
      }
    );

    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', ['getFormFromObj']);
    pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    motorServiceSpy = jasmine.createSpyObj('MotorService', ['getFormFromObj']);
    motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj']);
    fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    pumpOperationsServiceSpy = jasmine.createSpyObj('PumpOperationsService', ['getFormFromObj']);
    pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PsatTabsComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: PumpOperationsService, useValue: pumpOperationsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PsatTabsComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.psat = makePsat([]);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets currentTab, calcTab and mainTab from the initial tab-service values', () => {
      expect(component.currentTab).toBe('explore-opportunities');
      expect(component.calcTab).toBe('achievable-efficiency');
      expect(component.mainTab).toBe('baseline');
    });

    it('sets selectedModification from the initial compareService value', () => {
      expect(component.selectedModification).toBeUndefined();
    });

    it('updates currentTab when secondaryTab emits a new value', () => {
      secondaryTabSubject.next('modify-conditions');
      expect(component.currentTab).toBe('modify-conditions');
    });

    it('updates mainTab when mainTab emits a new value', () => {
      mainTabSubject.next('assessment');
      expect(component.mainTab).toBe('assessment');
    });

    it('updates selectedModification when compareService.selectedModification emits', () => {
      const mod = makePsat();
      selectedModificationSubject.next(mod);
      expect(component.selectedModification).toBe(mod);
    });

    it('recomputes tab statuses when psatService.getResults emits a new value', () => {
      psatWarningServiceSpy.checkPumpOperations.calls.reset();
      getResultsSubject.next(false);
      expect(psatWarningServiceSpy.checkPumpOperations).toHaveBeenCalled();
      expect(component.operationsTabStatus).toEqual(['success']);
    });

    it('recomputes tab statuses when stepTab emits a new value', () => {
      stepTabSubject.next('motor');
      expect(component.stepTab).toBe('motor');
      expect(component.motorClassStatus).toContain('active');
    });
  });

  describe('changeTab / changeCalcTab / selectModification', () => {
    it('changeTab updates secondaryTab and collapses the mobile tab menu', () => {
      component.tabsCollapsed = false;

      component.changeTab('modify-conditions');

      expect(secondaryTabSubject.value).toBe('modify-conditions');
      expect(component.tabsCollapsed).toBeTrue();
    });

    it('changeCalcTab updates calcTab and collapses the mobile calc menu', () => {
      component.calcTabsCollapsed = false;

      component.changeCalcTab('motor-performance');

      expect(calcTabSubject.value).toBe('motor-performance');
      expect(component.calcTabsCollapsed).toBeTrue();
    });

    it('selectModification opens the modification modal and collapses the mobile tab menu', () => {
      component.tabsCollapsed = false;

      component.selectModification();

      expect(openModificationModalSubject.value).toBeTrue();
      expect(component.tabsCollapsed).toBeTrue();
    });
  });

  describe('changeSubTab', () => {
    it('navigates directly to operations regardless of validity', () => {
      component.changeSubTab('operations');
      expect(stepTabSubject.value).toBe('operations');
    });

    it('navigates to motor when pump/fluid data is valid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

      component.changeSubTab('motor');

      expect(stepTabSubject.value).toBe('motor');
    });

    it('does not navigate to motor when pump/fluid data is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      stepTabSubject.next('pump-fluid');

      component.changeSubTab('motor');

      expect(stepTabSubject.value).toBe('pump-fluid');
    });

    it('navigates to field-data when motor data is valid', () => {
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));

      component.changeSubTab('field-data');

      expect(stepTabSubject.value).toBe('field-data');
    });

    it('does not navigate to field-data when motor data is invalid', () => {
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      stepTabSubject.next('motor');

      component.changeSubTab('field-data');

      expect(stepTabSubject.value).toBe('motor');
    });
  });

  describe('continue / back', () => {
    it('continue delegates to psatTabService.continue', () => {
      component.continue();
      expect(psatTabServiceSpy.continue).toHaveBeenCalled();
    });

    it('back delegates to psatTabService.back', () => {
      component.back();
      expect(psatTabServiceSpy.back).toHaveBeenCalled();
    });
  });

  describe('collapseTabs / collapseCalcTabs', () => {
    it('collapseTabs toggles tabsCollapsed', () => {
      const before = component.tabsCollapsed;
      component.collapseTabs();
      expect(component.tabsCollapsed).toBe(!before);
    });

    it('collapseCalcTabs toggles calcTabsCollapsed', () => {
      const before = component.calcTabsCollapsed;
      component.collapseCalcTabs();
      expect(component.calcTabsCollapsed).toBe(!before);
    });
  });

  describe('showTooltip / hideTooltip', () => {
    it('shows the badge hover state immediately', () => {
      const badge = { display: false, hover: false };
      component.showTooltip(badge);
      expect(badge.hover).toBeTrue();
    });

    it('reveals the badge display after the hover delay if still hovering', fakeAsync(() => {
      const badge = { display: false, hover: false };
      component.showTooltip(badge);
      tick(1000);
      expect(badge.display).toBeTrue();
    }));

    it('does not reveal the badge display after the delay if hover ended first', fakeAsync(() => {
      const badge = { display: false, hover: false };
      component.showTooltip(badge);
      component.hideTooltip(badge);
      tick(1000);
      expect(badge.display).toBeFalse();
    }));

    it('hideTooltip clears both hover and display immediately', () => {
      const badge = { display: true, hover: true };
      component.hideTooltip(badge);
      expect(badge.hover).toBeFalse();
      expect(badge.display).toBeFalse();
    });
  });

  describe('tab status calculations', () => {
    it('checkSettingsStatus marks settings active and successful when stepTab is baseline', () => {
      component.stepTab = 'baseline';
      component.checkSettingsStatus();
      expect(component.settingsClassStatus).toEqual(['active', 'success']);
    });

    it('checkSettingsStatus marks settings successful without active when stepTab is not baseline', () => {
      component.stepTab = 'motor';
      component.checkSettingsStatus();
      expect(component.settingsClassStatus).toEqual(['success']);
    });

    it('checkOperationsStatus flags missing-data when the operations form is invalid', () => {
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkOperationsStatus();
      expect(component.operationsTabStatus).toContain('missing-data');
    });

    it('checkOperationsStatus flags input-error when valid but warnings exist', () => {
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      psatWarningServiceSpy.checkWarningsExist.and.returnValue(true);
      component.checkOperationsStatus();
      expect(component.operationsTabStatus).toContain('input-error');
    });

    it('checkOperationsStatus flags success when valid and no warnings exist', () => {
      pumpOperationsServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);
      component.checkOperationsStatus();
      expect(component.operationsTabStatus).toEqual(['success']);
    });

    it('checkPumpFluidStatus flags missing-data when the pump/fluid form is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkPumpFluidStatus();
      expect(component.pumpFluidClassStatus).toContain('missing-data');
    });

    it('checkPumpFluidStatus pushes active when stepTab is pump-fluid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      component.stepTab = 'pump-fluid';
      component.checkPumpFluidStatus();
      expect(component.pumpFluidClassStatus).toContain('active');
    });

    it('checkMotorStatus disables the tab when pump/fluid data is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkMotorStatus();
      expect(component.motorClassStatus).toEqual(['disabled']);
    });

    it('checkMotorStatus flags missing-data when pump/fluid is valid but motor data is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkMotorStatus();
      expect(component.motorClassStatus).toContain('missing-data');
    });

    it('checkMotorStatus flags success when both forms are valid and no warnings exist', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);
      component.checkMotorStatus();
      expect(component.motorClassStatus).toEqual(['success']);
    });

    it('checkFieldDataSatus disables the tab when pump/fluid or motor data is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkFieldDataSatus();
      expect(component.fieldDataClassStatus).toEqual(['disabled']);
    });

    it('checkFieldDataSatus flags missing-data when upstream forms are valid but field data is invalid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.checkFieldDataSatus();
      expect(component.fieldDataClassStatus).toContain('missing-data');
    });

    it('checkFieldDataSatus flags success when all forms are valid and no warnings exist', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      motorServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      psatWarningServiceSpy.checkWarningsExist.and.returnValue(false);
      component.checkFieldDataSatus();
      expect(component.fieldDataClassStatus).toEqual(['success']);
    });
  });

  describe('getCanContinue', () => {
    it('returns true when stepTab is baseline', () => {
      component.stepTab = 'baseline';
      expect(component.getCanContinue()).toBeTrue();
    });

    it('returns the pump/fluid form validity when stepTab is pump-fluid', () => {
      pumpFluidServiceSpy.getFormFromObj.and.returnValue(makeForm(false));
      component.stepTab = 'pump-fluid';
      expect(component.getCanContinue()).toBeFalse();
    });

    it('returns the field-data form validity when stepTab is field-data', () => {
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeForm(true));
      component.stepTab = 'field-data';
      expect(component.getCanContinue()).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the baseline progress nav and hides the assessment/calculators sections when mainTab is baseline', () => {
      mainTabSubject.next('baseline');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Assessment Settings');
      expect(fixture.nativeElement.textContent).not.toContain('Explore Opportunities');
      expect(fixture.nativeElement.textContent).not.toContain('Pump Achievable Efficiency');
    });

    it('shows the assessment bar and hides the baseline/calculators sections when mainTab is assessment', () => {
      mainTabSubject.next('assessment');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Explore Opportunities');
      expect(fixture.nativeElement.textContent).not.toContain('Assessment Settings');
      expect(fixture.nativeElement.textContent).not.toContain('Pump Achievable Efficiency');
    });

    it('shows the calculators nav and hides the baseline/assessment sections when mainTab is calculators', () => {
      mainTabSubject.next('calculators');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Pump Achievable Efficiency');
      expect(fixture.nativeElement.textContent).not.toContain('Assessment Settings');
      expect(fixture.nativeElement.textContent).not.toContain('Explore Opportunities');
    });

    it('scopes the mobile pagination to the active stepTab', () => {
      mainTabSubject.next('baseline');
      stepTabSubject.next('motor');
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('ul.pagination');
      expect(pagination.textContent).toContain('Motor');
      expect(pagination.textContent).not.toContain('Operations');
      expect(pagination.textContent).not.toContain('Field Data');
    });

    it('shows the selected modification name when a modification is selected', () => {
      mainTabSubject.next('assessment');
      selectedModificationSubject.next({ name: 'Test Mod' } as PSAT);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Test Mod');
    });

    it('hides the selected modification name when no modification is selected', () => {
      mainTabSubject.next('assessment');
      selectedModificationSubject.next(undefined);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Test Mod');
    });

    it('shows the nested modify-conditions nav only when currentTab is modify-conditions', () => {
      mainTabSubject.next('assessment');
      secondaryTabSubject.next('explore-opportunities');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-modify-conditions-tabs')).toBeNull();

      secondaryTabSubject.next('modify-conditions');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-modify-conditions-tabs')).not.toBeNull();
    });

    it('toggles the collapsed/expanded mobile assessment-tab menu caret', () => {
      mainTabSubject.next('assessment');
      component.tabsCollapsed = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa-caret-down')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-up')).toBeNull();

      component.tabsCollapsed = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa-caret-up')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-down')).toBeNull();
    });

    it('toggles the collapsed/expanded mobile calculators menu caret', () => {
      mainTabSubject.next('calculators');
      component.calcTabsCollapsed = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa-caret-down')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-up')).toBeNull();

      component.calcTabsCollapsed = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fa-caret-up')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.fa-caret-down')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating currentTab after component is destroyed', () => {
      fixture.destroy();
      secondaryTabSubject.next('modify-conditions');
      expect(component.currentTab).not.toBe('modify-conditions');
    });

    it('stops updating calcTab after component is destroyed', () => {
      fixture.destroy();
      calcTabSubject.next('motor-performance');
      expect(component.calcTab).not.toBe('motor-performance');
    });

    it('stops updating mainTab after component is destroyed', () => {
      fixture.destroy();
      mainTabSubject.next('assessment');
      expect(component.mainTab).not.toBe('assessment');
    });

    it('stops updating selectedModification after component is destroyed', () => {
      fixture.destroy();
      selectedModificationSubject.next(makePsat());
      expect(component.selectedModification).toBeUndefined();
    });
  });
});

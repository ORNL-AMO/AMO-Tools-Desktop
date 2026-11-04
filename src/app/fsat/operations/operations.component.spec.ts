import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompareService } from '../compare.service';
import { FanOperationsWarnings, FsatWarningService } from '../fsat-warning.service';
import { FsatService } from '../fsat.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { FSAT, FsatOperations } from '../../shared/models/fans';
import { OperatingHours } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.05 } as Settings;
const MOCK_CO2_DATA = { energyType: 'electricity', totalEmissionOutputRate: 400, electricityUse: 100 } as Co2SavingsData;

function makeOperations(overrides: FsatOperations = {}): FsatOperations {
  return { operatingHours: 4000, cost: 0.1, ...overrides };
}

function makeForm(obj: FsatOperations): UntypedFormGroup {
  return new UntypedFormGroup({
    operatingHours: new UntypedFormControl(obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]),
    cost: new UntypedFormControl(obj.cost, [Validators.required, Validators.min(0)]),
  });
}

describe('OperationsComponent', () => {
  let component: OperationsComponent;
  let fixture: ComponentFixture<OperationsComponent>;
  let showOperationalImpacts: WritableSignal<boolean>;
  let warningServiceSpy: jasmine.SpyObj<FsatWarningService>;
  let co2ServiceSpy: jasmine.SpyObj<AssessmentCo2SavingsService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let operationsServiceSpy: jasmine.SpyObj<OperationsService>;
  let helpPanelServiceSpy: HelpPanelService;
  let fsatServiceSpy: FsatService;
  let totalEmissionOutputRateDifferent: BehaviorSubject<boolean>;
  let currentField: BehaviorSubject<string>;
  let modalOpen: BehaviorSubject<boolean>;

  beforeEach(async () => {
    showOperationalImpacts = signal(false);
    totalEmissionOutputRateDifferent = new BehaviorSubject<boolean>(false);
    currentField = new BehaviorSubject<string>('default');
    modalOpen = new BehaviorSubject<boolean>(false);

    warningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkOperationsWarnings']);
    warningServiceSpy.checkOperationsWarnings.and.returnValue({ costError: null } as FanOperationsWarnings);

    co2ServiceSpy = jasmine.createSpyObj('AssessmentCo2SavingsService', ['getCo2SavingsDataFromSettingsObject']);
    co2ServiceSpy.getCo2SavingsDataFromSettingsObject.and.returnValue(MOCK_CO2_DATA);

    compareServiceSpy = jasmine.createSpyObj('CompareService', ['isTotalEmissionOutputRateDifferent', 'isOperatingHoursDifferent', 'isCostDifferent']);
    Object.assign(compareServiceSpy, { totalEmissionOutputRateDifferent, baselineFSAT: undefined, modifiedFSAT: undefined });

    operationsServiceSpy = jasmine.createSpyObj('OperationsService', ['getFormFromObj', 'getObjFromForm']);
    operationsServiceSpy.getFormFromObj.and.callFake((obj: FsatOperations) => makeForm(obj));
    operationsServiceSpy.getObjFromForm.and.callFake((form: UntypedFormGroup) => ({
      operatingHours: form.controls.operatingHours.value,
      cost: form.controls.cost.value,
    }));

    helpPanelServiceSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField });
    fsatServiceSpy = jasmine.createSpyObj('FsatService', [], { modalOpen });

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      declarations: [OperationsComponent],
      providers: [
        { provide: FeatureFlagService, useValue: jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts }) },
        { provide: FsatWarningService, useValue: warningServiceSpy },
        { provide: AssessmentCo2SavingsService, useValue: co2ServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: OperationsService, useValue: operationsServiceSpy },
        { provide: HelpPanelService, useValue: helpPanelServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(options: { inSetup?: boolean; selected?: boolean; baseline?: boolean; operations?: FsatOperations } = {}): void {
    fixture = TestBed.createComponent(OperationsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fsat', { operatingHours: {} } as FSAT);
    fixture.componentRef.setInput('fsatOperations', options.operations ?? makeOperations());
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('selected', options.selected ?? true);
    fixture.componentRef.setInput('inSetup', options.inSetup ?? false);
    fixture.componentRef.setInput('baseline', options.baseline ?? true);
    fixture.componentRef.setInput('modificationIndex', 0);
    fixture.detectChanges();
  }

  const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const queryAll = (selector: string): NodeListOf<HTMLElement> => fixture.nativeElement.querySelectorAll(selector);
  const headings = (): Array<string> => Array.from(queryAll('.header h3')).map(h => h.textContent.trim());
  const errorSpans = (formGroupIndex: number): Array<string> =>
    Array.from(queryAll('form .form-group')[formGroupIndex].querySelectorAll('.alert-danger span')).map(s => s.textContent.replace(/\s+/g, ' ').trim());

  function setControl(name: 'operatingHours' | 'cost', value: number | null, dirty: boolean = true): void {
    const control = component.operationsForm.controls[name];
    control.setValue(value);
    if (dirty) {
      control.markAsDirty();
    }
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('builds the form from the operations input and emits the saved operations', () => {
      const emitted: FsatOperations[] = [];
      fixture = TestBed.createComponent(OperationsComponent);
      component = fixture.componentInstance;
      component.emitSave.subscribe((v: FsatOperations) => emitted.push(v));
      fixture.componentRef.setInput('fsat', { operatingHours: {} } as FSAT);
      fixture.componentRef.setInput('fsatOperations', makeOperations());
      fixture.componentRef.setInput('settings', MOCK_SETTINGS);
      fixture.componentRef.setInput('selected', true);
      fixture.componentRef.setInput('baseline', true);
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(operationsServiceSpy.getFormFromObj).toHaveBeenCalled();
      expect(component.operationsForm.value).toEqual({ operatingHours: 4000, cost: 0.1 });
      expect(emitted.length).toBe(1);
      expect(emitted[0].cO2SavingsData).toBe(MOCK_CO2_DATA);
    });

    it('defaults the electricity cost from settings when none is set', () => {
      createComponent({ operations: makeOperations({ cost: undefined }) });
      expect(component.operationsForm.controls.cost.value).toBe(0.05);
    });

    it('uses the baseline id string for the baseline', () => {
      createComponent({ baseline: true });
      expect(component.idString).toBe('fsat_baseline');
      expect(query('input[name="operatingHours"]').id).toBe('operatingHours_fsat_baseline');
    });

    it('uses a modification id string for a modification', () => {
      createComponent({ baseline: false });
      expect(component.idString).toBe('fsat_modification_0');
    });

    it('leaves the form enabled when selected', () => {
      createComponent({ selected: true });
      expect(component.operationsForm.enabled).toBeTrue();
      expect(component.co2SavingsFormDisabled).toBeFalsy();
    });

    it('disables the form when not selected', () => {
      createComponent({ selected: false });
      expect(component.operationsForm.controls.cost.disabled).toBeTrue();
      expect(component.operationsForm.controls.operatingHours.disabled).toBeTrue();
      expect(component.co2SavingsFormDisabled).toBeTrue();
    });
  });

  describe('input changes', () => {
    it('enables and disables the form when selected changes', () => {
      createComponent({ selected: false });

      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.operationsForm.enabled).toBeTrue();
      expect(component.co2SavingsFormDisabled).toBeFalse();

      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.operationsForm.disabled).toBeTrue();
      expect(component.co2SavingsFormDisabled).toBeTrue();
    });

    it('rebuilds the form when the modification index changes', () => {
      createComponent({ selected: true });
      operationsServiceSpy.getFormFromObj.calls.reset();

      fixture.componentRef.setInput('modificationIndex', 1);
      fixture.detectChanges();

      expect(operationsServiceSpy.getFormFromObj).toHaveBeenCalledTimes(1);
    });
  });

  describe('template visibility', () => {
    describe('operations header', () => {
      it('is shown in setup', () => {
        createComponent({ inSetup: true });
        expect(headings()).toEqual(['Operations']);
      });

      it('is hidden outside of setup', () => {
        createComponent({ inSetup: false });
        expect(headings()).toEqual([]);
      });
    });

    describe('operating hours errors', () => {
      beforeEach(() => createComponent());

      it('shows no error for a valid value', () => {
        setControl('operatingHours', 4000);
        expect(errorSpans(0)).toEqual([]);
      });

      it('shows no error for an invalid value that has not been edited', () => {
        setControl('operatingHours', null, false);
        expect(component.operationsForm.controls.operatingHours.invalid).toBeTrue();
        expect(errorSpans(0)).toEqual([]);
      });

      it('shows only the required error when the value is missing', () => {
        setControl('operatingHours', null);
        expect(errorSpans(0)).toEqual(['Value Required']);
      });

      it('shows only the max error when the value is too large', () => {
        setControl('operatingHours', 9000);
        expect(errorSpans(0).length).toBe(1);
        expect(errorSpans(0)[0]).toContain("Value can't be greater than 8760 hrs/yr.");
      });

      it('shows only the min error when the value is negative', () => {
        setControl('operatingHours', -5);
        expect(errorSpans(0).length).toBe(1);
        expect(errorSpans(0)[0]).toContain("Value can't be less than 0 hrs/yr.");
      });
    });

    describe('electricity cost messages', () => {
      beforeEach(() => createComponent());

      it('shows no message for a valid value without a warning', () => {
        setControl('cost', 0.1);
        expect(errorSpans(1)).toEqual([]);
        expect(query('form .alert-warning')).toBeNull();
      });

      it('shows no error for an invalid value that has not been edited', () => {
        setControl('cost', null, false);
        expect(errorSpans(1)).toEqual([]);
      });

      it('shows only the required error when the value is missing', () => {
        setControl('cost', null);
        expect(errorSpans(1)).toEqual(['Value Required']);
      });

      it('shows only the min error when the value is negative', () => {
        setControl('cost', -1);
        expect(errorSpans(1).length).toBe(1);
        expect(errorSpans(1)[0]).toContain("Value can't be less than 0 $/kWh.");
      });

      it('shows the cost warning for an edited valid value', () => {
        component.warnings = { costError: 'Cost is unusually high' };
        setControl('cost', 5);
        expect(query('form .alert-warning').textContent).toContain('Cost is unusually high');
      });

      it('hides the cost warning when the value has not been edited', () => {
        component.warnings = { costError: 'Cost is unusually high' };
        setControl('cost', 5, false);
        expect(query('form .alert-warning')).toBeNull();
      });

      it('hides the cost warning when the value is invalid', () => {
        component.warnings = { costError: 'Cost is unusually high' };
        setControl('cost', -1);
        expect(query('form .alert-warning')).toBeNull();
      });
    });

    describe('operational impacts', () => {
      it('hides the carbon emissions section when the feature flag is off', () => {
        createComponent({ inSetup: true });
        expect(headings()).toEqual(['Operations']);
        expect(query('app-assessment-co2-savings')).toBeNull();
      });

      it('shows the carbon emissions header and CO2 savings in setup when the flag is on', () => {
        showOperationalImpacts.set(true);
        createComponent({ inSetup: true });
        expect(headings()).toEqual(['Operations', 'Carbon Emissions']);
        expect(query('app-assessment-co2-savings')).not.toBeNull();
      });

      it('shows the CO2 savings without the header outside of setup when the flag is on', () => {
        showOperationalImpacts.set(true);
        createComponent({ inSetup: false });
        expect(headings()).toEqual([]);
        expect(query('app-assessment-co2-savings')).not.toBeNull();
      });

      it('hides the CO2 savings when there is no CO2 savings data', () => {
        showOperationalImpacts.set(true);
        co2ServiceSpy.getCo2SavingsDataFromSettingsObject.and.returnValue(undefined);
        createComponent({ inSetup: true });
        expect(headings()).toEqual(['Operations', 'Carbon Emissions']);
        expect(query('app-assessment-co2-savings')).toBeNull();
      });

      it('reacts when the feature flag changes', () => {
        createComponent();
        expect(query('app-assessment-co2-savings')).toBeNull();
        showOperationalImpacts.set(true);
        fixture.detectChanges();
        expect(query('app-assessment-co2-savings')).not.toBeNull();
      });
    });

    describe('operating hours modal', () => {
      it('is hidden by default', () => {
        createComponent();
        expect(query('app-operating-hours-modal')).toBeNull();
      });

      it('is shown after the calculator link is clicked and hidden when closed', () => {
        createComponent();
        query('.op-hour-addon a.click-link').click();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).not.toBeNull();
        expect(modalOpen.value).toBeTrue();

        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).toBeNull();
        expect(modalOpen.value).toBeFalse();
      });
    });
  });

  describe('updateOperatingHours', () => {
    it('stores the hours on the fsat and form, saves and closes the modal', () => {
      createComponent();
      const emitted: FsatOperations[] = [];
      component.emitSave.subscribe((v: FsatOperations) => emitted.push(v));
      component.openOperatingHoursModal();
      const hours: OperatingHours = { hoursPerYear: 6000 };

      component.updateOperatingHours(hours);
      fixture.detectChanges();

      expect(component.fsat.operatingHours).toBe(hours);
      expect(component.operationsForm.controls.operatingHours.value).toBe(6000);
      expect(emitted[emitted.length - 1].operatingHours).toBe(6000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('updateFsatCo2SavingsData', () => {
    it('saves the updated CO2 data with the operations', () => {
      createComponent();
      const emitted: FsatOperations[] = [];
      component.emitSave.subscribe((v: FsatOperations) => emitted.push(v));
      const updated = { ...MOCK_CO2_DATA, totalEmissionOutputRate: 500 };

      component.updateFsatCo2SavingsData(updated);

      expect(emitted[0].cO2SavingsData).toBe(updated);
    });
  });

  describe('compare helpers', () => {
    it('does not compare during setup or without both fsats', () => {
      createComponent({ inSetup: true });
      Object.assign(compareServiceSpy, { baselineFSAT: {}, modifiedFSAT: {} });
      expect(component.canCompare()).toBeFalse();
      expect(component.isOperatingHoursDifferent()).toBeFalse();
      expect(component.isCostDifferent()).toBeFalse();
    });

    it('delegates to the compare service when both fsats exist outside of setup', () => {
      createComponent({ inSetup: false });
      Object.assign(compareServiceSpy, { baselineFSAT: {}, modifiedFSAT: {} });
      compareServiceSpy.isOperatingHoursDifferent.and.returnValue(true);
      compareServiceSpy.isCostDifferent.and.returnValue(false);

      expect(component.canCompare()).toBeTrue();
      expect(component.isOperatingHoursDifferent()).toBeTrue();
      expect(component.isCostDifferent()).toBeFalse();
    });
  });

  describe('focusField', () => {
    it('publishes the focused field to the help panel', () => {
      createComponent();
      component.focusField('cost');
      expect(currentField.value).toBe('cost');
    });
  });

  describe('destroy', () => {
    it('resets the emission rate difference and stops tracking it', () => {
      createComponent();
      totalEmissionOutputRateDifferent.next(true);
      expect(component.totalEmissionOutputRateDifferent).toBeTrue();

      fixture.destroy();
      expect(totalEmissionOutputRateDifferent.value).toBeFalse();

      totalEmissionOutputRateDifferent.next(true);
      expect(component.totalEmissionOutputRateDifferent).toBeFalse();
    });
  });
});

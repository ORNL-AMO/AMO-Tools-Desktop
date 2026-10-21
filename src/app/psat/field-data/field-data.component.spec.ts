import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';

import { FieldDataComponent } from './field-data.component';
import { FieldDataService } from './field-data.service';
import { PsatService } from '../psat.service';
import { PsatWarningService, FieldDataWarnings } from '../psat-warning.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { SettingsLabelPipe } from '../../shared/shared-pipes/settings-label.pipe';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

const MOCK_SETTINGS: Settings = {
  unitsOfMeasure: 'Imperial',
  flowMeasurement: 'gpm',
  distanceMeasurement: 'ft',
  electricityCost: 0.066,
} as Settings;

const MOCK_PSAT_INPUTS: PsatInputs = {
  flow_rate: 100,
  head: 50,
  load_estimation_method: 0,
  motor_field_power: 10,
  motor_field_current: 20,
  motor_field_voltage: 460,
  cost_kw_hour: 0.066,
  implementationCosts: 0,
  operating_hours: 8760,
  fluidType: 'WATER',
  fluidTemperature: 70,
  whatIfScenario: false,
};

const MOCK_FIELD_DATA_WARNINGS: FieldDataWarnings = {
  flowError: null,
  voltageError: null,
  measuredPowerOrCurrentError: null,
  suggestedVoltage: null,
};

function makePsat(): PSAT {
  return { inputs: { ...MOCK_PSAT_INPUTS } };
}

function makeAssessment(psat: PSAT): Assessment {
  return { id: 1, name: 'Test Assessment', type: 'PSAT', psat };
}

// Mirrors the shape built by FieldDataService.getFormFromObj for the mocked initial input values.
function makeFieldDataForm(inputs: PsatInputs = MOCK_PSAT_INPUTS): UntypedFormGroup {
  return new UntypedFormGroup({
    flowRate: new UntypedFormControl(inputs.flow_rate, [Validators.required, Validators.min(0)]),
    head: new UntypedFormControl(inputs.head, [Validators.required, Validators.min(0.1)]),
    loadEstimatedMethod: new UntypedFormControl(inputs.load_estimation_method, [Validators.required]),
    motorKW: new UntypedFormControl(inputs.motor_field_power, [Validators.required]),
    motorAmps: new UntypedFormControl(inputs.motor_field_current),
    measuredVoltage: new UntypedFormControl(inputs.motor_field_voltage, [Validators.required]),
    implementationCosts: new UntypedFormControl(inputs.implementationCosts),
  });
}

describe('FieldDataComponent', () => {
  let component: FieldDataComponent;
  let fixture: ComponentFixture<FieldDataComponent>;
  let fieldDataServiceSpy: jasmine.SpyObj<FieldDataService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let helpPanelService: HelpPanelService;
  let mockForm: UntypedFormGroup;
  let mockPsat: PSAT;

  beforeEach(async () => {
    mockPsat = makePsat();
    mockForm = makeFieldDataForm();

    fieldDataServiceSpy = jasmine.createSpyObj('FieldDataService', ['getFormFromObj', 'getPsatInputsFromForm']);
    fieldDataServiceSpy.getFormFromObj.and.returnValue(mockForm);
    fieldDataServiceSpy.getPsatInputsFromForm.and.callFake((form: UntypedFormGroup, psatInputs: PsatInputs) => ({
      ...psatInputs,
      flow_rate: form.controls.flowRate.value,
      head: form.controls.head.value,
      load_estimation_method: form.controls.loadEstimatedMethod.value,
      motor_field_power: form.controls.motorKW.value,
      motor_field_current: form.controls.motorAmps.value,
      motor_field_voltage: form.controls.measuredVoltage.value,
      implementationCosts: form.controls.implementationCosts.value,
    }));

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkFieldData']);
    psatWarningServiceSpy.checkFieldData.and.returnValue({ ...MOCK_FIELD_DATA_WARNINGS });

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isFlowRateDifferent', 'isHeadDifferent', 'isLoadEstimationMethodDifferent',
      'isMotorFieldPowerDifferent', 'isMotorFieldCurrentDifferent', 'isMotorFieldVoltageDifferent',
    ]);
    (compareServiceSpy as any).baselinePSAT = undefined;
    (compareServiceSpy as any).modifiedPSAT = undefined;

    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { modalOpen: new BehaviorSubject<boolean>(true) });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ModalModule.forRoot()],
      declarations: [FieldDataComponent, SettingsLabelPipe],
      providers: [
        { provide: FieldDataService, useValue: fieldDataServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        HelpPanelService,
        ConvertUnitsService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    helpPanelService = TestBed.inject(HelpPanelService);

    fixture = TestBed.createComponent(FieldDataComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('psat', mockPsat);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('baseline', true);
    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('inSetup', false);
    fixture.componentRef.setInput('assessment', makeAssessment(mockPsat));
    fixture.componentRef.setInput('modificationIndex', undefined);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets idString to psat_baseline for a baseline component', () => {
      expect(component.idString).toBe('psat_baseline');
    });

    it('calls getFormFromObj with psat.inputs, baseline, and whatIfScenario', () => {
      expect(fieldDataServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs, true, false);
    });

    it('assigns the form returned by the form service', () => {
      expect(component.psatForm).toBe(mockForm);
    });

    it('assigns fieldDataWarnings from checkFieldData', () => {
      expect(psatWarningServiceSpy.checkFieldData).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS, true);
      expect(component.fieldDataWarnings).toEqual(MOCK_FIELD_DATA_WARNINGS);
    });

    it('sets idString to psat_modification_N for a non-baseline modification component', () => {
      const modPsat = makePsat();
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeFieldDataForm());

      const modFixture = TestBed.createComponent(FieldDataComponent);
      modFixture.componentRef.setInput('psat', modPsat);
      modFixture.componentRef.setInput('settings', MOCK_SETTINGS);
      modFixture.componentRef.setInput('baseline', false);
      modFixture.componentRef.setInput('selected', true);
      modFixture.componentRef.setInput('inSetup', false);
      modFixture.componentRef.setInput('assessment', makeAssessment(modPsat));
      modFixture.componentRef.setInput('modificationIndex', 2);
      modFixture.detectChanges();

      expect(modFixture.componentInstance.idString).toBe('psat_modification_2');
    });

    it('disables loadEstimatedMethod when the component is created unselected', () => {
      const unselectedFixture = TestBed.createComponent(FieldDataComponent);
      unselectedFixture.componentRef.setInput('psat', makePsat());
      unselectedFixture.componentRef.setInput('settings', MOCK_SETTINGS);
      unselectedFixture.componentRef.setInput('baseline', true);
      unselectedFixture.componentRef.setInput('selected', false);
      unselectedFixture.componentRef.setInput('inSetup', false);
      unselectedFixture.componentRef.setInput('assessment', makeAssessment(makePsat()));
      unselectedFixture.detectChanges();

      expect(unselectedFixture.componentInstance.psatForm.controls.loadEstimatedMethod.disabled).toBeTrue();
    });

    it('defaults cost_kw_hour from settings.electricityCost when not already set', () => {
      const psatWithoutCost = makePsat();
      psatWithoutCost.inputs.cost_kw_hour = undefined;
      fieldDataServiceSpy.getFormFromObj.and.returnValue(makeFieldDataForm());

      const costFixture = TestBed.createComponent(FieldDataComponent);
      costFixture.componentRef.setInput('psat', psatWithoutCost);
      costFixture.componentRef.setInput('settings', MOCK_SETTINGS);
      costFixture.componentRef.setInput('baseline', true);
      costFixture.componentRef.setInput('selected', true);
      costFixture.componentRef.setInput('inSetup', false);
      costFixture.componentRef.setInput('assessment', makeAssessment(psatWithoutCost));
      costFixture.detectChanges();

      expect(psatWithoutCost.inputs.cost_kw_hour).toBe(MOCK_SETTINGS.electricityCost);
    });
  });

  describe('ngOnChanges', () => {
    it('disables loadEstimatedMethod when selected becomes false', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.psatForm.controls.loadEstimatedMethod.disabled).toBeTrue();
    });

    it('enables loadEstimatedMethod when selected becomes true again', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.psatForm.controls.loadEstimatedMethod.disabled).toBeFalse();
    });

    it('re-runs init when modificationIndex changes to a new value', () => {
      fieldDataServiceSpy.getFormFromObj.calls.reset();
      fixture.componentRef.setInput('modificationIndex', 3);
      fixture.detectChanges();
      expect(fieldDataServiceSpy.getFormFromObj).toHaveBeenCalled();
    });
  });

  describe('changeLoadMethod (validator toggling)', () => {
    it('requires motorKW and clears motorAmps validators when loadEstimatedMethod is Power (0)', () => {
      component.psatForm.controls.loadEstimatedMethod.setValue(1);
      component.changeLoadMethod();
      component.psatForm.controls.loadEstimatedMethod.setValue(0);
      component.changeLoadMethod();

      expect(component.psatForm.controls.motorKW.hasValidator(Validators.required)).toBeTrue();
      expect(component.psatForm.controls.motorAmps.validator).toBeNull();
    });

    it('requires motorAmps and clears motorKW validators when loadEstimatedMethod is Current (1)', () => {
      component.psatForm.controls.loadEstimatedMethod.setValue(1);
      component.changeLoadMethod();

      expect(component.psatForm.controls.motorAmps.hasValidator(Validators.required)).toBeTrue();
      expect(component.psatForm.controls.motorKW.validator).toBeNull();
    });
  });

  describe('save', () => {
    it('updates psat.inputs from the form, refreshes warnings, and emits saved', () => {
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));
      psatWarningServiceSpy.checkFieldData.calls.reset();

      component.psatForm.controls.flowRate.setValue(250);
      component.save();

      expect(fieldDataServiceSpy.getPsatInputsFromForm).toHaveBeenCalledWith(
        component.psatForm, jasmine.objectContaining({ flow_rate: 100 })
      );
      expect(mockPsat.inputs.flow_rate).toBe(250);
      expect(psatWarningServiceSpy.checkFieldData).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS, true);
      expect(emitted).toEqual([true]);
    });
  });

  describe('focusField', () => {
    it('sets currentField on the help panel service to the given field name', () => {
      component.focusField('flowRate');
      expect(helpPanelService.currentField.value).toBe('flowRate');
    });

    it('redirects measuredVoltage to modMeasuredVoltage when not baseline', () => {
      fixture.componentRef.setInput('baseline', false);
      fixture.detectChanges();

      component.focusField('measuredVoltage');
      expect(helpPanelService.currentField.value).toBe('modMeasuredVoltage');
    });
  });

  describe('head tool modal actions', () => {
    let modalSpy: jasmine.SpyObj<{ show: () => void; hide: () => void }>;

    beforeEach(() => {
      modalSpy = jasmine.createSpyObj('ModalDirective', ['show', 'hide']);
      (component as any).headToolModal = modalSpy;
    });

    it('opens the modal and marks it open when selected', () => {
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();

      component.showHeadToolModal();

      expect(psatServiceSpy.modalOpen.value).toBeTrue();
      expect(modalSpy.show).toHaveBeenCalled();
    });

    it('does not open the modal when not selected', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();

      component.showHeadToolModal();

      expect(modalSpy.show).not.toHaveBeenCalled();
    });

    it('resets head to the saved psat value and hides the modal', () => {
      component.psatForm.patchValue({ head: 999 });

      component.hideHeadToolModal();

      expect(component.psatForm.controls.head.value).toBe(mockPsat.inputs.head);
      expect(modalSpy.hide).toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('hides the inSetup header by default', () => {
      expect(fixture.nativeElement.querySelector('.header')).toBeNull();
    });

    it('shows the inSetup header when inSetup is true', () => {
      fixture.componentRef.setInput('inSetup', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.header')).not.toBeNull();
    });

    it('shows Load Estimation Method for a baseline component', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="loadEstimatedMethod"]')).not.toBeNull();
    });

    it('hides Load Estimation Method for a non-baseline component', () => {
      fixture.componentRef.setInput('baseline', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="loadEstimatedMethod"]')).toBeNull();
    });

    it('shows Motor Power and hides Motor Current when loadEstimatedMethod is Power (0)', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="motorKW"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="motorAmps"]')).toBeNull();
    });

    it('shows Motor Current and hides Motor Power when loadEstimatedMethod is Current (1)', () => {
      component.psatForm.controls.loadEstimatedMethod.setValue(1);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="motorAmps"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="motorKW"]')).toBeNull();
    });

    it('hides both Motor Power and Motor Current when not baseline even if loadEstimatedMethod is Power', () => {
      fixture.componentRef.setInput('baseline', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="motorKW"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[formControlName="motorAmps"]')).toBeNull();
    });

    it('hides Implementation Costs for a baseline component', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="implementationCosts"]')).toBeNull();
    });

    it('shows Implementation Costs for a non-baseline component', () => {
      fixture.componentRef.setInput('baseline', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="implementationCosts"]')).not.toBeNull();
    });

    it('hides the flowRate error message while the control is pristine', () => {
      const flowRateGroup = fixture.nativeElement.querySelectorAll('.form-group')[0];
      expect(flowRateGroup.querySelector('.alert-danger')).toBeNull();
    });

    it('shows the flowRate error message once the control is invalid and dirty', () => {
      component.psatForm.controls.flowRate.setValue(-5);
      component.psatForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();

      const flowRateGroup = fixture.nativeElement.querySelectorAll('.form-group')[0];
      expect(flowRateGroup.querySelector('.alert-danger')).not.toBeNull();
    });

    it('hides the suggested voltage message for a baseline component', () => {
      psatWarningServiceSpy.checkFieldData.and.returnValue({ ...MOCK_FIELD_DATA_WARNINGS, suggestedVoltage: 'Try 480V' });
      component.psatForm.controls.measuredVoltage.markAsDirty();
      component.save();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Try 480V');
    });

    it('shows the suggested voltage message for a non-baseline component once dirty', () => {
      fixture.componentRef.setInput('baseline', false);
      psatWarningServiceSpy.checkFieldData.and.returnValue({ ...MOCK_FIELD_DATA_WARNINGS, suggestedVoltage: 'Try 480V' });
      component.psatForm.controls.measuredVoltage.markAsDirty();
      component.save();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Try 480V');
    });
  });
});

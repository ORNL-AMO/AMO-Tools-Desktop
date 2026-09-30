import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WholeNumberValidator } from '../../shared/validators/whole-number';
import { SettingsLabelPipe } from '../../shared/shared-pipes/settings-label.pipe';
import { PumpFluidComponent } from './pump-fluid.component';
import { PumpFluidService } from './pump-fluid.service';
import { PsatService } from '../psat.service';
import { PsatWarningService, PumpFluidWarnings } from '../psat-warning.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ConnectedInventoryData } from '../../shared/connected-inventory/integrations';
import { PSAT, PsatInputs, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS: Settings = {
  unitsOfMeasure: 'Imperial',
  powerMeasurement: 'hp',
  distanceMeasurement: 'ft',
  flowMeasurement: 'gpm',
  temperatureMeasurement: 'F',
};

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    pump_style: 0,
    pump_specified: 80,
    pump_rated_speed: 1780,
    drive: 0,
    specifiedDriveEfficiency: 95,
    kinematic_viscosity: 1,
    specific_gravity: 1,
    stages: 1,
    fixed_speed: 0,
    line_frequency: 60,
    motor_rated_power: 200,
    motor_rated_speed: 1780,
    efficiency_class: 0,
    efficiency: 95,
    motor_rated_voltage: 460,
    load_estimation_method: 0,
    motor_rated_fla: 225,
    margin: 0,
    operating_hours: 8760,
    flow_rate: 1000,
    head: 100,
    motor_field_power: 0,
    motor_field_current: 0,
    motor_field_voltage: 0,
    cost_kw_hour: 0.06,
    load_factor: 1,
    implementationCosts: 0,
    isVFD: false,
    fluidType: 'Water',
    fluidTemperature: 70,
    useCustomEfficiency: false,
    whatIfScenario: false,
    ...overrides,
  };
}

function makePsat(inputsOverrides: Partial<PsatInputs> = {}): PSAT {
  return { inputs: makePsatInputs(inputsOverrides), modifications: [], selected: true, name: 'Baseline' };
}

function makePumpFluidWarnings(overrides: Partial<PumpFluidWarnings> = {}): PumpFluidWarnings {
  return { rpmError: null, temperatureError: null, ...overrides };
}

function makeConnectedInventoryData(overrides: Partial<ConnectedInventoryData> = {}): ConnectedInventoryData {
  return { connectedItem: undefined, isConnected: false, canConnect: false, shouldConvertItemUnits: false, shouldDisconnect: false, ...overrides };
}

// Mirrors PumpFluidService.getFormFromObj's shape and its "mark dirty when truthy initial value"
// behavior, so template visibility tests (invalid + !pristine) behave the same as production forms.
function makePumpFluidForm(psatInputs: PsatInputs): UntypedFormGroup {
  const specifiedPumpEfficiencyValidators = psatInputs.pump_style == 11 ? [Validators.required, Validators.min(0), Validators.max(100)] : [];
  const specifiedDriveEfficiencyValidators = psatInputs.drive == 4 ? [Validators.required, Validators.min(0), Validators.max(100)] : [];
  const form = new UntypedFormBuilder().group({
    pumpType: [psatInputs.pump_style, Validators.required],
    specifiedPumpEfficiency: [psatInputs.pump_specified, specifiedPumpEfficiencyValidators],
    pumpRPM: [psatInputs.pump_rated_speed, Validators.required],
    drive: [psatInputs.drive, Validators.required],
    specifiedDriveEfficiency: [psatInputs.specifiedDriveEfficiency, specifiedDriveEfficiencyValidators],
    fluidType: [psatInputs.fluidType, Validators.required],
    fluidTemperature: [psatInputs.fluidTemperature, Validators.required],
    gravity: [psatInputs.specific_gravity, [Validators.required, Validators.min(0)]],
    viscosity: [psatInputs.kinematic_viscosity, [Validators.required, Validators.min(0)]],
    stages: [psatInputs.stages, [Validators.required, Validators.min(1), WholeNumberValidator.wholeNumber()]],
  });
  for (const key in form.controls) {
    if (form.controls[key].value) {
      form.controls[key].markAsDirty();
    }
  }
  return form;
}

describe('PumpFluidComponent', () => {
  let component: PumpFluidComponent;
  let fixture: ComponentFixture<PumpFluidComponent>;
  let pumpFluidServiceSpy: jasmine.SpyObj<PumpFluidService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let helpPanelServiceSpy: jasmine.SpyObj<HelpPanelService>;
  let integrationStateServiceSpy: jasmine.SpyObj<IntegrationStateService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let connectedInventoryDataSubject: BehaviorSubject<ConnectedInventoryData>;
  let mockPsat: PSAT;

  function setupComponent(target: PumpFluidComponent, overrides: Partial<PumpFluidComponent> = {}) {
    target.psat = mockPsat;
    target.settings = MOCK_SETTINGS;
    target.selected = true;
    target.baseline = true;
    target.inSetup = false;
    target.modificationIndex = undefined;
    Object.assign(target, overrides);
  }

  beforeEach(async () => {
    mockPsat = makePsat();
    connectedInventoryDataSubject = new BehaviorSubject<ConnectedInventoryData>(makeConnectedInventoryData());

    pumpFluidServiceSpy = jasmine.createSpyObj('PumpFluidService', [
      'getFormFromObj', 'getSpecifiedPumpEfficiencyValidators', 'getSpecifiedDriveEfficiency', 'getPsatInputsFromForm',
    ]);
    pumpFluidServiceSpy.getFormFromObj.and.callFake((psatInputs: PsatInputs) => makePumpFluidForm(psatInputs));
    pumpFluidServiceSpy.getSpecifiedPumpEfficiencyValidators.and.callFake(
      (pumpStyle: number) => pumpStyle == 11 ? [Validators.required, Validators.min(0), Validators.max(100)] : []
    );
    pumpFluidServiceSpy.getSpecifiedDriveEfficiency.and.callFake(
      (driveType: number) => driveType == 4 ? [Validators.required, Validators.min(0), Validators.max(100)] : []
    );
    pumpFluidServiceSpy.getPsatInputsFromForm.and.callFake((form: UntypedFormGroup, psatInputs: PsatInputs) => ({
      ...psatInputs,
      pump_style: form.controls.pumpType.value,
      pump_specified: form.controls.specifiedPumpEfficiency.value,
      pump_rated_speed: form.controls.pumpRPM.value,
      drive: form.controls.drive.value,
      specifiedDriveEfficiency: form.controls.specifiedDriveEfficiency.value,
      fluidType: form.controls.fluidType.value,
      fluidTemperature: form.controls.fluidTemperature.value,
      specific_gravity: form.controls.gravity.value,
      kinematic_viscosity: form.controls.viscosity.value,
      stages: form.controls.stages.value,
    }));

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['resultsExisting', 'pumpEfficiency', 'roundVal']);
    psatServiceSpy.roundVal.and.callFake((val: number) => val);
    psatServiceSpy.pumpEfficiency.and.returnValue({ average: 0.7, max: 0.8 });
    psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 72 } as PsatOutputs);

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkPumpFluidWarnings']);
    psatWarningServiceSpy.checkPumpFluidWarnings.and.returnValue(makePumpFluidWarnings());

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isPumpTypeDifferent', 'isPumpSpecifiedDifferent', 'isPumpRpmDifferent', 'isDriveDifferent',
      'isSpecifiedDriveEfficiencyDifferent', 'isKinematicViscosityDifferent', 'isSpecificGravityDifferent',
      'isFluidTempDifferent', 'isFluidTypeDifferent', 'isStagesDifferent', 'isSpecifiedEfficiencyDifferent',
    ]);
    // baselinePSAT/modifiedPSAT are plain (non-spied) properties; tests assign them directly.

    helpPanelServiceSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField: new BehaviorSubject<string>(null) });

    integrationStateServiceSpy = jasmine.createSpyObj('IntegrationStateService', [], { connectedInventoryData: connectedInventoryDataSubject });

    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['value']);
    convertUnitsServiceSpy.value.and.callFake((val: number) => ({ from: () => ({ to: () => val }) }) as unknown as ConvertUnitsService);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PumpFluidComponent, SettingsLabelPipe],
      providers: [
        { provide: PumpFluidService, useValue: pumpFluidServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: HelpPanelService, useValue: helpPanelServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PumpFluidComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets idString for a baseline instance', () => {
      expect(component.idString).toBe('psat_baseline');
    });

    it('sets idString for a modification instance using modificationIndex', () => {
      const modFixture = TestBed.createComponent(PumpFluidComponent);
      setupComponent(modFixture.componentInstance, { baseline: false, modificationIndex: 3 });
      modFixture.detectChanges();

      expect(modFixture.componentInstance.idString).toBe('psat_modification_3');
    });

    it('populates the dropdown constants', () => {
      expect(component.pumpTypes.length).toBeGreaterThan(0);
      expect(component.drives.length).toBeGreaterThan(0);
      expect(component.fluidTypes.length).toBeGreaterThan(0);
    });

    it('calls getFormFromObj with the psat inputs and assigns the returned form', () => {
      expect(pumpFluidServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs);
      expect(component.psatForm).toBeDefined();
      expect(component.psatForm.controls.pumpRPM.value).toBe(mockPsat.inputs.pump_rated_speed);
    });

    it('checks pump fluid warnings on init and assigns them', () => {
      expect(psatWarningServiceSpy.checkPumpFluidWarnings).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS);
      expect(component.pumpFluidWarnings).toEqual(makePumpFluidWarnings());
    });

    it('disables the form on init when selected is false', () => {
      const disabledFixture = TestBed.createComponent(PumpFluidComponent);
      setupComponent(disabledFixture.componentInstance, { selected: false });
      disabledFixture.detectChanges();

      expect(disabledFixture.componentInstance.psatForm.disabled).toBeTrue();
    });
  });

  describe('changePumpType', () => {
    it('applies specifiedPumpEfficiency validators when pumpType becomes 11', () => {
      component.psatForm.controls.pumpType.setValue(11);
      component.changePumpType();
      expect(component.psatForm.controls.specifiedPumpEfficiency.hasValidator(Validators.required)).toBeTrue();
    });

    it('clears specifiedPumpEfficiency validators when pumpType moves away from 11', () => {
      component.psatForm.controls.pumpType.setValue(11);
      component.changePumpType();
      component.psatForm.controls.pumpType.setValue(0);
      component.changePumpType();
      expect(component.psatForm.controls.specifiedPumpEfficiency.validator).toBeNull();
    });

    it('recalculates pump efficiency when not a baseline instance', () => {
      component.baseline = false;
      psatServiceSpy.pumpEfficiency.calls.reset();
      component.changePumpType();
      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalled();
    });

    it('does not recalculate pump efficiency for a baseline instance', () => {
      component.baseline = true;
      psatServiceSpy.pumpEfficiency.calls.reset();
      component.changePumpType();
      expect(psatServiceSpy.pumpEfficiency).not.toHaveBeenCalled();
    });
  });

  describe('changeDriveType', () => {
    it('applies specifiedDriveEfficiency validators when drive becomes 4', () => {
      component.psatForm.controls.drive.setValue(4);
      component.changeDriveType();
      expect(component.psatForm.controls.specifiedDriveEfficiency.hasValidator(Validators.required)).toBeTrue();
    });

    it('clears specifiedDriveEfficiency validators when drive moves away from 4', () => {
      component.psatForm.controls.drive.setValue(4);
      component.changeDriveType();
      component.psatForm.controls.drive.setValue(0);
      component.changeDriveType();
      expect(component.psatForm.controls.specifiedDriveEfficiency.validator).toBeNull();
    });
  });

  describe('getPumpEfficiency', () => {
    it('calls pumpEfficiency with the form and psat input values and patches specifiedPumpEfficiency', () => {
      psatServiceSpy.pumpEfficiency.and.returnValue({ average: 0.5, max: 0.65 });

      component.getPumpEfficiency();

      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalledWith(
        component.psatForm.controls.pumpType.value,
        mockPsat.inputs.flow_rate,
        mockPsat.inputs.pump_rated_speed,
        mockPsat.inputs.kinematic_viscosity,
        mockPsat.inputs.stages,
        mockPsat.inputs.head,
        100,
        MOCK_SETTINGS
      );
      expect(component.psatForm.controls.specifiedPumpEfficiency.value).toBe(65);
    });
  });

  describe('disablePumpType', () => {
    it('patches specifiedPumpEfficiency from the baseline results and sets pumpType to 11', () => {
      const baselinePsat = makePsat({ pump_style: 3 });
      compareServiceSpy.baselinePSAT = baselinePsat;
      psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 81 } as PsatOutputs);

      component.disablePumpType();

      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledWith(baselinePsat.inputs, MOCK_SETTINGS);
      expect(component.psatForm.controls.specifiedPumpEfficiency.value).toBe(81);
      expect(component.psatForm.controls.pumpType.value).toBe(11);
    });
  });

  describe('enablePumpType', () => {
    it('patches pumpType from the baseline pump style and recalculates efficiency', () => {
      compareServiceSpy.baselinePSAT = makePsat({ pump_style: 5 });
      psatServiceSpy.pumpEfficiency.calls.reset();

      component.enablePumpType();

      expect(component.psatForm.controls.pumpType.value).toBe(5);
      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalled();
    });
  });

  describe('addNum / subtractNum', () => {
    it('increments stages and saves', () => {
      component.psatForm.controls.stages.setValue(1);
      pumpFluidServiceSpy.getPsatInputsFromForm.calls.reset();

      component.addNum('stages');

      expect(component.psatForm.controls.stages.value).toBe(2);
      expect(pumpFluidServiceSpy.getPsatInputsFromForm).toHaveBeenCalled();
    });

    it('decrements stages and saves', () => {
      component.psatForm.controls.stages.setValue(3);
      component.subtractNum('stages');
      expect(component.psatForm.controls.stages.value).toBe(2);
    });

    it('does not decrement stages below 1', () => {
      component.psatForm.controls.stages.setValue(1);
      component.subtractNum('stages');
      expect(component.psatForm.controls.stages.value).toBe(1);
    });
  });

  describe('calculateSpecificGravity', () => {
    it('computes gravity and viscosity for the Water fluid type', () => {
      component.psatForm.patchValue({ fluidType: 'Water', fluidTemperature: 70 });
      component.calculateSpecificGravity();
      expect(component.psatForm.controls.gravity.value).not.toBeNull();
      expect(component.psatForm.controls.viscosity.value).not.toBeNull();
    });

    it('saves without recomputing gravity/viscosity for the Other fluid type', () => {
      component.psatForm.patchValue({ fluidType: 'Other', fluidTemperature: 70, gravity: 1.5, viscosity: 2.5 });
      component.calculateSpecificGravity();
      expect(component.psatForm.controls.gravity.value).toBe(1.5);
      expect(component.psatForm.controls.viscosity.value).toBe(2.5);
    });
  });

  describe('save', () => {
    it('updates psat inputs from the form, rechecks warnings, and emits saved with selected', () => {
      component.selected = true;
      component.psatForm.patchValue({ pumpRPM: 1800 });
      const inputsBeforeSave = component.psat.inputs;
      psatWarningServiceSpy.checkPumpFluidWarnings.calls.reset();
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));

      component.save();

      expect(pumpFluidServiceSpy.getPsatInputsFromForm).toHaveBeenCalledWith(component.psatForm, inputsBeforeSave);
      expect(component.psat.inputs.pump_rated_speed).toBe(1800);
      expect(psatWarningServiceSpy.checkPumpFluidWarnings).toHaveBeenCalled();
      expect(emitted).toEqual([true]);
    });
  });

  describe('template visibility', () => {
    it('hides the Pump/Fluid setup headers when inSetup is false', () => {
      expect(fixture.nativeElement.querySelectorAll('.header h3').length).toBe(0);
    });

    it('shows the Pump/Fluid setup headers when inSetup is true', () => {
      component.inSetup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header h3').length).toBe(2);
    });

    it('hides app-connected-assessment-status when there is no connected pump inventory', () => {
      expect(fixture.nativeElement.querySelectorAll('app-connected-assessment-status').length).toBe(0);
    });

    it('shows only the pump-section status when hasConnectedPumpInventory is true but inSetup is false', () => {
      component.hasConnectedPumpInventory = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-connected-assessment-status').length).toBe(1);
    });

    it('shows both connected-status blocks when hasConnectedPumpInventory and inSetup are both true', () => {
      component.hasConnectedPumpInventory = true;
      component.inSetup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-connected-assessment-status').length).toBe(2);
    });

    it('hides the pumpType field when pumpType is 11', () => {
      component.psatForm.controls.pumpType.setValue(11);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="pumpType"]')).toBeNull();
    });

    it('shows the pumpType field when pumpType is not 11', () => {
      component.psatForm.controls.pumpType.setValue(0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="pumpType"]')).not.toBeNull();
    });

    it('hides the pump efficiency section for a baseline instance', () => {
      expect(component.baseline).toBeTrue();
      expect(fixture.nativeElement.querySelector('[formControlName="specifiedPumpEfficiency"]')).toBeNull();
    });

    it('shows an editable specifiedPumpEfficiency input when pumpType is 11 and not baseline', () => {
      component.baseline = false;
      component.psatForm.controls.pumpType.setValue(11);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="specifiedPumpEfficiency"]')).not.toBeNull();
    });

    it('shows a read-only specifiedPumpEfficiency display when pumpType is not 11 and not baseline', () => {
      component.baseline = false;
      component.psatForm.controls.pumpType.setValue(0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="specifiedPumpEfficiency"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('.text-center.small')).not.toBeNull();
    });

    it('hides the specifiedDriveEfficiency field when drive is not 4', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="specifiedDriveEfficiency"]')).toBeNull();
    });

    it('shows the specifiedDriveEfficiency field when drive is 4', () => {
      component.psatForm.controls.drive.setValue(4);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="specifiedDriveEfficiency"]')).not.toBeNull();
    });
  });
});

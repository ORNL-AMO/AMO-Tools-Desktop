import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MotorComponent } from './motor.component';
import { MotorService } from './motor.service';
import { PsatWarningService, MotorWarnings } from '../psat-warning.service';
import { PsatService } from '../psat.service';
import { PsatIntegrationService } from '../../shared/connected-inventory/psat-integration.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { PumpMotorIntegrationService } from '../../shared/connected-inventory/pump-motor-integration.service';
import { ConnectedInventoryData, ConnectedItem } from '../../shared/connected-inventory/integrations';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

const MOCK_SETTINGS: Settings = {
  unitsOfMeasure: 'Imperial',
  powerMeasurement: 'hp',
  distanceMeasurement: 'ft',
  flowMeasurement: 'gpm',
  temperatureMeasurement: 'F',
};

function makePsatInputs(): PsatInputs {
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
    efficiency: null,
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
  };
}

function makePsat(): PSAT {
  return { inputs: makePsatInputs(), modifications: [], selected: true, name: 'Baseline' };
}

function makeAssessment(psat: PSAT): Assessment {
  return { id: 1, type: 'PSAT', name: 'Test Assessment', psat };
}

function makeMotorWarnings(overrides: Partial<MotorWarnings> = {}): MotorWarnings {
  return { rpmError: null, voltageError: null, flaError: null, ratedPowerError: null, ...overrides };
}

function makeConnectedInventoryData(overrides: Partial<ConnectedInventoryData> = {}): ConnectedInventoryData {
  return { connectedItem: undefined, isConnected: false, canConnect: false, shouldConvertItemUnits: false, shouldDisconnect: false, ...overrides };
}

function makeConnectedItem(inventoryType: 'motor' | 'pump'): ConnectedItem {
  return { name: 'Connected Item', inventoryId: 1, inventoryType };
}

// Mirrors MotorService.getFormFromObj's shape and its "mark dirty when truthy initial value" behavior,
// so template visibility tests (invalid + !pristine) behave the same as production forms.
function makeMotorForm(psatInputs: PsatInputs): UntypedFormGroup {
  const efficiencyValidators = psatInputs.efficiency_class == 3 ? [Validators.required, Validators.min(0), Validators.max(100)] : [];
  const form = new UntypedFormBuilder().group({
    frequency: [psatInputs.line_frequency, Validators.required],
    horsePower: [psatInputs.motor_rated_power, Validators.required],
    motorRPM: [psatInputs.motor_rated_speed, Validators.required],
    efficiencyClass: [psatInputs.efficiency_class, Validators.required],
    efficiency: [psatInputs.efficiency, efficiencyValidators],
    motorVoltage: [psatInputs.motor_rated_voltage, Validators.required],
    fullLoadAmps: [psatInputs.motor_rated_fla, Validators.required],
  });
  for (const key in form.controls) {
    if (form.controls[key].value) {
      form.controls[key].markAsDirty();
    }
  }
  return form;
}

describe('MotorComponent', () => {
  let component: MotorComponent;
  let fixture: ComponentFixture<MotorComponent>;
  let motorServiceSpy: jasmine.SpyObj<MotorService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatIntegrationServiceSpy: jasmine.SpyObj<PsatIntegrationService>;
  let integrationStateServiceSpy: jasmine.SpyObj<IntegrationStateService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let helpPanelServiceSpy: jasmine.SpyObj<HelpPanelService>;
  let pumpMotorIntegrationServiceSpy: jasmine.SpyObj<PumpMotorIntegrationService>;
  let connectedInventoryDataSubject: BehaviorSubject<ConnectedInventoryData>;
  let integrationContainerOffsetHeightSubject: BehaviorSubject<number>;
  let mockAssessment: Assessment;
  let mockPsat: PSAT;

  function setupComponent(target: MotorComponent, overrides: Partial<MotorComponent> = {}) {
    target.assessment = mockAssessment;
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
    mockAssessment = makeAssessment(mockPsat);

    connectedInventoryDataSubject = new BehaviorSubject<ConnectedInventoryData>(makeConnectedInventoryData());
    integrationContainerOffsetHeightSubject = new BehaviorSubject<number>(0);

    motorServiceSpy = jasmine.createSpyObj('MotorService', [
      'getFormFromObj', 'getInputsFromFrom', 'disableFLA', 'updateFormEfficiencyValidators',
    ]);
    motorServiceSpy.getFormFromObj.and.callFake((psatInputs: PsatInputs) => makeMotorForm(psatInputs));
    motorServiceSpy.getInputsFromFrom.and.callFake((form: UntypedFormGroup, psatInputs: PsatInputs) => ({
      ...psatInputs,
      line_frequency: form.controls.frequency.value,
      motor_rated_power: form.controls.horsePower.value,
      motor_rated_speed: form.controls.motorRPM.value,
      efficiency_class: form.controls.efficiencyClass.value,
      efficiency: form.controls.efficiency.value,
      motor_rated_voltage: form.controls.motorVoltage.value,
      motor_rated_fla: form.controls.fullLoadAmps.value,
    }));
    motorServiceSpy.disableFLA.and.returnValue(false);

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkMotorWarnings']);
    psatWarningServiceSpy.checkMotorWarnings.and.returnValue(makeMotorWarnings());

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['setFormFullLoadAmps']);
    psatServiceSpy.setFormFullLoadAmps.and.callFake((form: UntypedFormGroup) => {
      form.patchValue({ fullLoadAmps: 111 });
      return form;
    });

    psatIntegrationServiceSpy = jasmine.createSpyObj('PsatIntegrationService', [
      'setFromConnectedMotorItem', 'setPSATFromExistingMotorItem', 'removeMotorConnectedItem', 'removeConnectedPumpInventory',
    ]);
    psatIntegrationServiceSpy.setFromConnectedMotorItem.and.returnValue(Promise.resolve());
    psatIntegrationServiceSpy.setPSATFromExistingMotorItem.and.returnValue(Promise.resolve());
    psatIntegrationServiceSpy.removeMotorConnectedItem.and.returnValue(Promise.resolve());
    psatIntegrationServiceSpy.removeConnectedPumpInventory.and.returnValue(Promise.resolve());

    integrationStateServiceSpy = jasmine.createSpyObj(
      'IntegrationStateService',
      [],
      {
        connectedInventoryData: connectedInventoryDataSubject,
        integrationContainerOffsetHeight: integrationContainerOffsetHeightSubject,
      }
    );

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isLineFreqDifferent', 'isMotorRatedPowerDifferent', 'isMotorRatedSpeedDifferent',
      'isEfficiencyClassDifferent', 'isEfficiencyDifferent', 'isMotorRatedVoltageDifferent', 'isMotorRatedFlaDifferent',
    ]);
    // baselinePSAT/modifiedPSAT are plain (non-spied) properties left undefined by default so canCompare() is false.

    helpPanelServiceSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField: new BehaviorSubject<string>(null) });

    pumpMotorIntegrationServiceSpy = jasmine.createSpyObj('PumpMotorIntegrationService', ['initInventoriesAndOptions']);
    pumpMotorIntegrationServiceSpy.initInventoriesAndOptions.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MotorComponent],
      providers: [
        { provide: MotorService, useValue: motorServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatIntegrationService, useValue: psatIntegrationServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: HelpPanelService, useValue: helpPanelServiceSpy },
        { provide: PumpMotorIntegrationService, useValue: pumpMotorIntegrationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MotorComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets idString for a baseline instance', () => {
      expect(component.idString).toBe('psat_baseline');
    });

    it('sets idString for a modification instance using modificationIndex', async () => {
      const modFixture = TestBed.createComponent(MotorComponent);
      setupComponent(modFixture.componentInstance, { baseline: false, modificationIndex: 2 });
      modFixture.detectChanges();
      await modFixture.whenStable();

      expect(modFixture.componentInstance.idString).toBe('psat_modification_2');
      modFixture.destroy();
    });

    it('calls getFormFromObj with the psat inputs and assigns the returned form', () => {
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs);
      expect(component.psatForm).toBeDefined();
      expect(component.psatForm.controls.horsePower.value).toBe(mockPsat.inputs.motor_rated_power);
    });

    it('checks motor warnings on init and assigns them', () => {
      expect(psatWarningServiceSpy.checkMotorWarnings).toHaveBeenCalledWith(mockPsat, MOCK_SETTINGS, false);
      expect(component.motorWarnings).toEqual(makeMotorWarnings());
    });

    it('sets the help panel field to lineFrequency on init', () => {
      expect(helpPanelServiceSpy.currentField.value).toBe('lineFrequency');
    });

    it('disables the form on init when selected is false', async () => {
      const disabledFixture = TestBed.createComponent(MotorComponent);
      setupComponent(disabledFixture.componentInstance, { selected: false });
      disabledFixture.detectChanges();
      await disabledFixture.whenStable();

      expect(disabledFixture.componentInstance.psatForm.disabled).toBeTrue();
      disabledFixture.destroy();
    });

    it('loads inventory select options when inSetup is true', async () => {
      pumpMotorIntegrationServiceSpy.initInventoriesAndOptions.and.returnValue(Promise.resolve([
        { id: 1, display: 'Motor A', catalogItemOptions: [] },
      ]));
      const setupFixture = TestBed.createComponent(MotorComponent);
      setupComponent(setupFixture.componentInstance, { inSetup: true });
      setupFixture.detectChanges();
      await setupFixture.whenStable();

      expect(setupFixture.componentInstance.inventorySelectOptions).toBeDefined();
      expect(setupFixture.componentInstance.inventorySelectOptions.inventoryOptions.length).toBe(1);
      setupFixture.destroy();
    });
  });

  describe('ngOnChanges', () => {
    it('disables the form when selected changes to false', () => {
      component.selected = false;
      component.ngOnChanges({ selected: new SimpleChange(true, false, false) });
      expect(component.psatForm.disabled).toBeTrue();
    });

    it('enables the form when selected changes to true and there is no connected item', () => {
      component.psatForm.disable();
      component.ngOnChanges({ selected: new SimpleChange(false, true, false) });
      expect(component.psatForm.enabled).toBeTrue();
    });

    it('does not enable the form when selected changes to true but the item is connected', () => {
      component.psat.connectedItem = makeConnectedItem('motor');
      connectedInventoryDataSubject.next(makeConnectedInventoryData({ isConnected: true }));
      component.psatForm.disable();

      component.ngOnChanges({ selected: new SimpleChange(false, true, false) });

      expect(component.psatForm.disabled).toBeTrue();
    });

    it('does not react on the first change of selected', () => {
      component.psatForm.disable();
      component.ngOnChanges({ selected: new SimpleChange(undefined, true, true) });
      expect(component.psatForm.disabled).toBeTrue();
    });

    it('rebuilds the form when psat changes after the first change', () => {
      motorServiceSpy.getFormFromObj.calls.reset();
      component.ngOnChanges({ psat: new SimpleChange(mockPsat, mockPsat, false) });
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs);
    });

    it('rebuilds the form when modificationIndex changes after the first change', () => {
      motorServiceSpy.getFormFromObj.calls.reset();
      component.ngOnChanges({ modificationIndex: new SimpleChange(0, 1, false) });
      expect(motorServiceSpy.getFormFromObj).toHaveBeenCalledWith(mockPsat.inputs);
    });
  });

  describe('observeConnectedInventoryData', () => {
    it('calls setPSATFromExistingMotorItem when a connectable item is not yet connected', async () => {
      psatIntegrationServiceSpy.setPSATFromExistingMotorItem.calls.reset();
      const emitted = makeConnectedInventoryData({ canConnect: true, isConnected: false });

      connectedInventoryDataSubject.next(emitted);
      await fixture.whenStable();

      expect(psatIntegrationServiceSpy.setPSATFromExistingMotorItem).toHaveBeenCalledWith(emitted, component.psat, component.assessment);
    });

    it('removes the connected item and re-enables the form when shouldDisconnect is emitted', async () => {
      component.psat.connectedItem = makeConnectedItem('motor');
      component.assessment.psat.connectedItem = component.psat.connectedItem;
      component.psatForm.disable();
      psatIntegrationServiceSpy.removeMotorConnectedItem.calls.reset();
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));

      connectedInventoryDataSubject.next(makeConnectedInventoryData({ shouldDisconnect: true }));
      await fixture.whenStable();

      expect(psatIntegrationServiceSpy.removeMotorConnectedItem).toHaveBeenCalled();
      expect(component.psat.connectedItem).toBeUndefined();
      expect(component.psatForm.enabled).toBeTrue();
      expect(emitted).toEqual([true]);
    });
  });

  describe('changeEfficiencyClass', () => {
    beforeEach(() => {
      motorServiceSpy.updateFormEfficiencyValidators.and.callFake((form: UntypedFormGroup) => {
        const validators = form.controls.efficiencyClass.value === 3
          ? [Validators.required, Validators.min(0), Validators.max(100)]
          : [];
        form.controls.efficiency.setValidators(validators);
        form.controls.efficiency.reset(form.controls.efficiency.value);
        return form;
      });
    });

    it('applies efficiency validators when efficiencyClass becomes 3', () => {
      component.psatForm.controls.efficiencyClass.setValue(3);
      component.changeEfficiencyClass();
      expect(component.psatForm.controls.efficiency.hasValidator(Validators.required)).toBeTrue();
    });

    it('clears efficiency validators when efficiencyClass moves away from 3', () => {
      component.psatForm.controls.efficiencyClass.setValue(3);
      component.changeEfficiencyClass();
      component.psatForm.controls.efficiencyClass.setValue(0);
      component.changeEfficiencyClass();
      expect(component.psatForm.controls.efficiency.validator).toBeNull();
    });

    it('saves after updating efficiency validators', () => {
      motorServiceSpy.getInputsFromFrom.calls.reset();
      component.changeEfficiencyClass();
      expect(motorServiceSpy.getInputsFromFrom).toHaveBeenCalled();
    });
  });

  describe('changeLineFreq', () => {
    it('bumps motorRPM from 1485 to 1780 when frequency is set to 60', () => {
      component.psatForm.patchValue({ frequency: 60, motorRPM: 1485 });
      component.changeLineFreq();
      expect(component.psatForm.controls.motorRPM.value).toBe(1780);
    });

    it('bumps motorRPM from 1780 to 1485 when frequency is set to 50', () => {
      component.psatForm.patchValue({ frequency: 50, motorRPM: 1780 });
      component.changeLineFreq();
      expect(component.psatForm.controls.motorRPM.value).toBe(1485);
    });

    it('leaves motorRPM unchanged for other combinations', () => {
      component.psatForm.patchValue({ frequency: 60, motorRPM: 1800 });
      component.changeLineFreq();
      expect(component.psatForm.controls.motorRPM.value).toBe(1800);
    });
  });

  describe('getFullLoadAmps', () => {
    it('calls setFormFullLoadAmps and patches fullLoadAmps when FLA is not disabled', () => {
      motorServiceSpy.disableFLA.and.returnValue(false);
      component.getFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).toHaveBeenCalledWith(component.psatForm, MOCK_SETTINGS);
      expect(component.psatForm.controls.fullLoadAmps.value).toBe(111);
    });

    it('does not call setFormFullLoadAmps when FLA is disabled', () => {
      motorServiceSpy.disableFLA.and.returnValue(true);
      component.getFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('updates psat inputs from the form, rechecks warnings, and emits saved with selected', () => {
      component.selected = true;
      component.psatForm.patchValue({ horsePower: 250 });
      const inputsBeforeSave = component.psat.inputs;
      psatWarningServiceSpy.checkMotorWarnings.calls.reset();
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));

      component.save();

      expect(motorServiceSpy.getInputsFromFrom).toHaveBeenCalledWith(component.psatForm, inputsBeforeSave);
      expect(component.psat.inputs.motor_rated_power).toBe(250);
      expect(psatWarningServiceSpy.checkMotorWarnings).toHaveBeenCalled();
      expect(emitted).toEqual([true]);
    });
  });

  describe('template visibility', () => {
    it('hides the "Motor" setup header when inSetup is false', () => {
      expect(fixture.nativeElement.querySelector('.header h3')).toBeNull();
    });

    it('shows the "Motor" setup header when inSetup is true', () => {
      component.inSetup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.header h3').textContent).toContain('Motor');
    });

    it('hides app-connected-assessment-status when there is no connected pump inventory', () => {
      expect(fixture.nativeElement.querySelector('app-connected-assessment-status')).toBeNull();
    });

    it('shows app-connected-assessment-status when there is a connected pump inventory', () => {
      component.hasConnectedPumpInventory = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-connected-assessment-status')).not.toBeNull();
    });

    it('hides app-inventory-integration when there are no select options and no connected item', () => {
      expect(fixture.nativeElement.querySelector('app-inventory-integration')).toBeNull();
    });

    it('shows app-inventory-integration when inventorySelectOptions is set', () => {
      component.inventorySelectOptions = { label: 'Connect', itemName: 'Motor', inventoryOptions: [], shouldResetForm: false };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-inventory-integration')).not.toBeNull();
    });

    it('hides the efficiency field when efficiencyClass is not 3', () => {
      expect(fixture.nativeElement.querySelector('[formControlName="efficiency"]')).toBeNull();
    });

    it('shows the efficiency field when efficiencyClass is 3', () => {
      component.psatForm.controls.efficiencyClass.setValue(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[formControlName="efficiency"]')).not.toBeNull();
    });

    it('hides the "Estimate Full-Load Amps" link when disableFLA is true', () => {
      motorServiceSpy.disableFLA.and.returnValue(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#flaHelp')).toBeNull();
    });

    it('shows the "Estimate Full-Load Amps" link when disableFLA is false', () => {
      motorServiceSpy.disableFLA.and.returnValue(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#flaHelp')).not.toBeNull();
    });

    it('hides the horsePower required error when the field is valid', () => {
      component.psatForm.controls.horsePower.setValue(200);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });

    it('shows the horsePower required error when the field is invalid and dirty', () => {
      component.psatForm.controls.horsePower.setValue(null);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('Value Required');
    });
  });

  describe('destroy', () => {
    it('stops reacting to connectedInventoryData emissions after the component is destroyed', async () => {
      psatIntegrationServiceSpy.setPSATFromExistingMotorItem.calls.reset();
      fixture.destroy();

      connectedInventoryDataSubject.next(makeConnectedInventoryData({ canConnect: true, isConnected: false }));
      await Promise.resolve();

      expect(psatIntegrationServiceSpy.setPSATFromExistingMotorItem).not.toHaveBeenCalled();
    });

    it('resets and unsubscribes the shared offset height stream for modification instances', async () => {
      const modFixture = TestBed.createComponent(MotorComponent);
      setupComponent(modFixture.componentInstance, { baseline: false, modificationIndex: 0 });
      modFixture.detectChanges();
      await modFixture.whenStable();

      modFixture.destroy();

      expect(integrationContainerOffsetHeightSubject.value).toBeUndefined();
      const heightBefore = modFixture.componentInstance.integrationContainerOffsetHeight;
      integrationContainerOffsetHeightSubject.next(500);
      expect(modFixture.componentInstance.integrationContainerOffsetHeight).toBe(heightBefore);
    });
  });
});

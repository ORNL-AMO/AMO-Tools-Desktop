import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SystemDataFormComponent } from './system-data-form.component';
import { FieldDataWarnings, OperationsWarnings } from '../../../psat-warning.service';
import { Modification, PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;

function makeFieldDataForm(overrides: { flowRate?: number; head?: number } = {}): UntypedFormGroup {
  return new UntypedFormGroup({
    flowRate: new UntypedFormControl(overrides.flowRate ?? 100, [Validators.required, Validators.max(10000), Validators.min(0)]),
    head: new UntypedFormControl(overrides.head ?? 100, [Validators.required, Validators.max(10000), Validators.min(0)]),
  });
}

function makeOperationsForm(overrides: { costKwHr?: number; operatingHours?: number } = {}): UntypedFormGroup {
  return new UntypedFormGroup({
    costKwHr: new UntypedFormControl(overrides.costKwHr ?? 0.06, [Validators.required, Validators.max(1), Validators.min(0)]),
    operatingHours: new UntypedFormControl(overrides.operatingHours ?? 8760, [Validators.required, Validators.max(8760), Validators.min(0)]),
  });
}

function makeWarnings(overrides: Partial<FieldDataWarnings> = {}): FieldDataWarnings {
  return { flowError: null, voltageError: null, measuredPowerOrCurrentError: null, suggestedVoltage: null, ...overrides };
}

function makeOperationsWarnings(): OperationsWarnings {
  return { cost: null };
}

function makeModification(): Modification {
  return {
    id: 'mod-1',
    psat: {
      inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60, whatIfScenario: true },
      name: 'Mod 1',
    },
  };
}

describe('SystemDataFormComponent', () => {
  let component: SystemDataFormComponent;
  let fixture: ComponentFixture<SystemDataFormComponent>;

  function setupComponent(target: SystemDataFormComponent) {
    target.settings = MOCK_SETTINGS;
    target.exploreModIndex = 0;
    target.isVFD = false;
    target.baselineFieldDataForm = makeFieldDataForm();
    target.modificationFieldDataForm = makeFieldDataForm();
    target.baselineOperationsForm = makeOperationsForm();
    target.modificationOperationsForm = makeOperationsForm();
    target.baselineWarnings = makeWarnings();
    target.modificationWarnings = makeWarnings();
    target.baselineOperationsWarnings = makeOperationsWarnings();
    target.modificationOperationsWarnings = makeOperationsWarnings();
    target.modificationPsat = { operatingHours: { hoursPerYear: 8760 } as OperatingHours } as PSAT;
    target.currentModification = makeModification();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, SharedPipesModule],
      declarations: [SystemDataFormComponent],
      providers: [ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemDataFormComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('marks no opportunity for flow rate, head, or system data when baseline and modification match', () => {
      expect(component.currentModification.exploreOppsShowFlowRate).toEqual({ hasOpportunity: false, display: 'Reduce System Flow Rate' });
      expect(component.currentModification.exploreOppsShowHead).toEqual({ hasOpportunity: false, display: 'Reduce System Head Requirement' });
      expect(component.currentModification.exploreOppsShowSystemData).toEqual({ hasOpportunity: false, display: 'Adjust Operational Data' });
    });

    it('marks a flow rate opportunity when baseline and modification flow rates differ', () => {
      const freshFixture = TestBed.createComponent(SystemDataFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modificationFieldDataForm = makeFieldDataForm({ flowRate: 50 });

      freshFixture.detectChanges();

      expect(freshComponent.currentModification.exploreOppsShowFlowRate.hasOpportunity).toBeTrue();
    });

    it('marks a head opportunity when baseline and modification head differ', () => {
      const freshFixture = TestBed.createComponent(SystemDataFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modificationFieldDataForm = makeFieldDataForm({ head: 50 });

      freshFixture.detectChanges();

      expect(freshComponent.currentModification.exploreOppsShowHead.hasOpportunity).toBeTrue();
    });

    it('marks a system data opportunity when baseline and modification cost or operating hours differ', () => {
      const freshFixture = TestBed.createComponent(SystemDataFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.modificationOperationsForm = makeOperationsForm({ costKwHr: 0.1 });

      freshFixture.detectChanges();

      expect(freshComponent.currentModification.exploreOppsShowSystemData.hasOpportunity).toBeTrue();
    });

    it('emits emitCalculate as part of the initial calculation', () => {
      const freshFixture = TestBed.createComponent(SystemDataFormComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      const emitted: boolean[] = [];
      freshComponent.emitCalculate.subscribe(v => emitted.push(v));

      freshFixture.detectChanges();

      expect(emitted).toEqual([true]);
    });
  });

  describe('ngOnChanges', () => {
    it('does not re-run init when exploreModIndex changes for the first time', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ exploreModIndex: new SimpleChange(undefined, 0, true) });

      expect(emitted).toEqual([]);
    });

    it('re-runs init when exploreModIndex changes after the first change', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ exploreModIndex: new SimpleChange(0, 0, false) });

      expect(emitted).toEqual([true]);
    });

    it('re-runs init when isVFD changes after the first change', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ isVFD: new SimpleChange(false, true, false) });

      expect(emitted).toEqual([true]);
    });

    it('does not re-run init when isVFD changes for the first time', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.ngOnChanges({ isVFD: new SimpleChange(undefined, false, true) });

      expect(emitted).toEqual([]);
    });
  });

  describe('toggleFlowRate', () => {
    it('resets modification flow rate to the baseline value and recalculates when there is no opportunity', () => {
      component.currentModification.exploreOppsShowFlowRate = { hasOpportunity: false, display: 'Reduce System Flow Rate' };
      component.baselineFieldDataForm.controls.flowRate.setValue(75);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.toggleFlowRate();

      expect(component.modificationFieldDataForm.controls.flowRate.value).toBe(75);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when there is a flow rate opportunity', () => {
      component.currentModification.exploreOppsShowFlowRate = { hasOpportunity: true, display: 'Reduce System Flow Rate' };
      component.modificationFieldDataForm.controls.flowRate.setValue(200);

      component.toggleFlowRate();

      expect(component.modificationFieldDataForm.controls.flowRate.value).toBe(200);
    });
  });

  describe('toggleHead', () => {
    it('resets modification head to the baseline value and recalculates when there is no opportunity', () => {
      component.currentModification.exploreOppsShowHead = { hasOpportunity: false, display: 'Reduce System Head Requirement' };
      component.baselineFieldDataForm.controls.head.setValue(80);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.toggleHead();

      expect(component.modificationFieldDataForm.controls.head.value).toBe(80);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when there is a head opportunity', () => {
      component.currentModification.exploreOppsShowHead = { hasOpportunity: true, display: 'Reduce System Head Requirement' };
      component.modificationFieldDataForm.controls.head.setValue(200);

      component.toggleHead();

      expect(component.modificationFieldDataForm.controls.head.value).toBe(200);
    });
  });

  describe('toggleSystemData', () => {
    it('resets modification operating hours and cost to baseline values and recalculates when there is no opportunity', () => {
      component.currentModification.exploreOppsShowSystemData = { hasOpportunity: false, display: 'Adjust Operational Data' };
      component.baselineOperationsForm.controls.operatingHours.setValue(4000);
      component.baselineOperationsForm.controls.costKwHr.setValue(0.09);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.toggleSystemData();

      expect(component.modificationOperationsForm.controls.operatingHours.value).toBe(4000);
      expect(component.modificationOperationsForm.controls.costKwHr.value).toBe(0.09);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when there is a system data opportunity', () => {
      component.currentModification.exploreOppsShowSystemData = { hasOpportunity: true, display: 'Adjust Operational Data' };
      component.modificationOperationsForm.controls.costKwHr.setValue(0.5);

      component.toggleSystemData();

      expect(component.modificationOperationsForm.controls.costKwHr.value).toBe(0.5);
    });
  });

  describe('focusField', () => {
    it('emits changeField with the given field name', () => {
      const emitted: string[] = [];
      component.changeField.subscribe(v => emitted.push(v));

      component.focusField('flowRate');

      expect(emitted).toEqual(['flowRate']);
    });
  });

  describe('showHeadToolModal', () => {
    it('emits openHeadToolModal', () => {
      const emitted: boolean[] = [];
      component.openHeadToolModal.subscribe(v => emitted.push(v));

      component.showHeadToolModal();

      expect(emitted).toEqual([true]);
    });
  });

  describe('operating hours modal', () => {
    it('opens the operating hours modal', () => {
      component.openOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeTrue();
    });

    it('closes the operating hours modal', () => {
      component.showOperatingHoursModal = true;
      component.closeOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeFalse();
    });

    it('applies the updated operating hours to the modification psat and form, recalculates, and closes the modal', () => {
      const newHours = { hoursPerYear: 5000 } as OperatingHours;
      component.showOperatingHoursModal = true;
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.updateOperatingHours(newHours);

      expect(component.modificationPsat.operatingHours).toBe(newHours);
      expect(component.modificationOperationsForm.controls.operatingHours.value).toBe(5000);
      expect(emitted).toEqual([true]);
      expect(component.showOperatingHoursModal).toBeFalse();
    });
  });

  describe('template visibility', () => {
    it('shows the flow rate and head checkboxes when isVFD is false', () => {
      expect(fixture.nativeElement.querySelector('#modifyFlowRate')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#modifyHead')).not.toBeNull();
    });

    it('hides the flow rate and head checkboxes when isVFD is true', () => {
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modifyFlowRate')).toBeNull();
      expect(fixture.nativeElement.querySelector('#modifyHead')).toBeNull();
    });

    it('hides the flow rate section when there is no opportunity', () => {
      expect(fixture.nativeElement.querySelector('#modificationFlowRate')).toBeNull();
    });

    it('shows the flow rate section when there is a flow rate opportunity and isVFD is false', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationFlowRate')).not.toBeNull();
    });

    it('hides the flow rate section when isVFD is true even with an opportunity', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      component.isVFD = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationFlowRate')).toBeNull();
    });

    it('shows the modification flow rate required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      component.modificationFieldDataForm.controls.flowRate.setValue(null);
      component.modificationFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the modification flow rate error when the control is valid', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Value Required');
    });

    it('shows the baseline flow rate warning when a warning exists and the control is valid and dirty', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      component.baselineWarnings = makeWarnings({ flowError: 'Flow rate seems high' });
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Flow rate seems high');
    });

    it('hides the baseline flow rate warning when there is no warning', () => {
      component.currentModification.exploreOppsShowFlowRate.hasOpportunity = true;
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Flow rate seems high');
    });

    it('hides the head section when there is no opportunity', () => {
      expect(fixture.nativeElement.querySelector('#modificationHead')).toBeNull();
    });

    it('shows the head section when there is a head opportunity and isVFD is false', () => {
      component.currentModification.exploreOppsShowHead.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationHead')).not.toBeNull();
    });

    it('shows the modification head required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowHead.hasOpportunity = true;
      component.modificationFieldDataForm.controls.head.setValue(null);
      component.modificationFieldDataForm.controls.head.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the system data sections when there is no opportunity', () => {
      expect(fixture.nativeElement.querySelector('#modificationCost')).toBeNull();
      expect(fixture.nativeElement.querySelector('#modificationOperatingHours')).toBeNull();
    });

    it('shows the system data sections when there is a system data opportunity', () => {
      component.currentModification.exploreOppsShowSystemData.hasOpportunity = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#modificationCost')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#modificationOperatingHours')).not.toBeNull();
    });

    it('shows the modification cost required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowSystemData.hasOpportunity = true;
      component.modificationOperationsForm.controls.costKwHr.setValue(null);
      component.modificationOperationsForm.controls.costKwHr.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('shows the modification operating hours required error when invalid and dirty', () => {
      component.currentModification.exploreOppsShowSystemData.hasOpportunity = true;
      component.modificationOperationsForm.controls.operatingHours.setValue(null);
      component.modificationOperationsForm.controls.operatingHours.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the operating hours modal when showOperatingHoursModal is false', () => {
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).toBeNull();
    });

    it('shows the operating hours modal when showOperatingHoursModal is true', () => {
      component.showOperatingHoursModal = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).not.toBeNull();
    });
  });
});

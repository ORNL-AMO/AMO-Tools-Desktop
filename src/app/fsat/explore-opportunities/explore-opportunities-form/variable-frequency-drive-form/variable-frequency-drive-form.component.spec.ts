import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { VariableFrequencyDriveFormComponent } from './variable-frequency-drive-form.component';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FanFieldDataWarnings } from '../../../fsat-warning.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class StubSettingsLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = { fanFlowRate: 'ft3/min', fanPressureMeasurement: 'inH2o' } as Settings;

function makeFieldDataForm(overrides: { flowRate?: number | null, inletPressure?: number | null, outletPressure?: number | null } = {}): UntypedFormGroup {
  const values = { flowRate: 1000, inletPressure: -1, outletPressure: 5, ...overrides };
  return new UntypedFormGroup({
    flowRate: new UntypedFormControl(values.flowRate, [Validators.required, Validators.min(0)]),
    inletPressure: new UntypedFormControl(values.inletPressure, [Validators.required]),
    outletPressure: new UntypedFormControl(values.outletPressure, [Validators.required]),
  });
}

function makeWarnings(outletPressureError: string | null = null): FanFieldDataWarnings {
  return {
    voltageError: null,
    ratedPowerError: null,
    suggestedVoltage: null,
    inletPressureError: null,
    outletPressureError,
    calcInletVelocityPressureError: null,
  };
}

describe('VariableFrequencyDriveFormComponent', () => {
  let component: VariableFrequencyDriveFormComponent;
  let fixture: ComponentFixture<VariableFrequencyDriveFormComponent>;

  /** @returns the three top-level explore-opps items (flow rate, inlet pressure, outlet pressure) */
  function getItems(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('li.explore-opps-item');
  }

  /** @returns the baseline (0) or modification (1) form within the given item index */
  function getForm(itemIndex: number, formIndex: 0 | 1): HTMLElement {
    return getItems()[itemIndex].querySelectorAll('form')[formIndex];
  }

  function setForms(
    baseline: UntypedFormGroup = makeFieldDataForm(),
    modification: UntypedFormGroup = makeFieldDataForm(),
    baselineWarnings: FanFieldDataWarnings = makeWarnings(),
    modificationWarnings: FanFieldDataWarnings = makeWarnings()
  ): void {
    fixture.componentRef.setInput('baselineFieldDataForm', baseline);
    fixture.componentRef.setInput('modificationFieldDataForm', modification);
    fixture.componentRef.setInput('baselineWarnings', baselineWarnings);
    fixture.componentRef.setInput('modificationWarnings', modificationWarnings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      declarations: [VariableFrequencyDriveFormComponent, StubSettingsLabelPipe],
      providers: [HelpPanelService, ModifyConditionsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VariableFrequencyDriveFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
  });

  describe('initialization', () => {
    it('creates the component', () => {
      setForms();
      expect(component).toBeTruthy();
    });

    it('renders the flow rate, inlet pressure and outlet pressure items each with a baseline and modification form', () => {
      setForms();
      expect(getItems().length).toBe(3);
      getItems().forEach(item => expect(item.querySelectorAll('form').length).toBe(2));
    });
  });

  describe('template visibility: flow rate errors', () => {
    it('hides every flow rate error when both controls are valid', () => {
      setForms();
      expect(getForm(0, 0).querySelector('.alert-danger')).toBeNull();
      expect(getForm(0, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('hides the baseline flow rate error when invalid but pristine', () => {
      setForms(makeFieldDataForm({ flowRate: null }));
      expect(getForm(0, 0).querySelector('.alert-danger')).toBeNull();
    });

    it('shows only "Value Required" for the baseline flow rate when it is empty and dirty', () => {
      const baseline = makeFieldDataForm({ flowRate: null });
      baseline.controls.flowRate.markAsDirty();
      setForms(baseline);
      const error: HTMLElement = getForm(0, 0).querySelector('.alert-danger');
      expect(error).not.toBeNull();
      expect(error.textContent).toContain('Value Required');
      expect(error.textContent).not.toContain("can't be less than");
      expect(getForm(0, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('shows only the min message for the baseline flow rate when below minimum', () => {
      const baseline = makeFieldDataForm({ flowRate: -5 });
      baseline.controls.flowRate.markAsDirty();
      setForms(baseline);
      const error: HTMLElement = getForm(0, 0).querySelector('.alert-danger');
      expect(error.textContent).toContain("Value can't be less than");
      expect(error.textContent).not.toContain('Value Required');
    });

    it('hides the modification flow rate error when invalid but pristine', () => {
      setForms(undefined, makeFieldDataForm({ flowRate: null }));
      expect(getForm(0, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('shows only "Value Required" for the modification flow rate when it is empty and dirty', () => {
      const modification = makeFieldDataForm({ flowRate: null });
      modification.controls.flowRate.markAsDirty();
      setForms(undefined, modification);
      const error: HTMLElement = getForm(0, 1).querySelector('.alert-danger');
      expect(error.textContent).toContain('Value Required');
      expect(error.textContent).not.toContain("can't be less than");
      expect(getForm(0, 0).querySelector('.alert-danger')).toBeNull();
    });

    it('shows only the min message for the modification flow rate when below minimum', () => {
      const modification = makeFieldDataForm({ flowRate: -5 });
      modification.controls.flowRate.markAsDirty();
      setForms(undefined, modification);
      const error: HTMLElement = getForm(0, 1).querySelector('.alert-danger');
      expect(error.textContent).toContain("Value can't be less than");
      expect(error.textContent).not.toContain('Value Required');
    });
  });

  describe('template visibility: inlet pressure errors', () => {
    it('hides every inlet pressure error when both controls are valid', () => {
      setForms();
      expect(getForm(1, 0).querySelector('.alert-danger')).toBeNull();
      expect(getForm(1, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('hides inlet pressure errors when invalid but pristine', () => {
      setForms(makeFieldDataForm({ inletPressure: null }), makeFieldDataForm({ inletPressure: null }));
      expect(getForm(1, 0).querySelector('.alert-danger')).toBeNull();
      expect(getForm(1, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('shows "Value Required" for the baseline inlet pressure only when empty and dirty', () => {
      const baseline = makeFieldDataForm({ inletPressure: null });
      baseline.controls.inletPressure.markAsDirty();
      setForms(baseline);
      expect(getForm(1, 0).querySelector('.alert-danger').textContent).toContain('Value Required');
      expect(getForm(1, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('shows "Value Required" for the modification inlet pressure only when empty and dirty', () => {
      const modification = makeFieldDataForm({ inletPressure: null });
      modification.controls.inletPressure.markAsDirty();
      setForms(undefined, modification);
      expect(getForm(1, 1).querySelector('.alert-danger').textContent).toContain('Value Required');
      expect(getForm(1, 0).querySelector('.alert-danger')).toBeNull();
    });
  });

  describe('template visibility: outlet pressure errors and warnings', () => {
    it('hides outlet pressure errors and warnings when valid and no warning message exists', () => {
      setForms();
      [0, 1].forEach((formIndex: 0 | 1) => {
        expect(getForm(2, formIndex).querySelector('.alert-danger')).toBeNull();
        expect(getForm(2, formIndex).querySelector('.alert-warning')).toBeNull();
      });
    });

    it('hides outlet pressure errors when invalid but pristine', () => {
      setForms(makeFieldDataForm({ outletPressure: null }), makeFieldDataForm({ outletPressure: null }));
      expect(getForm(2, 0).querySelector('.alert-danger')).toBeNull();
      expect(getForm(2, 1).querySelector('.alert-danger')).toBeNull();
    });

    it('shows "Value Required" for the baseline outlet pressure and no warning when empty and dirty', () => {
      const baseline = makeFieldDataForm({ outletPressure: null });
      baseline.controls.outletPressure.markAsDirty();
      setForms(baseline, undefined, makeWarnings('Outlet pressure warning'));
      expect(getForm(2, 0).querySelector('.alert-danger').textContent).toContain('Value Required');
      expect(getForm(2, 0).querySelector('.alert-warning')).toBeNull();
    });

    it('shows "Value Required" for the modification outlet pressure and no warning when empty and dirty', () => {
      const modification = makeFieldDataForm({ outletPressure: null });
      modification.controls.outletPressure.markAsDirty();
      setForms(undefined, modification, makeWarnings(), makeWarnings('Outlet pressure warning'));
      expect(getForm(2, 1).querySelector('.alert-danger').textContent).toContain('Value Required');
      expect(getForm(2, 1).querySelector('.alert-warning')).toBeNull();
    });

    it('hides the baseline warning when the control is pristine', () => {
      setForms(undefined, undefined, makeWarnings('Outlet pressure warning'));
      expect(getForm(2, 0).querySelector('.alert-warning')).toBeNull();
    });

    it('shows the baseline warning message when a warning exists and the control is valid and dirty', () => {
      const baseline = makeFieldDataForm();
      baseline.controls.outletPressure.markAsDirty();
      setForms(baseline, undefined, makeWarnings('Outlet pressure warning'));
      const warning: HTMLElement = getForm(2, 0).querySelector('.alert-warning');
      expect(warning).not.toBeNull();
      expect(warning.textContent).toContain('Outlet pressure warning');
      expect(getForm(2, 1).querySelector('.alert-warning')).toBeNull();
    });

    it('hides the modification warning when the control is pristine', () => {
      setForms(undefined, undefined, makeWarnings(), makeWarnings('Outlet pressure warning'));
      expect(getForm(2, 1).querySelector('.alert-warning')).toBeNull();
    });

    it('shows the modification warning message when a warning exists and the control is valid and dirty', () => {
      const modification = makeFieldDataForm();
      modification.controls.outletPressure.markAsDirty();
      setForms(undefined, modification, makeWarnings(), makeWarnings('Outlet pressure warning'));
      const warning: HTMLElement = getForm(2, 1).querySelector('.alert-warning');
      expect(warning).not.toBeNull();
      expect(warning.textContent).toContain('Outlet pressure warning');
      expect(getForm(2, 0).querySelector('.alert-warning')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => setForms());

    it('emits showPressureModal with "inlet" when Estimate Inlet Pressure is clicked', () => {
      const emitted: string[] = [];
      component.showPressureModal.subscribe((value: string) => emitted.push(value));

      getForm(1, 1).querySelector<HTMLElement>('a.click-link').click();

      expect(emitted).toEqual(['inlet']);
    });

    it('emits showPressureModal with "outlet" when Estimate Outlet Pressure is clicked', () => {
      const emitted: string[] = [];
      component.showPressureModal.subscribe((value: string) => emitted.push(value));

      getForm(2, 1).querySelector<HTMLElement>('a.click-link').click();

      expect(emitted).toEqual(['outlet']);
    });

    it('emits emitCalculate when a modification input changes', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      getForm(0, 1).querySelector<HTMLInputElement>('[formControlName="flowRate"]').dispatchEvent(new Event('input'));

      expect(emitted).toEqual([true]);
    });
  });
});

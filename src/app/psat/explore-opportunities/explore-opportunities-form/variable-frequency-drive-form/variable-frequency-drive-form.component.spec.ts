import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { VariableFrequencyDriveFormComponent } from './variable-frequency-drive-form.component';
import { FieldDataWarnings } from '../../../psat-warning.service';
import { Settings } from '../../../../shared/models/settings';
import { pumpTypesConstant, driveConstants } from '../../../psatConstants';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;

function makeFieldDataForm(overrides: { flowRate?: number; head?: number } = {}): UntypedFormGroup {
  return new UntypedFormGroup({
    flowRate: new UntypedFormControl(overrides.flowRate ?? 100, [Validators.required, Validators.max(10000), Validators.min(0)]),
    head: new UntypedFormControl(overrides.head ?? 100, [Validators.required, Validators.max(10000), Validators.min(0)]),
  });
}

function makeWarnings(overrides: Partial<FieldDataWarnings> = {}): FieldDataWarnings {
  return { flowError: null, voltageError: null, measuredPowerOrCurrentError: null, suggestedVoltage: null, ...overrides };
}

describe('VariableFrequencyDriveFormComponent', () => {
  let component: VariableFrequencyDriveFormComponent;
  let fixture: ComponentFixture<VariableFrequencyDriveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedPipesModule],
      declarations: [VariableFrequencyDriveFormComponent],
      providers: [ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VariableFrequencyDriveFormComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.exploreModIndex = 0;
    component.baselineFieldDataForm = makeFieldDataForm();
    component.modificationFieldDataForm = makeFieldDataForm();
    component.baselineFieldDataWarnings = makeWarnings();
    component.modificationFieldDataWarnings = makeWarnings();
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns pump type and drive constants', () => {
      expect(component.pumpTypes).toBe(pumpTypesConstant);
      expect(component.drives).toBe(driveConstants);
    });
  });

  describe('calculate', () => {
    it('emits emitCalculate', () => {
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe(v => emitted.push(v));

      component.calculate();

      expect(emitted).toEqual([true]);
    });
  });

  describe('focusField', () => {
    it('emits changeField with the given field name', () => {
      const emitted: string[] = [];
      component.changeField.subscribe(v => emitted.push(v));

      component.focusField('head');

      expect(emitted).toEqual(['head']);
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

  describe('template visibility', () => {
    it('hides the baseline flow rate error when the control is valid', () => {
      expect(fixture.nativeElement.textContent).not.toContain('Value Required');
    });

    it('shows the baseline flow rate required error when invalid and dirty', () => {
      component.baselineFieldDataForm.controls.flowRate.setValue(null);
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('hides the baseline flow rate warning when there is no warning', () => {
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('seems high');
    });

    it('shows the baseline flow rate warning when a warning exists and the control is valid and dirty', () => {
      component.baselineFieldDataWarnings = makeWarnings({ flowError: 'Flow rate seems high' });
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Flow rate seems high');
    });

    it('hides the baseline flow rate warning when the control is invalid even if a warning exists', () => {
      component.baselineFieldDataWarnings = makeWarnings({ flowError: 'Flow rate seems high' });
      component.baselineFieldDataForm.controls.flowRate.setValue(null);
      component.baselineFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Flow rate seems high');
    });

    it('shows the modification flow rate required error when invalid and dirty', () => {
      component.modificationFieldDataForm.controls.flowRate.setValue(null);
      component.modificationFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('shows the modification flow rate warning when a warning exists and the control is valid and dirty', () => {
      component.modificationFieldDataWarnings = makeWarnings({ flowError: 'Flow rate seems high' });
      component.modificationFieldDataForm.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Flow rate seems high');
    });

    it('hides the baseline head error when the control is valid', () => {
      expect(fixture.nativeElement.querySelector('label[for="modificationHead"]')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Value Required');
    });

    it('shows the baseline head required error when invalid and dirty', () => {
      component.baselineFieldDataForm.controls.head.setValue(null);
      component.baselineFieldDataForm.controls.head.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });

    it('shows the modification head required error when invalid and dirty', () => {
      component.modificationFieldDataForm.controls.head.setValue(null);
      component.modificationFieldDataForm.controls.head.markAsDirty();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });
  });
});

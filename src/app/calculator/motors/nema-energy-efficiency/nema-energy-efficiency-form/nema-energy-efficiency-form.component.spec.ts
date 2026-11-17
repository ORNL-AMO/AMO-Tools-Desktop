import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NemaEnergyEfficiencyFormComponent } from './nema-energy-efficiency-form.component';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { powerMeasurement: 'hp', unitsOfMeasure: 'Imperial' } as Settings;

function makeNemaForm(overrides: { frequency?: number, horsePower?: number, efficiencyClass?: number, motorRPM?: number, efficiency?: number | string } = {}): UntypedFormGroup {
  const values = { frequency: 60, horsePower: 200, efficiencyClass: 0, motorRPM: 1200, efficiency: '', ...overrides };
  return new UntypedFormBuilder().group({
    frequency: [values.frequency, [Validators.required]],
    horsePower: [values.horsePower, [Validators.required, Validators.min(0)]],
    efficiencyClass: [values.efficiencyClass, [Validators.required]],
    motorRPM: [values.motorRPM, [Validators.required]],
    efficiency: [values.efficiency, [Validators.min(1), Validators.max(100)]]
  });
}

describe('NemaEnergyEfficiencyFormComponent', () => {
  let component: NemaEnergyEfficiencyFormComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyFormComponent>;
  let calculateSpy: jasmine.Spy;
  let changeFieldSpy: jasmine.Spy;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getAlertMessages(inputId: string): Array<string> | null {
    const alert = query('#' + inputId).closest('.form-group').querySelector('.alert-danger');
    if (!alert) {
      return null;
    }
    return Array.from(alert.querySelectorAll('span')).map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function setDirtyValue(controlName: string, value: number | string): void {
    component.nemaForm.controls[controlName].setValue(value);
    component.nemaForm.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(form: UntypedFormGroup = makeNemaForm()): void {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyFormComponent);
    component = fixture.componentInstance;
    calculateSpy = jasmine.createSpy('emitCalculate');
    changeFieldSpy = jasmine.createSpy('changeField');
    component.emitCalculate.subscribe(calculateSpy);
    component.changeField.subscribe(changeFieldSpy);
    fixture.componentRef.setInput('nemaForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NemaEnergyEfficiencyFormComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the efficiency classes and emits a calculation', () => {
      createComponent();
      expect(component.efficiencyClasses.map(option => option.value)).toEqual([0, 1, 2, 3]);
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('renders the power unit from settings', () => {
      createComponent();
      expect(query('#horsePower').closest('.input-group').querySelector('.units').textContent.trim()).toBe('hp');
    });
  });

  describe('option lists', () => {
    it('renders one frequency option per frequency', () => {
      createComponent();
      const options = Array.from(fixture.nativeElement.querySelectorAll('#frequency option'))
        .map((option: HTMLElement) => option.textContent.trim());
      expect(options).toEqual(['50 Hz', '60 Hz']);
    });

    it('renders one efficiency class option per class', () => {
      createComponent();
      const options = Array.from(fixture.nativeElement.querySelectorAll('#efficiencyClass option'))
        .map((option: HTMLElement) => option.textContent.trim());
      expect(options).toEqual(['Standard Efficiency', 'Energy Efficient', 'Premium Efficient', 'Specified']);
    });

    it('does not render the commented-out motor power select', () => {
      createComponent();
      expect(query('select#horsePower')).toBeNull();
    });
  });

  describe('validator toggling (modifyPowerArrays)', () => {
    it('makes efficiency required when the class is Specified', () => {
      createComponent(makeNemaForm({ efficiencyClass: 3, efficiency: '' }));
      expect(component.nemaForm.controls.efficiency.hasError('required')).toBeTrue();
    });

    it('clears efficiency validators and value when the class is not Specified', () => {
      const form = makeNemaForm({ efficiencyClass: 3, efficiency: 150 });
      createComponent(form);
      form.controls.efficiencyClass.setValue(1);
      calculateSpy.calls.reset();
      component.modifyPowerArrays();
      expect(form.controls.efficiency.value).toBeNull();
      form.controls.efficiency.setValue(150);
      expect(form.controls.efficiency.valid).toBeTrue();
      expect(calculateSpy).toHaveBeenCalledTimes(1);
    });

    it('re-applies validators when switching back to Specified', () => {
      const form = makeNemaForm({ efficiencyClass: 0 });
      createComponent(form);
      form.controls.efficiencyClass.setValue(3);
      component.modifyPowerArrays();
      form.controls.efficiency.setValue(0);
      expect(form.controls.efficiency.hasError('min')).toBeTrue();
      form.controls.efficiency.setValue(101);
      expect(form.controls.efficiency.hasError('max')).toBeTrue();
    });
  });

  describe('user actions', () => {
    it('addNum increments motor RPM and emits a calculation', () => {
      createComponent(makeNemaForm({ motorRPM: 1200 }));
      calculateSpy.calls.reset();
      component.addNum('motorRPM');
      expect(component.nemaForm.controls.motorRPM.value).toBe(1201);
      expect(calculateSpy).toHaveBeenCalledTimes(1);
    });

    it('subtractNum decrements motor RPM and emits a calculation', () => {
      createComponent(makeNemaForm({ motorRPM: 1200 }));
      calculateSpy.calls.reset();
      component.subtractNum('motorRPM');
      expect(component.nemaForm.controls.motorRPM.value).toBe(1199);
      expect(calculateSpy).toHaveBeenCalledTimes(1);
    });

    it('subtractNum does not go below 1', () => {
      createComponent(makeNemaForm({ motorRPM: 1 }));
      component.subtractNum('motorRPM');
      expect(component.nemaForm.controls.motorRPM.value).toBe(1);
    });

    it('addNum and subtractNum ignore other fields but still emit a calculation', () => {
      createComponent(makeNemaForm({ motorRPM: 1200 }));
      calculateSpy.calls.reset();
      component.addNum('horsePower');
      component.subtractNum('horsePower');
      expect(component.nemaForm.controls.motorRPM.value).toBe(1200);
      expect(component.nemaForm.controls.horsePower.value).toBe(200);
      expect(calculateSpy).toHaveBeenCalledTimes(2);
    });

    it('focusField emits the focused field name', () => {
      createComponent();
      component.focusField('motorRPM');
      expect(changeFieldSpy).toHaveBeenCalledWith('motorRPM');
    });
  });

  describe('template visibility', () => {
    describe('horse power errors', () => {
      it('hides the alert while the control is valid', () => {
        createComponent();
        setDirtyValue('horsePower', 100);
        expect(getAlertMessages('horsePower')).toBeNull();
      });

      it('hides the alert while the control is invalid but pristine', () => {
        createComponent(makeNemaForm({ horsePower: null }));
        expect(component.nemaForm.controls.horsePower.invalid).toBeTrue();
        expect(getAlertMessages('horsePower')).toBeNull();
      });

      it('shows only the required message when empty and dirty', () => {
        createComponent();
        setDirtyValue('horsePower', null);
        expect(getAlertMessages('horsePower')).toEqual(['Value required.']);
      });

      it('shows only the min message when below the minimum and dirty', () => {
        createComponent();
        setDirtyValue('horsePower', -1);
        expect(getAlertMessages('horsePower')).toEqual(['Value must be greater than 0 hp.']);
      });
    });

    describe('motor RPM errors', () => {
      it('hides the alert while the control is valid', () => {
        createComponent();
        setDirtyValue('motorRPM', 1800);
        expect(getAlertMessages('motorRPM')).toBeNull();
      });

      it('hides the alert while the control is invalid but pristine', () => {
        createComponent(makeNemaForm({ motorRPM: null }));
        expect(getAlertMessages('motorRPM')).toBeNull();
      });

      it('shows the required message when empty and dirty', () => {
        createComponent();
        setDirtyValue('motorRPM', null);
        expect(getAlertMessages('motorRPM')).toEqual(['Value required.']);
      });
    });

    describe('specified efficiency', () => {
      [0, 1, 2].forEach(efficiencyClass => {
        it(`hides the efficiency field for efficiency class ${efficiencyClass}`, () => {
          createComponent(makeNemaForm({ efficiencyClass: efficiencyClass }));
          expect(query('#efficiency')).toBeNull();
        });
      });

      it('shows the efficiency field when the class is Specified', () => {
        createComponent(makeNemaForm({ efficiencyClass: 3, efficiency: 95 }));
        expect(query('#efficiency')).not.toBeNull();
      });

      it('shows the efficiency field after switching to Specified', () => {
        createComponent(makeNemaForm({ efficiencyClass: 0 }));
        component.nemaForm.controls.efficiencyClass.setValue(3);
        fixture.detectChanges();
        expect(query('#efficiency')).not.toBeNull();
      });

      it('hides the efficiency alert when Specified and the value is valid', () => {
        createComponent(makeNemaForm({ efficiencyClass: 3, efficiency: 95 }));
        setDirtyValue('efficiency', 90);
        expect(getAlertMessages('efficiency')).toBeNull();
      });

      it('hides the efficiency alert when Specified, invalid, and pristine', () => {
        createComponent(makeNemaForm({ efficiencyClass: 3, efficiency: '' }));
        expect(component.nemaForm.controls.efficiency.invalid).toBeTrue();
        expect(getAlertMessages('efficiency')).toBeNull();
      });

      const efficiencyErrorCases: Array<{ name: string, value: number, message: string }> = [
        { name: 'required', value: null, message: 'Value required.' },
        { name: 'max', value: 101, message: 'Value can\'t be greater than 100 %.' },
        { name: 'min', value: 0, message: 'Value can\'t be less than 1 %.' },
      ];
      efficiencyErrorCases.forEach(({ name, value, message }) => {
        it(`shows only the ${name} message when dirty`, () => {
          createComponent(makeNemaForm({ efficiencyClass: 3, efficiency: 95 }));
          setDirtyValue('efficiency', value);
          expect(getAlertMessages('efficiency')).toEqual([message]);
        });
      });
    });
  });
});

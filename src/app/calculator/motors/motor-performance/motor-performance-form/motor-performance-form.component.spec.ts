import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MotorPerformanceFormComponent } from './motor-performance-form.component';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

const MOCK_SETTINGS = { powerMeasurement: 'hp' } as Settings;

function makePerformanceForm(overrides: Partial<{ frequency: number, horsePower: number, motorRPM: number, efficiencyClass: number, motorVoltage: number, fullLoadAmps: number, efficiency: number }> = {}): UntypedFormGroup {
  const values = {
    frequency: 60,
    horsePower: 200,
    motorRPM: 1780,
    efficiencyClass: 1,
    motorVoltage: 460,
    fullLoadAmps: 225.4,
    efficiency: 0,
    ...overrides,
  };
  return new UntypedFormBuilder().group({
    frequency: [values.frequency, [Validators.required]],
    horsePower: [values.horsePower, [Validators.required, Validators.min(0)]],
    motorRPM: [values.motorRPM, [Validators.required, GreaterThanValidator.greaterThan(0)]],
    efficiencyClass: [values.efficiencyClass, [Validators.required]],
    motorVoltage: [values.motorVoltage, [Validators.required]],
    fullLoadAmps: [values.fullLoadAmps, [Validators.required]],
    sizeMargin: [1, [Validators.required]],
    efficiency: [values.efficiency, [Validators.min(0), Validators.max(100)]],
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('MotorPerformanceFormComponent', () => {
  let component: MotorPerformanceFormComponent;
  let fixture: ComponentFixture<MotorPerformanceFormComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let form: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getErrorSpan(controlName: string): HTMLElement | null {
    const input = query(`[formControlName="${controlName}"]`);
    return input.closest('.form-group').querySelector('span.alert-danger.pull-right');
  }

  function getErrorMessages(controlName: string): Array<string> {
    return Array.from(getErrorSpan(controlName).querySelectorAll('span'))
      .map((span: HTMLElement) => normalize(span.textContent));
  }

  function setDirtyValue(controlName: string, value: number): void {
    form.controls[controlName].setValue(value);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(formOverrides = {}): void {
    form = makePerformanceForm(formOverrides);
    fixture = TestBed.createComponent(MotorPerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('performanceForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['setFormFullLoadAmps']);
    psatServiceSpy.setFormFullLoadAmps.and.callFake((performanceForm: UntypedFormGroup) => {
      performanceForm.controls.fullLoadAmps.setValue(230.5);
      return performanceForm;
    });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MotorPerformanceFormComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(() => {
      createComponent();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('loads the efficiency classes from the motor efficiency constants', () => {
      expect(component.efficiencyClasses).toBe(motorEfficiencyConstants);
    });

    it('starts with no full-load amps estimation error', () => {
      expect(component.calcFLAError).toBeFalse();
    });
  });

  describe('RPM validator toggling', () => {
    const cases: Array<{ efficiencyClass: number, frequency: number, min: number }> = [
      { efficiencyClass: 0, frequency: 60, min: 540 },
      { efficiencyClass: 0, frequency: 50, min: 450 },
      { efficiencyClass: 1, frequency: 60, min: 540 },
      { efficiencyClass: 1, frequency: 50, min: 450 },
      { efficiencyClass: 2, frequency: 60, min: 1080 },
      { efficiencyClass: 2, frequency: 50, min: 900 },
    ];

    cases.forEach(({ efficiencyClass, frequency, min }) => {
      it(`applies a ${min} RPM minimum for efficiency class ${efficiencyClass} at ${frequency} Hz`, () => {
        createComponent({ efficiencyClass: efficiencyClass, frequency: frequency });
        const motorRPM = form.controls.motorRPM;
        motorRPM.setValue(min);
        expect(motorRPM.valid).toBeTrue();
        motorRPM.setValue(min - 1);
        expect(motorRPM.errors.min).toEqual({ min: min, actual: min - 1 });
        motorRPM.setValue(null);
        expect(motorRPM.errors.required).toBeTruthy();
      });
    });

    it('marks a populated motor RPM as dirty so an out-of-range value shows immediately', () => {
      createComponent({ efficiencyClass: 2, frequency: 60, motorRPM: 1000 });
      expect(form.controls.motorRPM.dirty).toBeTrue();
      expect(form.controls.motorRPM.errors.min).toBeTruthy();
    });

    it('leaves an empty motor RPM pristine', () => {
      createComponent({ efficiencyClass: 1, frequency: 60, motorRPM: null });
      expect(form.controls.motorRPM.pristine).toBeTrue();
    });

    it('keeps the original RPM validators for a specified efficiency class', () => {
      createComponent({ efficiencyClass: 3, motorRPM: 100 });
      expect(form.controls.motorRPM.valid).toBeTrue();
      expect(form.controls.motorRPM.pristine).toBeTrue();
    });

    it('re-applies RPM validation when the efficiency class changes', () => {
      createComponent({ efficiencyClass: 1, frequency: 60, motorRPM: 1000 });
      expect(form.controls.motorRPM.valid).toBeTrue();
      form.controls.efficiencyClass.setValue(2);
      component.changePowerArrays();
      expect(form.controls.motorRPM.errors.min).toEqual({ min: 1080, actual: 1000 });
    });
  });

  describe('efficiency validator toggling', () => {
    it('makes efficiency required when the specified efficiency class is selected', () => {
      createComponent();
      form.controls.efficiencyClass.setValue(3);
      component.modifyPowerArrays();
      expect(form.controls.efficiency.hasValidator(Validators.required)).toBeTrue();
    });

    it('does not make efficiency required for a non-specified efficiency class', () => {
      createComponent();
      form.controls.efficiencyClass.setValue(2);
      component.modifyPowerArrays();
      expect(form.controls.efficiency.hasValidator(Validators.required)).toBeFalse();
    });
  });

  describe('user actions', () => {
    let calculateSpy: jasmine.Spy;
    let changeFieldSpy: jasmine.Spy;

    beforeEach(() => {
      createComponent();
      calculateSpy = jasmine.createSpy('calculate');
      changeFieldSpy = jasmine.createSpy('changeField');
      component.calculate.subscribe(calculateSpy);
      component.changeField.subscribe(changeFieldSpy);
    });

    it('emitChange emits calculate and clears the estimation error', () => {
      component.calcFLAError = true;
      component.emitChange();
      expect(calculateSpy).toHaveBeenCalledWith(true);
      expect(component.calcFLAError).toBeFalse();
    });

    it('changePowerArrays emits calculate', () => {
      component.changePowerArrays();
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('focusField emits the focused field name', () => {
      component.focusField('motorVoltage');
      expect(changeFieldSpy).toHaveBeenCalledWith('motorVoltage');
    });

    it('calculateFullLoadAmps estimates amps from the form and settings when the form is valid', () => {
      component.calculateFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).toHaveBeenCalledWith(form, MOCK_SETTINGS);
      expect(form.controls.fullLoadAmps.value).toBe(230.5);
      expect(calculateSpy).toHaveBeenCalledWith(true);
      expect(component.calcFLAError).toBeFalse();
    });

    it('calculateFullLoadAmps flags an error and does not estimate when a required input is invalid', () => {
      form.controls.motorVoltage.setValue(null);
      component.calculateFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).not.toHaveBeenCalled();
      expect(calculateSpy).not.toHaveBeenCalled();
      expect(component.calcFLAError).toBeTrue();
    });

    it('calculateFullLoadAmps flags an error when a specified efficiency is invalid', () => {
      form.controls.efficiencyClass.setValue(3);
      form.controls.efficiency.setValue(150);
      component.calculateFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).not.toHaveBeenCalled();
      expect(component.calcFLAError).toBeTrue();
    });

    it('calculateFullLoadAmps ignores an invalid efficiency when the class is not specified', () => {
      form.controls.efficiency.setValue(150);
      component.calculateFullLoadAmps();
      expect(psatServiceSpy.setFormFullLoadAmps).toHaveBeenCalled();
    });
  });

  describe('template: option lists', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders one option per line frequency', () => {
      const options = Array.from(query('#frequency').querySelectorAll('option'))
        .map((option: HTMLElement) => normalize(option.textContent));
      expect(options).toEqual(['50 Hz', '60 Hz']);
    });

    it('renders one option per efficiency class', () => {
      const options = Array.from(query('#efficiencyClass').querySelectorAll('option'))
        .map((option: HTMLElement) => normalize(option.textContent));
      expect(options).toEqual(['Standard Efficiency', 'Energy Efficient', 'Premium Efficient', 'Specified']);
    });

    it('renders the motor power units from settings', () => {
      const units = query('#horsePower').closest('.input-group').querySelector('.units');
      expect(normalize(units.textContent)).toBe('hp');
    });
  });

  describe('template: field error messages', () => {
    beforeEach(() => {
      createComponent();
    });

    const fields = ['horsePower', 'motorRPM', 'motorVoltage', 'fullLoadAmps'];

    fields.forEach(controlName => {
      it(`hides the ${controlName} error while the value is valid`, () => {
        form.controls[controlName].markAsDirty();
        fixture.detectChanges();
        expect(getErrorSpan(controlName)).toBeNull();
      });

      it(`hides the ${controlName} error while an invalid value is pristine`, () => {
        form.controls[controlName].setValue(null);
        form.controls[controlName].markAsPristine();
        fixture.detectChanges();
        expect(getErrorSpan(controlName)).toBeNull();
      });

      it(`shows only the required message when ${controlName} is dirty and empty`, () => {
        setDirtyValue(controlName, null);
        expect(getErrorMessages(controlName)).toEqual(['Value required.']);
      });
    });

    it('shows only the minimum message for a negative motor power', () => {
      setDirtyValue('horsePower', -5);
      expect(getErrorMessages('horsePower')).toEqual(['Value cannot be less than 0 hp.']);
    });

    it('shows only the minimum message for a motor RPM below the efficiency class minimum', () => {
      setDirtyValue('motorRPM', 100);
      expect(getErrorMessages('motorRPM')).toEqual(['Motor RPM too small for selected efficiency class, should be higher than 540.']);
    });
  });

  describe('template: specified efficiency', () => {
    it('hides the efficiency field when the efficiency class is not specified', () => {
      createComponent({ efficiencyClass: 1 });
      expect(query('#efficiency')).toBeNull();
    });

    it('shows the efficiency field when the efficiency class is specified', () => {
      createComponent({ efficiencyClass: 3 });
      expect(query('#efficiency')).not.toBeNull();
    });

    it('hides the efficiency field again when the class changes away from specified', () => {
      createComponent({ efficiencyClass: 3 });
      form.controls.efficiencyClass.setValue(2);
      fixture.detectChanges();
      expect(query('#efficiency')).toBeNull();
    });

    it('hides the efficiency error while the specified efficiency is valid', () => {
      createComponent({ efficiencyClass: 3 });
      setDirtyValue('efficiency', 95);
      expect(getErrorSpan('efficiency')).toBeNull();
    });

    it('hides the efficiency error while an invalid efficiency is pristine', () => {
      createComponent({ efficiencyClass: 3 });
      form.controls.efficiency.setValue(150);
      fixture.detectChanges();
      expect(getErrorSpan('efficiency')).toBeNull();
    });

    const errorCases: Array<{ value: number, message: string }> = [
      { value: 150, message: 'Value can\'t be greater than 100 %.' },
      { value: -1, message: 'Value can\'t be less than 0 %.' },
    ];

    errorCases.forEach(({ value, message }) => {
      it(`shows only "${message}" for an efficiency of ${value}`, () => {
        createComponent({ efficiencyClass: 3 });
        setDirtyValue('efficiency', value);
        expect(getErrorMessages('efficiency')).toEqual([message]);
      });
    });

    it('shows only the required message for an empty efficiency once specified is selected', () => {
      createComponent({ efficiencyClass: 3 });
      component.modifyPowerArrays();
      setDirtyValue('efficiency', null);
      expect(getErrorMessages('efficiency')).toEqual(['Value required.']);
    });
  });

  describe('template: full-load amps estimation error', () => {
    function getEstimationError(): HTMLElement | null {
      return query('label[for="fullLoadAmps"] .alert-danger');
    }

    beforeEach(() => {
      createComponent();
    });

    it('hides the estimation error initially', () => {
      expect(getEstimationError()).toBeNull();
    });

    it('shows the estimation error after a failed estimate', () => {
      form.controls.horsePower.setValue(null);
      component.calculateFullLoadAmps();
      fixture.detectChanges();
      expect(normalize(getEstimationError().textContent)).toBe('The rest of the form must be valid before estimation.');
    });

    it('hides the estimation error again after the next change', () => {
      form.controls.horsePower.setValue(null);
      component.calculateFullLoadAmps();
      fixture.detectChanges();
      component.emitChange();
      fixture.detectChanges();
      expect(getEstimationError()).toBeNull();
    });
  });
});
